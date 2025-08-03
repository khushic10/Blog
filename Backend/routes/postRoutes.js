import express from "express";
import {
	createPost,
	getAllPosts,
	getPostById,
	updatePost,
	deletePost,
} from "../controllers/PostController.js";
import upload from "../middleware/MulterMiddleware.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/", getAllPosts);

router.get("/:id", getPostById);

router.post("/", verifyToken, upload.array("images"), createPost);

router.put("/:id", verifyToken, upload.array("images"), updatePost);

router.delete("/:id", verifyToken, deletePost);

export default router;
