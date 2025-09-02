import React from "react";

type User = {
	name: string;
	profileImage: string;
} | null;

interface NavbarProps {
	user: User;
	onLogin: () => void;
	onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
	return (
		<nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-50">
			{/* Logo / Brand */}
			<h1 className="text-2xl font-bold text-blue-600 cursor-pointer">
				Blog App
			</h1>

			{/* Navigation Links */}
			<div className="hidden md:flex gap-6 text-gray-700 font-medium">
				<a href="/" className="hover:text-blue-500 transition">
					Home
				</a>
				<a href="/create" className="hover:text-blue-500 transition">
					Create Post
				</a>
			</div>

			{/* User Actions */}
			<div>
				{user ? (
					<div className="flex items-center gap-4">
						{/* Profile Image */}
						<img
							src={user.profileImage}
							alt={user.name}
							className="w-10 h-10 rounded-full object-cover border border-gray-300 cursor-pointer"
							title={user.name}
						/>
						{/* Logout Button */}
						<button
							onClick={onLogout}
							className="text-sm bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
						>
							Logout
						</button>
					</div>
				) : (
					<button
						onClick={onLogin}
						className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
					>
						Login
					</button>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
