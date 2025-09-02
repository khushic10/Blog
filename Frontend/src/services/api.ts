// src/services/api.ts
import axios from "axios";
import { API_BASE_URL } from "../config/Config";

const api = axios.create({
	baseURL: API_BASE_URL,
});

export default api;
