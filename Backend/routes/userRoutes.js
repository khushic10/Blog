import express from "express";
import {
	registerUser,
	verifyEmail,
	loginUser,
} from "../controllers/UserController.js";
import upload from "../middleware/MulterMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("profile"), registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", loginUser);

export default router;
