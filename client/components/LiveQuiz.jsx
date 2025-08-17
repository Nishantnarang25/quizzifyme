import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const LiveQuiz = () => {
    const { roomId } = useParams();
    const socket = useSocket();
    const { user } = useAuth();

    const [question, setQuestion] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timer, setTimer] = useState(15);
    const [quizStarted, setQuizStarted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizEnded, setQuizEnded] = useState(false);
    const [finalRoomData, setFinalRoomData] = useState(null);
    const [winners, setWinners] = useState([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [rankings, setRankings] = useState([]);

    const location = useLocation();
    const { questions } = location.state || {};

    useEffect(() => {
        if (!socket) return;

        const handleQuizEnd = ({ room, winners, rankings }) => {
            setQuizEnded(true);
            setQuizStarted(false);
            setFinalRoomData(room);
            setWinners(winners);
            setRankings(rankings);
        };

        socket.on("quizEnded", handleQuizEnd);

        socket.on("user-submitted", ({ message, username }) => {
            setMessages(prev => [...prev, { text: message, username }]);
        });

        return () => {
            socket.off("quizEnded", handleQuizEnd);
            socket.off("user-submitted");
        };
    }, [socket]);

    useEffect(() => {
        if (questions && questions.length > 0) {
            setQuizStarted(true);
            setQuestion(questions[0]);
            setCurrentIndex(0);
            setTimer(15);
        }
    }, [questions]);

    useEffect(() => {
        if (!quizStarted || timer <= 0) return;
        const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [quizStarted, timer]);

    useEffect(() => {
        if (!socket) return;
        const handleNextQuestion = ({ index, question }) => {
            setCurrentIndex(index);
            setQuestion(question);
            setSelectedOption(null);
            setTimer(15);
            setHasSubmitted(false);
        };
        socket.on("nextQuestionIndex", handleNextQuestion);
        return () => socket.off("nextQuestionIndex", handleNextQuestion);
    }, [socket]);

    useEffect(() => {
        if (messages.length === 0) return;
        const timer = setTimeout(() => {
            setMessages(prev => prev.slice(1));
        }, 3000);
        return () => clearTimeout(timer);
    }, [messages]);

    const handleSubmitAnswer = () => {
        if (selectedOption === null) return;

        socket.emit("submitAnswer", {
            roomId,
            questionIndex: currentIndex,
            selectedOption
        });

        socket.emit("answer-submitted", {
            roomId,
            userId: user.id,
            username: user.username,
            questionId: question.id
        });

        setSelectedOption(null);
        setHasSubmitted(true);
    };

    return (
        <div className="min-h-screen text-white p-6 flex flex-col items-center justify-start">
            <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-yellow-300 to-pink-400 bg-clip-text text-transparent drop-shadow-md mb-8"
            >
                🧠 Live Quiz Showdown
            </motion.h1>

            {!quizStarted && !quizEnded && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-300 text-lg"
                >
                    ⏱ Waiting for quiz to start...
                </motion.p>
            )}

            <AnimatePresence>
                <div className="mb-4 w-72">
                    {messages.map((msg, index) => (
                        <motion.div
                            key={msg.text + index}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-green-600 text-white text-sm rounded-lg px-4 py-2 shadow-lg"
                        >
                            {msg.text}
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>

            {quizEnded && finalRoomData && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="fixed inset-0 bg-[#0e0e0e]/90 flex flex-col items-center justify-center z-50"
                >
                    <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={300} recycle={false} />

                    <motion.h2
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-bold text-green-400 mb-8 drop-shadow-lg"
                    >
                        🎉 Quiz Over!
                    </motion.h2>

                    <div className="flex justify-center items-end gap-0 w-full max-w-4xl mb-8">
                        {/* Silver */}
                        {rankings[1] && (
                            <div className="flex flex-col items-center">
                                <img src="/silver.png" alt="Silver Medal" className="w-52 h-52 mb-0 object-contain" />
                                <p className="text-lg text-white font-medium">{rankings[1].name}</p>
                            </div>
                        )}

                        {/* Gold */}
                        {rankings[0] && (
                            <div className="flex flex-col items-center">
                                <img src="/gold.png" alt="Gold Medal" className="w-60 h-60 mb-1 object-contain" />
                                <p className="text-xl text-yellow-400 font-bold">{rankings[0].name}</p>
                            </div>
                        )}

                        {/* Bronze */}
                        {rankings[2] && (
                            <div className="flex flex-col items-center">
                                <img src="/bronze.png" alt="Bronze Medal" className="w-48 h-48 mb-0 object-contain" />
                                <p className="text-lg text-white font-medium">{rankings[2].name}</p>
                            </div>
                        )}
                    </div>



                    {/* Final Scoreboard */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-[#1a1a1a] p-6 rounded-xl shadow-2xl max-w-xl w-full"
                    >
                        <h3 className="text-xl text-blue-300 font-semibold mb-3">🏁 Final Scores:</h3>
                        <ul className="text-gray-200 space-y-2">
                            {rankings.map((r, idx) => (
                                <li key={idx} className="flex items-center justify-between px-4 py-2 bg-[#2a2a2a] rounded-lg">
                                    <span className="font-semibold text-white">
                                        {r.name} {r.user === user?.username && "(You)"}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        {r.score} pts
                                        {r.medal && (
                                            <img
                                                src={`/${r.medal}.png`}
                                                alt={`${r.medal} medal`}
                                                className="w-6 h-6"
                                            />
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </motion.div>
            )}

            {quizStarted && !quizEnded && question && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-2xl bg-[#1f1d2b] p-6 rounded-3xl shadow-2xl"
                >
                    <div className="flex justify-between mb-4 items-center">
                        <p className="text-lg font-medium text-white">Question {currentIndex + 1}</p>
                        <motion.p
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="text-sm font-bold text-yellow-400"
                        >
                            ⏳ {timer}s
                        </motion.p>
                    </div>

                    <h2 className="text-2xl font-semibold text-white mb-6">{question.question}</h2>

                    <ul className="space-y-3">
                        {question.options.map((option, idx) => (
                            <motion.li
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <button
                                    onClick={() => setSelectedOption(idx)}
                                    className={`w-full py-3 px-4 rounded-lg text-left font-medium transition-all duration-300 border-2
                    ${selectedOption === idx
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent"
                                            : "bg-white text-gray-800 hover:bg-blue-100 border-gray-300"
                                        }`}
                                >
                                    {option}
                                </button>
                            </motion.li>
                        ))}
                    </ul>

                    <motion.button
                        onClick={handleSubmitAnswer}
                        disabled={selectedOption === null || timer <= 0 || hasSubmitted}
                        whileHover={{ scale: selectedOption !== null && timer > 0 && !hasSubmitted ? 1.05 : 1 }}
                        className={`mt-6 w-full py-3 rounded-xl font-semibold transition-all duration-300
              ${selectedOption === null || timer <= 0 || hasSubmitted
                                ? "bg-gray-500 cursor-not-allowed text-gray-200"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                    >
                        Submit Answer
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
};

export default LiveQuiz;
