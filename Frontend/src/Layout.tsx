import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useState } from "react";

export default function Layout() {
	const [user, setUser] = useState<{
		name: string;
		profileImage: string;
	} | null>(null);

	const handleLogin = () => {
		setUser({
			name: "Khushi Chaudhary",
			profileImage: "https://i.pravatar.cc/150?img=3",
		});
	};

	const handleLogout = () => {
		setUser(null);
	};

	return (
		<div>
			<Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
			<Outlet />
		</div>
	);
}
