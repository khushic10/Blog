import api from "./api";
import type { PostsResponse } from "../types/post";

export const getPosts = async (): Promise<PostsResponse> => {
	const { data } = await api.get<PostsResponse>("/posts");
	return data;
};
