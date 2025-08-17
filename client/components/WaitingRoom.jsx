import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserAstronaut, FaUserAltSlash } from 'react-icons/fa';


const WaitingRoom = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket();
    const { participants, setParticipants } = useQuiz();

    const [currentSocketId, setCurrentSocketId] = useState(null);
    const [recentJoinName, setRecentJoinName] = useState('');
    const [adminSocketId, setAdminSocketId] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        if (!user || !socket) return;

        const handleConnect = () => {
            setCurrentSocketId(socket.id);
            socket.emit('adminJoinedRoom', { roomId, socketId: socket.id });
        };

        socket.connected ? handleConnect() : socket.on('connect', handleConnect);

        socket.on('adminInfo', ({ participants, adminSocketId }) => {
            setParticipants(participants);
            setAdminSocketId(adminSocketId);

            const sorted = Object.entries(participants).sort((a, b) => b[1].joinedAt - a[1].joinedAt);
            if (sorted.length > 0) {
                const latest = sorted[0][1];
                setRecentJoinName(latest.name || 'A participant');
            }
        });

        socket.on("quizStartedByAdmin", ({ roomId, questions }) => {
            setStatusMessage("🚀 Host has started the quiz... Get ready!");
            setTimeout(() => {
                navigate(`/quiz/live-room/${roomId}`, { state: { questions } });
            }, 1000);
        });

        return () => {
            socket.off('connect', handleConnect);
            socket.off('adminInfo');
            socket.off('quizStartedByAdmin');
        };
    }, [socket, user, roomId, navigate, setParticipants]);

    useEffect(() => {
        if (recentJoinName) {
            const timeout = setTimeout(() => {
                setRecentJoinName(""); // Clear recent join after 3 seconds
            }, 3000);

            return () => clearTimeout(timeout); // Cleanup if component rerenders
        }
    }, [recentJoinName]);


    const startQuiz = () => {
        if (socket) socket.emit('startingQuiz', { roomId });
    };

    const gridSize = 4;
    const participantSlots = Array(gridSize).fill(null);
    const filledSlots = Object.entries(participants);
    filledSlots.forEach(([socketId, participant], index) => {
        participantSlots[index] = { socketId, participant };
    });

    return (
        <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center p-6 relative">

            {/* Creative Heading */}
            <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="text-4xl font-medium text-center mb-8 text-transparent bg-gradient-to-r from-yellow-400  to-purple-600 bg-clip-text drop-shadow-md"
            >
                🚀 Get Ready to Blast Off!
            </motion.h1>

            {/* Room Code */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >

                <span className="tracking-wide font-medium">🔒 Room Code: </span>
                <span className="font-bold text-white tracking-wider">{roomId}</span>
            </motion.div>

           <div style={{ height: '50px' }} className="w-full flex justify-center items-center mb-6 relative">
  <AnimatePresence>
    {recentJoinName && (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-sm text-center text-white bg-[#1F3F2F] px-4 py-2 rounded-md shadow-md ring-1 ring-[#60FFAB40]"
      >
        🎉 <strong className="font-semibold">{recentJoinName}</strong> joined!
      </motion.div>
    )}
  </AnimatePresence>
</div>


            {/* Status */}
            {statusMessage && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mb-4 text-center text-lg font-semibold text-[#FFD670] flex items-center justify-center gap-2 animate-pulse"
                >
                    <span className="text-xl">🚀</span> {statusMessage}
                </motion.div>
            )}


            {/* Participant Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 w-full max-w-4xl mt-6">
                {participantSlots.map((slot, i) => {
                    if (slot) {
                        const isCurrentUser = slot.socketId === currentSocketId;
                        const isAdmin = slot.socketId === adminSocketId;

                        return (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#1F1D36] border-2 border-[#7A5FFF] rounded-3xl h-60 flex flex-col justify-center items-center text-center shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out"
                            >
                                <FaUserAstronaut className="text-[#FFD700] text-5xl mb-4 animate-bounce" />
                                <p className="font-bold text-lg text-white">
                                    {slot.participant.name}
                                    {isCurrentUser && <span className="text-[#A3FFEF]"> (You)</span>}
                                </p>
                                {isAdmin && <p className="text-yellow-400 text-sm mt-1">👑 Host</p>}
                                {isAdmin && isCurrentUser && (
                                    <button
                                        onClick={startQuiz}
                                        className="mt-3 bg-gradient-to-r from-[#7A5FFF] to-[#A78BFA] px-6 py-2 text-white rounded-full text-sm hover:scale-110 transition"
                                    >
                                        Start Quiz
                                    </button>
                                )}
                            </motion.div>
                        );
                    } else {
                        return (
                            <>
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-gradient-to-br from-[#1A1A2E] to-[#2E2E3A] border-2 border-[#44445E] rounded-3xl h-60 flex flex-col justify-center items-center text-center text-gray-300 shadow-lg relative overflow-hidden"
                                >
                                    {/* Floating Avatar */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        <FaUserAltSlash className="text-6xl text-[#777] mb-2 opacity-80" />
                                    </motion.div>

                                    {/* Sliding Text */}
                                    <p className="text-sm font-semibold relative overflow-hidden bg-clip-text text-transparent bg-gradient-to-r from-gray-400 via-white to-gray-400 animate-textSlide">
                                        Waiting for player...
                                    </p>

                                    {/* Optional shimmer overlay */}
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer z-0 pointer-events-none" />
                                </motion.div>

                                {/* Animations defined inline right here */}
                                <style>{`
    .animate-textSlide {
      background-size: 200% 100%;
      background-position: 200% center;
      animation: textSlide 3s linear infinite;
    }

    @keyframes textSlide {
      0% { background-position: 200% center; }
      100% { background-position: -200% center; }
    }

    .animate-shimmer {
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `}</style>
                            </>

                        );
                    }
                })}
            </div>




        </div>
    );
};

export default WaitingRoom;
