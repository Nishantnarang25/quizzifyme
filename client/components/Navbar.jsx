import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import {  FaCog, FaSignOutAlt, FaHome, FaPlusCircle, FaList, FaDoorOpen, FaUsers, FaInfoCircle } from 'react-icons/fa';
import CreateRoomForm from './CreateRoomForm';
import JoinRoomForm from './JoinRoomForm';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [modalType, setModalType] = useState(null); // "join" | "create" | null

    const handleLogout = () => {
        // Clear auth state
        logout();

        // Close any open modal
        setModalType(null);

        // Redirect to landing page
        navigate('/about/QuizzifyMe');
    };

    return (
        <aside className="w-64 h-screen bg-[#1F1F1F] text-white shadow-lg fixed left-0 top-0 flex flex-col justify-between z-50 border-r border-[#2F2F3F]">

            {/* Logo */}
            <div className="px-6 py-6 border-b border-[#2F2F3F]">
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#FBE483] to-[#F179E1] bg-clip-text text-transparent tracking-wide">
                    Quizzify Me
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-6 py-6 space-y-5">
                <NavItem to="/dashboard" icon={<FaHome />} label="Dashboard" />
                <NavItem to="/create-quiz" icon={<FaPlusCircle />} label="Create Quiz" />
                <NavItem to="/my-quizzes" icon={<FaList />} label="My Quizzes" />
                <SidebarButton onClick={() => setModalType("join")} icon={<FaDoorOpen />} label="Join Room" />
                <SidebarButton onClick={() => setModalType("create")} icon={<FaUsers />} label="Create Room" />
                <NavItem to="/about/QuizzifyMe" icon={<FaInfoCircle />} label="QuizzifyMe" />

            </nav>

            {/* User Info and Logout */}
            <div className="px-6 py-6 border-t border-[#2F2F3F]">
                {user ? (
                    <div>
                        <p className="font-semibold text-white">{user?.username}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <button
                            onClick={handleLogout}
                            className="mt-3 flex items-center gap-2 text-red-400 hover:text-red-300 transition"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                ) : (
                    <Login />
                )}
            </div>

            {/* Modals */}
            {modalType === "join" && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <JoinRoomForm onClose={() => setModalType(null)} />
  </div>
)}

{modalType === "create" && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <CreateRoomForm onClose={() => setModalType(null)} />
  </div>
)}

        </aside>
    );
};

// Navigation Link Component
const NavItem = ({ to, icon, label }) => (
    <Link
        to={to}
        className="flex items-center gap-3 text-base text-gray-300 hover:text-white transition duration-200"
    >
        {icon}
        <span>{label}</span>
    </Link>
);

// Sidebar Button Component (non-router)
const SidebarButton = ({ onClick, icon, label }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3 text-base text-gray-300 hover:text-white transition duration-200"
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default Navbar;
