import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const CreateRoomForm = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();

  const [name, setName] = useState('');
  const [roomId] = useState(nanoid(8));
  const [quizType, setQuizType] = useState('9');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = ({ rooms, socketId, roomId }) => {
      console.log("✅ Room created:", { rooms, socketId, roomId });
      navigate(`/quiz/waiting-room/${roomId}`);
      onClose?.();
    };

    const handleError = (err) => {
      const msg = typeof err === 'string' ? err : err.message;
      setError(msg || 'An unknown error occurred.');
      console.error("❌ Room creation error:", msg);
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('error', handleError);

    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('error', handleError);
    };
  }, [socket, navigate, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('❌ Clipboard copy failed:', err);
    }
  };

  const handleRoomCreate = () => {
    if (!quizType) {
      setError("Please select a quiz category.");
      return;
    }



    if (!socket) {
      console.warn("⏳ Socket not ready yet. Please wait...");
      setError('Connecting to server. Please wait...');
      return;
    }

    socket.emit('createRoom', {
      user: user.username,
      name,
      roomId,
      quizCategory: quizType,
      isHost: 'true',
    });

    console.log("📤 Emitting createRoom:", {
      name,
      roomId,
      quizCategory: quizType,
      isHost: 'true',
    });
  };

  return (
    <div className="bg-[#1E1E2F] text-white rounded-3xl border border-[#877BFC] shadow-[0_0_15px_#877BFC] px-8 py-10 w-full max-w-lg mx-auto relative animate-fadeIn">
      <button
        className="absolute top-2 right-4 text-gray-400 hover:text-pink-400 text-4xl transition-all"
        onClick={onClose}
      >
        ×
      </button>

      <h2 className="text-4xl font-bold text-center mt-4 mb-2 text-gradient bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent tracking-wider">
        🎉 Create a Fun Room!
      </h2>

      <p className="text-center text-gray-400 mb-6 text-sm sm:text-base">
        Battle friends in real-time with custom quizzes!
      </p>

      <label className="block mb-2 text-sm font-semibold text-[#c4b5fd]">🎯 Quiz Category</label>
      <select
        value={quizType}
        onChange={(e) => setQuizType(e.target.value)}
        className="w-full px-4 py-2 bg-[#2B2B3C] border border-[#4F4F6F] rounded-md text-white focus:outline-none mb-5"
      >
        <option value="" disabled>Select a category</option>
        <option value="9">🧠 General Knowledge</option>
        <option value="18">💻 Science: Computers</option>
        <option value="19">📐 Science: Mathematics</option>
        <option value="17">🌿 Science & Nature</option>
        <option value="31">🎌 Anime & Manga</option>
        <option value="15">🎮 Video Games</option>
        <option value="12">🎵 Music</option>
        <option value="14">📺 Television</option>
        <option value="11">🎬 Film</option>
        <option value="22">🌍 Geography</option>
        <option value="23">📚 History</option>
        <option value="21">🏀 Sports</option>
        <option value="25">🎨 Art</option>
        <option value="27">🐾 Animals</option>
        <option value="10">📖 Books</option>
      </select>

      <label className="block mb-2 text-sm font-semibold text-[#c4b5fd]">🙋‍♂️ Host Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="w-full px-4 py-2 bg-[#2B2B3C] border border-[#4F4F6F] rounded-md text-white mb-5 focus:outline-none"
      />

      <div className="mb-4 text-sm text-gray-300">
        Room ID:{" "}
        <span
          onClick={handleCopy}
          className="inline-block px-2 py-1 bg-[#292940] border border-[#877BFC] rounded-md text-[#FBE483] font-mono cursor-pointer hover:scale-105 transition-all"
          title="Click to copy"
        >
          {roomId}
        </span>
        {copied && (
          <span className="ml-2 text-green-400 font-semibold">Copied!</span>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm font-medium mb-3">{error}</div>
      )}

      <button
        onClick={handleRoomCreate}
        className="w-full bg-gradient-to-r from-[#F179E1] to-[#877BFC] text-white py-2 rounded-full font-bold mt-2 hover:opacity-90 transition-all"
      >
        🚀 Create Room
      </button>
    </div>

  );
};

export default CreateRoomForm;
