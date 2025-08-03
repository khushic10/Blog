import dotenv from "dotenv";

dotenv.config();
const USERNAME = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
import mongoose from "mongoose";

async function connectToDatabase() {
	const uri = `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0.chs3olj.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0`;

	try {
		await mongoose.connect(uri);
		console.log("Connected to MongoDB Atlas");
	} catch (err) {
		console.error("Error connecting to MongoDB Atlas", err);
		throw err;
	}
}

export { connectToDatabase };
