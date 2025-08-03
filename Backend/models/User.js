import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: { type: String },
		email: { type: String, unique: true, required: true },
		username: { type: String, unique: true, required: true },
		phoneNumber: { type: String, unique: true, required: true },
		address: { type: String, default: "" },
		password: { type: String },
		profile: { type: String },
		isVerified: { type: Boolean, default: false },
		verificationToken: { type: String },
	},
	{ timestamps: true }
);

export default mongoose.model("User", userSchema);
