import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const [showConfetti, setShowConfetti] = useState(true);
    const BASE_URL =
        process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : import.meta.env.VITE_SERVER_URL;

    const { user, setUser } = useAuth();
    const [overlay, setOverlay] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [takenUsernames, setTakenUsernames] = useState([]);
    const [usernameTaken, setUsernameTaken] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (credentialResponse) => {
        try {
            const token = credentialResponse.credential;
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const email = decoded.email;
            setEmail(email);

            const res = await axios.post(`${BASE_URL}/api/user/create`, { email });

            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));

            if (res.data.profileCompleteStatus === false) {
                setOverlay(true);
            } else {
                navigate("/dashboard");
            }

            setTakenUsernames(res.data.takenUsernames);
            setShowLogin(false);
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    const handleForm = async (e) => {
        e.preventDefault();
        if (takenUsernames.some((u) => u.username === username)) {
            setUsernameTaken(true);
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/user/update`, {
                username,
                email,
            });

            const updatedUser = res.data.updatedUser;
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setShowConfetti(true);
            setOverlay(false);

            setTimeout(() => {
                navigate("/dashboard");
            }, 2500);
        } catch (error) {
            console.error("Username update error:", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-[#1F1F1F] min-h-screen text-white font-sans overflow-x-hidden">

            {showConfetti && (
                <Confetti width={window.innerWidth} height={window.innerHeight} />
            )}

          {/* Info Message */}
<div className="sm:hidden w-full text-center text-xs bg-[#FBE483] text-[#1F1F1F] py-2 px-4 font-semibold tracking-wide">
  Heads up! Quizzify Me is a desktop-only web game. To log in and play, please switch to a web browser on your computer.
</div>


            {/* Navbar */}
            <nav className="w-full flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 max-w-5xl mx-auto">
                <h1 className="text-xl sm:text-2xl font-bold text-[#877BFC]">
                    Quizzify Me
                </h1>
                <button
                    onClick={() => setShowLogin(true)}
                    className="hidden sm:inline-block text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-[#1F1F1F] transition-all duration-300 text-sm sm:text-base"
                >
                    Enter the Arena
                </button>
            </nav>

            {/* Hero Section */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
                <motion.h2
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-[#FBE483] to-[#F179E1] bg-clip-text text-transparent mb-8 leading-snug"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            Create.
                        </motion.span>

                        <motion.img
                            src="https://cdn-icons-png.flaticon.com/512/2541/2541988.png"
                            alt="quiz icon"
                            className="w-8 sm:w-10 md:w-12 animate-bounce hover:scale-110 transition-transform duration-300"
                            initial={{ rotate: -10 }}
                            animate={{ rotate: 10 }}
                            transition={{ repeat: Infinity, duration: 1.5, repeatType: "mirror" }}
                        />

                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Play.
                        </motion.span>

                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Battle.
                        </motion.span>

                        <motion.span
                            className="text-base sm:text-lg md:text-2xl mt-2 block w-full tracking-widest bg-gradient-to-r from-[#FBE483] to-[#F179E1] bg-clip-text text-transparent flicker"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            All in Real-Time.
                        </motion.span>
                    </div>
                </motion.h2>

                <motion.p
                    className="mt-8 text-sm sm:text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto px-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    Welcome to <span className="text-[#F179E1] font-semibold">Quizzify Me</span> — where you create, play, and battle in epic quiz competitions.
                    <br />
                    Design your own quizzes, challenge friends in real-time battles, and climb the leaderboard together.                    <br />
                    Designed for students, teams, and streamers — let the games begin.
                </motion.p>

                {/* Hero Image */}
                <div className="mt-10 sm:mt-16 px-4">
                    <motion.img
                        src="/dashboard.png"
                        alt="Live Quiz Preview"
                        className="rounded-xl w-full max-w-4xl h-auto mx-auto overflow-hidden border-2 border-[#9E6CFD] shadow-xl"
                        whileHover={{ scale: 1.02 }}
                    />
                </div>
            </section>

            {/* Experience Steps */}
<section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-12 text-center">
    <h2 className="text-3xl sm:text-4xl font-bold text-white">
        🧩 Dive Into The Experience
    </h2>

    {[
        {
            title: "🎨 Create Your Quiz Room",
            desc: "Build your quiz – write your own questions, mark correct answers, and name your battleground.",
            img: "/create quiz room.png",
        },
        {
            title: "⏳ Waiting Room",
            desc: "Hang tight as players join your quiz. Preview settings and get ready to start the battle.",
            img: "/waiting room.png",
        },
        {
            title: "🚀 Enter the Quiz Arena",
            desc: "Join your friends or random players in an intense real-time quiz face-off.",
            img: "/enter quiz room.png",
        },
        {
            title: "🏁 See Your Glory",
            desc: "Review your results, compare stats, and challenge again to climb the leaderboard.",
            img: "/quiz ended.png",
        },
    ].map((step, index) => (
        <div key={index} className="space-y-6 flex flex-col items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
            >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">
                    {step.title}
                </h3>
                <p className="text-gray-300 text-sm sm:text-lg max-w-xl mx-auto">{step.desc}</p>
            </motion.div>
            <motion.img
                src={step.img}
                alt={step.title}
                className="rounded-xl w-full max-w-4xl h-auto mx-auto overflow-hidden border border-[#2F2F3F] shadow-xl"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            />
        </div>
    ))}
</section>


            {/* How It Works */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-20">
                <div className="text-center space-y-4">
                    <h3 className="text-3xl sm:text-4xl font-bold text-white">
                        🚀 How It Works
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto">
                        Quizzify Me makes quiz gaming simple, fun, and ultra-competitive — all in just four epic steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
                    {[
                        ["🛠️", "Create or Join", "Craft your own quiz or hop into a live battle instantly."],
                        ["🎨", "Customize", "Pick topics, set timers, choose difficulty — your quiz, your rules."],
                        ["⚔️", "Compete Live", "Real-time quiz battles with friends or strangers."],
                        ["🏆", "Earn & Level Up", "Win coins, gain XP, and rise through leaderboards."],
                    ].map(([icon, title, desc], i) => (
                        <motion.div
                            key={i}
                            className="bg-[#1F1F2E] p-6 rounded-2xl shadow-md border border-[#2F2F3F] hover:border-[#877BFC] transition-all hover:shadow-[#877BFC]/40"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="text-3xl mb-3">{icon}</div>
                            <h4 className="text-base sm:text-xl font-bold text-white mb-2">{title}</h4>
                            <p className="text-sm text-gray-400">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Create Your Own Quiz Section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-10">
                <motion.h2
                    className="text-3xl sm:text-4xl font-bold text-white"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    ✍️ Create & Share Your Own Quiz
                </motion.h2>

                <motion.p
                    className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}


                >
                    Unleash your creativity — set questions, options, and correct answers, then share your custom quizzes with friends for epic challenges!
                    <br /><br />
                    <span className="text-[#FBE483] font-medium ">
                        You’ll get a unique quiz link — just send it to your friends and let the showdown begin!
                    </span>

                </motion.p>

                <motion.img
                    src="/create-your-own-quiz.png" // Replace with an actual image or illustration you have
                    alt="Create Your Own Quiz"
                    className="rounded-xl w-full max-w-4xl h-auto mx-auto overflow-hidden border border-[#2F2F3F] shadow-xl"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                />

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    <button
                        onClick={() => setShowLogin(true)}
                        className="hidden sm:block bg-[#F179E1] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#e668d3] transition mt-6 text-sm sm:text-base"
                    >
                        Start Creating Your Quiz ➕
                    </button>
                </motion.div>
            </section>




            {/* Footer */}
            <footer className="text-center text-gray-400 py-8 border-t border-gray-700 text-sm">
                © 2025 Quizzify Me — Made with 💜 for quiz lovers everywhere
            </footer>

            {/* Modals (Login and Overlay) */}
            {/* You can keep these as-is or I can help refactor them too for responsiveness */}

            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#1E1E2F] p-10 rounded-3xl border border-purple-500 shadow-lg max-w-md w-full text-center relative"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Enter the Arena</h2>
                        <p className="text-gray-400 mb-6">Sign in with Google to unlock quiz battles.</p>
                        <GoogleLogin
                            onSuccess={handleLogin}
                            onError={() => console.log("Login Failed")}
                            theme="filled_black"
                            size="large"
                            shape="pill"
                        />
                        <button
                            onClick={() => setShowLogin(false)}
                            className="text-sm text-gray-400 hover:text-white underline mt-6"
                        >
                            Cancel
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Overlay for username */}
            {overlay && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 120 }}
                        className="bg-[#2A1F3D] p-10 rounded-3xl border border-yellow-400 shadow-lg max-w-md w-full text-center relative"
                    >
                        <h2 className="text-2xl font-bold text-[#FBE483] mb-4">Pick Your Arena Name</h2>
                        <form onSubmit={handleForm} className="space-y-6">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setUsernameTaken(false);
                                }}
                                className="w-full px-5 py-2 rounded-full text-center border border-[#FBE483] bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#FBE483]"
                                placeholder="e.g., QuizWarrior99"
                                required
                            />
                            {usernameTaken && (
                                <p className="text-red-400 text-sm">That name’s taken — try another!</p>
                            )}
                            <div>
                                <button
                                type="submit"

                                    className="bg-gradient-to-r from-[#FBE483] to-[#F179E1] text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition"
                                >
                                    Enter the Arena ✨
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
