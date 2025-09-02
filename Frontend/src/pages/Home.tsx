import React, { useEffect, useState } from "react";
import { getPosts } from "../services/postService";
import type { Post } from "../types/post";

const Home: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await getPosts();
				setPosts(response.posts);
			} catch (err) {
				setError(err + "Failed to load posts");
			} finally {
				setLoading(false);
			}
		};
		fetchPosts();
	}, []);

	if (loading) return <p className="text-center mt-10">Loading posts...</p>;
	if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

	return (
		<div className="max-w-3xl mx-auto mt-10 px-4">
			<h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
				Latest Blogs
			</h2>
			{posts.length === 0 ? (
				<p className="text-center text-gray-500">No posts found</p>
			) : (
				<div className="space-y-6">
					{posts.map((post) => (
						<div
							key={post._id}
							className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
						>
							<div className="flex items-center mb-3">
								<img
									src={post.author.profile}
									alt={post.author.name}
									className="w-10 h-10 rounded-full mr-3"
								/>
								<div>
									<p className="font-semibold">{post.author.name}</p>
									<p className="text-sm text-gray-500">
										@{post.author.username}
									</p>
								</div>
							</div>
							<h3 className="text-xl font-bold mb-2">{post.title}</h3>
							<p className="text-gray-600 mb-3">{post.content}</p>
							{post.images.length > 0 && (
								<div className="grid grid-cols-2 gap-2">
									{post.images.map((img, index) => (
										<img
											key={index}
											src={img}
											alt="post"
											className="w-full h-40 object-cover rounded"
										/>
									))}
								</div>
							)}
							<p className="text-gray-400 text-sm mt-2">
								{new Date(post.createdAt).toLocaleDateString()}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Home;
