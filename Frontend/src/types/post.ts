// src/types/post.ts
export interface Author {
	_id: string;
	name: string;
	username: string;
	profile: string;
}

export interface Post {
	_id: string;
	title: string;
	content: string;
	author: Author;
	images: string[];
	createdAt: string;
	updatedAt: string;
}

export interface PostsResponse {
	total: number;
	page: number;
	limit: number;
	posts: Post[];
}
