import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ error: "Access denied, token missing" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		console.error("JWT Verification Error:", error);

		// If token is expired, send 401
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token expired" });
		}

		// Other invalid token cases
		res.status(403).json({ error: "Invalid token" });
	}
};
