import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';

const JoinRoomForm = ({ onClose }) => {
    const socket = useSocket();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        if (!socket) return;

        const handleRoomJoined = ({ roomId }) => {
            console.log(`✅ Successfully joined room: ${roomId}`);
            onClose?.();
            navigate(`/quiz/waiting-room/${roomId}`);
        };

        const handleError = (err) => {
            console.error('❌ Error while joining room:', err);
            setError(err.message || err);
        };

        socket.on('roomJoined', handleRoomJoined);
        socket.on('error', handleError);

        return () => {
            socket.off('roomJoined', handleRoomJoined);
            socket.off('error', handleError);
        };
    }, [socket, navigate, onClose]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy Room ID:', err);
        }
    };

    const handleRoomJoining = () => {
        if (!roomId) return setError('Room ID is required');
        if (!socket || !socket.id) return setError('Unable to connect to server. Try again.');

        setError('');
        socket.emit('joinRoomUsingCode', {
            user: user.username,
            name,
            roomId,
            socketId: socket.id,
        });
    };

    return (
        <div className="bg-[#1E1E2F] text-white p-8 rounded-3xl shadow-[0_0_25px_#877BFC] w-full max-w-lg mx-auto animate-popIn border border-[#877BFC] relative">
            <button
                className="absolute top-3 right-4 text-gray-400 hover:text-pink-400 text-4xl transition-all"
                onClick={onClose}
            >
                ×
            </button>

            {/* Top Icon */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/6499/6499372.png"
                    alt="Join Icon"
                    className="w-16 animate-float"
                />
            </div>

            <h2 className="text-3xl font-bold text-center mt-4 mb-2 text-gradient bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent tracking-wider">
                Enter The Arena     ⚔️
            </h2>
            <p className="text-center text-gray-300 mb-6 text-sm">
                Join your friend's quiz battle room and show your skills!
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    placeholder="Enter Room Code"
                    className="w-full px-4 py-2 rounded-lg bg-[#2A2A40] text-white border border-[#877BFC] focus:outline-none focus:ring-2 focus:ring-[#A891FF] transition"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Your Display Name"
                    className="w-full px-4 py-2 rounded-lg bg-[#2A2A40] text-white border border-[#877BFC] focus:outline-none focus:ring-2 focus:ring-[#A891FF] transition"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <p className="text-sm text-gray-400">
                    Logged in as: <span className="font-semibold text-white">{user?.username}</span>
                </p>

                {/* Copy Room ID */}
                <div className="text-sm text-gray-300 flex items-center justify-between">
                    <span>
                        Room ID: <span className="text-[#A891FF] font-semibold">{roomId || 'N/A'}</span>
                    </span>
                    <button
                        type="button"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-200 transition text-xs"
                        onClick={handleCopy}
                        disabled={!roomId}
                        title="Click to copy Room ID"
                    >
                        {copied ? (
                            <>
                                <FaCheckCircle className="text-green-400" /> Copied
                            </>
                        ) : (
                            <>
                                <FaCopy /> Copy
                            </>
                        )}
                    </button>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                    type="button"
                    className="w-full py-2 rounded-full bg-gradient-to-r from-[#A891FF] to-[#6C63FF] hover:from-[#6C63FF] hover:to-[#A891FF] text-white font-semibold transition transform hover:scale-105"
                    onClick={handleRoomJoining}
                >
                    Join Now 🚀
                </button>
            </form>
        </div>
    );
};

export default JoinRoomForm;
