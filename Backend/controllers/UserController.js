import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cloudinary from "../config/CloudinaryConfig.js";
import stream from "stream";

dotenv.config();

const generateToken = (id) =>
	jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

// Configure nodemailer
const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// 🔹 Register User & Upload Profile Image to Cloudinary
export const registerUser = async (req, res) => {
	try {
		const { name, email, username, phoneNumber, address, password } = req.body;
		const fieldErrors = {};

		// Validate required fields
		if (!name) fieldErrors.name = "Name is required";
		if (!email) fieldErrors.email = "Email is required";
		if (!phoneNumber) fieldErrors.phoneNumber = "Phone number is required";
		if (!password) fieldErrors.password = "Password is required";

		if (Object.keys(fieldErrors).length > 0) {
			return res.status(400).json({ errors: fieldErrors });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			fieldErrors.email = "Invalid email format";
		}

		// Validate phone number format
		const phoneRegex = /^[0-9]{10}$/;
		if (!phoneRegex.test(phoneNumber)) {
			fieldErrors.phoneNumber = "Phone number must be 10 digits";
		}

		if (Object.keys(fieldErrors).length > 0) {
			return res.status(400).json({ errors: fieldErrors });
		}

		// Check if email, username or phone exists
		const errors = {};
		if (await User.findOne({ email })) errors.email = "Email is already in use";
		if (await User.findOne({ username }))
			errors.username = "Username is already in use";
		if (await User.findOne({ phoneNumber }))
			errors.phoneNumber = "Phone number is already in use";

		if (Object.keys(errors).length > 0) {
			return res.status(409).json({ errors });
		}

		// Check profile image provided
		if (!req.file) {
			return res
				.status(400)
				.json({ errors: { profile: "Profile image is required" } });
		}

		// Hash password before upload
		const hashedPassword = await bcrypt.hash(password, 10);
		const verificationToken = crypto.randomBytes(32).toString("hex");

		// Upload to Cloudinary
		const uploadStream = cloudinary.uploader.upload_stream(
			{ resource_type: "auto", folder: "user_profiles" },
			async (error, result) => {
				if (error) {
					console.error("Cloudinary Upload Error:", error);
					return res
						.status(500)
						.json({ errors: { profile: "Image upload failed" } });
				}

				// Create user after upload success
				const user = await User.create({
					name,
					email,
					username,
					phoneNumber,
					address,
					password: hashedPassword,
					profile: result.secure_url,
					verificationToken,
				});

				// Send verification email
				const verifyUrl = `http://localhost:5000/api/users/verify/${verificationToken}`;
				await transporter.sendMail({
					to: user.email,
					subject: "Verify your email",
					html: `
            <p>Hello ${user.name},</p>
            <p>Click the link below to verify your email:</p>
            <a href="${verifyUrl}">Verify Email</a>
          `,
				});

				// Final success response
				return res.status(201).json({
					message: "Registration successful. Check your email to verify.",
					userId: user._id,
					profile: result.secure_url,
				});
			}
		);

		// Pipe image buffer into cloudinary upload stream
		const bufferStream = new stream.PassThrough();
		bufferStream.end(req.file.buffer);
		bufferStream.pipe(uploadStream);

		// Return here to prevent continuing and sending another response
		return;
	} catch (error) {
		console.error("Registration error:", error);
		res
			.status(500)
			.json({ message: "Registration failed", error: error.message });
	}
};

// 🔹 Verify Email Token
export const verifyEmail = async (req, res) => {
	const { token } = req.params;

	try {
		const user = await User.findOne({ verificationToken: token });

		if (!user) {
			return res
				.status(400)
				.json({ message: "Invalid or expired verification token" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		await user.save();

		res.json({ message: "Email verified successfully. You can now log in." });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Verification failed", error: error.message });
	}
};

// 🔹 Login (only if email is verified)
export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!user.isVerified) {
			return res
				.status(403)
				.json({ message: "Please verify your email before logging in." });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(401).json({ message: "Invalid password" });

		const token = generateToken(user._id);
		res.json({ user, token });
	} catch (error) {
		res.status(500).json({ message: "Login failed", error: error.message });
	}
};
