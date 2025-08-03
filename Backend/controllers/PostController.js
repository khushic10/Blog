import Post from "../models/Post.js";
import stream from "stream";
import cloudinary from "../config/CloudinaryConfig.js";

// 🔹 Create Post with image upload
export const createPost = async (req, res) => {
	try {
		const { title, content } = req.body;
		const userId = req.user.id;

		if (!title || !content) {
			return res.status(400).json({ error: "Title and content are required" });
		}

		const imageUrls = [];

		if (req.files?.length) {
			for (const file of req.files) {
				const uploadStream = cloudinary.uploader.upload_stream(
					{ resource_type: "auto", folder: "posts" },
					async (error, result) => {
						if (error) {
							console.error("Cloudinary Upload Error:", error);
							return res.status(500).json({ error: "Image upload failed" });
						}
						imageUrls.push(result.secure_url);

						if (imageUrls.length === req.files.length) {
							const newPost = await Post.create({
								title,
								content,
								images: imageUrls,
								author: userId,
							});
							res.status(201).json({ message: "Post created", newPost });
						}
					}
				);
				const bufferStream = new stream.PassThrough();
				bufferStream.end(file.buffer);
				bufferStream.pipe(uploadStream);
			}
		} else {
			const newPost = await Post.create({
				title,
				content,
				images: [],
				author: userId,
			});
			res.status(201).json({ message: "Post created", newPost });
		}
	} catch (error) {
		console.error("Error creating Post:", error);
		res.status(500).json({ error: "Server error" });
	}
};

// 🔹 Get All Posts (with pagination)
export const getAllPosts = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		const total = await Post.countDocuments();
		const posts = await Post.find()
			.skip(skip)
			.limit(parseInt(limit))
			.sort({ createdAt: -1 })
			.populate("author", "name username profile");

		res.json({ total, page: +page, limit: +limit, posts });
	} catch (error) {
		console.error("Error fetching posts:", error);
		res.status(500).json({ error: "Server error" });
	}
};

// 🔹 Get Single Post
export const getPostById = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id).populate(
			"author",
			"name username profile"
		);
		if (!post) return res.status(404).json({ error: "Post not found" });
		res.json(post);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch post" });
	}
};

// 🔹 Update Post (including new image upload)
export const updatePost = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, content } = req.body;

		const post = await Post.findById(id);
		if (!post) return res.status(404).json({ error: "Post not found" });
		if (post.author.toString() !== req.user.id) {
			return res.status(403).json({ error: "Not authorized" });
		}

		const imageUrls = [];

		if (req.files?.length) {
			for (const file of req.files) {
				const uploadStream = cloudinary.uploader.upload_stream(
					{ resource_type: "auto", folder: "posts" },
					async (error, result) => {
						if (error) {
							console.error("Cloudinary Upload Error:", error);
							return res.status(500).json({ error: "Image upload failed" });
						}
						imageUrls.push(result.secure_url);
						if (imageUrls.length === req.files.length) {
							post.title = title || post.title;
							post.content = content || post.content;
							post.images = imageUrls;
							const updatedPost = await post.save();
							res.json({ message: "Post updated", updatedPost });
						}
					}
				);
				const bufferStream = new stream.PassThrough();
				bufferStream.end(file.buffer);
				bufferStream.pipe(uploadStream);
			}
		} else {
			post.title = title || post.title;
			post.content = content || post.content;
			const updatedPost = await post.save();
			res.json({ message: "Post updated", updatedPost });
		}
	} catch (error) {
		console.error("Error updating post:", error);
		res.status(500).json({ error: "Server error" });
	}
};

// 🔹 Delete Post and its images from Cloudinary
export const deletePost = async (req, res) => {
	try {
		const { id } = req.params;
		const post = await Post.findById(id);
		if (!post) return res.status(404).json({ error: "Post not found" });

		if (post.author.toString() !== req.user.id) {
			return res.status(403).json({ error: "Not authorized" });
		}

		const deletePromises = post.images.map(async (url) => {
			const publicId = url.split("/").pop().split(".")[0];
			return cloudinary.uploader.destroy(`posts/${publicId}`);
		});
		await Promise.all(deletePromises);

		await post.deleteOne();
		res.json({ message: "Post deleted successfully" });
	} catch (error) {
		console.error("Error deleting post:", error);
		res.status(500).json({ error: "Server error" });
	}
};
