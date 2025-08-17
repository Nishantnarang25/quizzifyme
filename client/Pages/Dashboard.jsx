import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PacmanLoader } from "react-spinners"; 

const Dashboard = () => {
  const { user } = useAuth();
  const username = user?.username;
  const userId = user?.id;

  const BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : import.meta.env.VITE_SERVER_URL;

  const [dashboardData, setDashboardData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username || !userId) return;

    const fetchDashboard = async () => {
      try {
        const [dashboardRes, userRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/dashboard/${username}`),
          axios.get(`${BASE_URL}/api/user/${userId}`),
        ]);

        setDashboardData(dashboardRes.data);
        setUserData(userRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [username, userId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1F1F1F]">
        <div className="text-center">
          <PacmanLoader color="#F179E1" size={30} />
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#F179E1] to-[#9E6CFD] mt-4 font-semibold text-lg">
            Leveling up your dashboard...
          </p>
        </div>
      </div>
    );

  if (!dashboardData || !userData)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-[#1F1F1F]">
        Error loading dashboard.
      </div>
    );

  const { quizzes } = dashboardData;
  const earnedBadges = userData.badges || [];
  const xp = userData.xp || 0;

  const badgeImageMap = {
    "Welcome Aboard!": "/welcome_abroad.png",
    "Quiz Champ": "/quiz_champ.png",
    "Speedster": "/speedster.png",
    "Streak Master": "/streaker.png",
    "First Blood": "/first_blood.png",
    "Flawless Victory": "/flawless_victory.png",
    "Comeback Kid": "/comeback_kid.png",
    "Explorer": "/explorer.png",
    "Fast & Furious": "/fast_and_furious.png",
    "Lucky Guess": "/lucky_guess.png",
    "Legend": "/legend.png"
  };

  return (
    <div className="bg-[#1F1F1F] min-h-screen text-white px-4 sm:px-6 py-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center sm:text-left"
      >
        <h1 className="text-3xl font-bold text-white bg-clip-text mb-2">
          Welcome back, {userData.username}!
        </h1>
      </motion.div>

      {/* Earned Badges */}
      <section className="mb-6">
        <h2 className="text-xl font-bold text-[#FBE483] mb-2 tracking-wide">
          Your Achievements
        </h2>
        {earnedBadges.length === 0 ? (
          <p className="text-gray-400 text-lg italic">No badges earned yet. Keep going!</p>
        ) : (
          <ul className="flex flex-wrap justify-center sm:justify-start -m-1 sm:-m-1 items-center">
            {earnedBadges.map((badge, index) => {
              const imagePath = badgeImageMap[badge];
              return (
                <li key={index} className="m-2 transition-all duration-300 ease-in-out">
                  {imagePath ? (
                    <img
                      src={imagePath}
                      alt={badge}
                      title={badge}
                      className="w-40 sm:w-52 h-40 sm:h-52 object-contain transition-transform duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                    />
                  ) : (
                    <span className="text-sm text-gray-300">{badge}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Your Created Quizzes */}
      <section className="mb-16">
        <h2 className="text-2xl font-medium mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#F179E1] to-[#9E6CFD]">
          🎮 Your Created Quizzes
        </h2>

        {quizzes.length === 0 ? (
          <p className="text-center sm:text-left text-gray-400 text-lg">
            🚧 You haven’t created any quizzes yet. Time to get creative! 🛠️
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <Link
                to={`/edit-quiz/${quiz.id}`}
                key={quiz.id}
                className="group bg-gradient-to-br from-[#2a2a3b] to-[#1F1F2E] rounded-2xl p-6 shadow-xl border border-[#3a3a4a] hover:border-[#9E6CFD] hover:shadow-[0_0_12px_#9E6CFD] transition-all duration-200"
              >
                <h3 className="text-2xl font-medium text-white group-hover:text-[#FFD700] transition-colors duration-150 mb-2">
                  {quiz.title}
                </h3>
                <p className="text-sm text-gray-400">
                  🔗 <span className="text-[#9E6CFD]">Slug:</span> {quiz.slug || quiz.generated_slug_id}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  🧠 Total Questions: {quiz.total_questions}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest Quiz Attempts */}
      <section className="mb-16">
        <h2 className="text-2xl font-medium mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#F179E1] to-[#877BFC]">
          📊 Latest Quiz Attempts
        </h2>

        {quizzes.filter((q) => q.attempts.length > 0).length === 0 ? (
          <p className="text-left text-gray-400 text-lg">
            😔 No one has attempted your quizzes yet. Share them to see some action!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {quizzes
              .filter((quiz) => quiz.attempts.length > 0)
              .map((quiz) => {
                const latest = quiz.attempts[0];
                return (
                  <div
                    key={quiz.id}
                    className="bg-gradient-to-br from-[#2a2a3b] to-[#1F1F2E] p-6 rounded-2xl border border-[#3a3a4a] hover:border-[#F179E1] hover:shadow-[0_0_12px_#F179E1] transition-all"
                  >
                    <h3 className="text-2xl font-bold text-white mb-3">
                      🎯 {quiz.title}
                    </h3>
                    <div className="text-sm text-gray-300 space-y-1 leading-relaxed">
                      <p><span className="font-semibold text-[#F179E1]">👤 User:</span> {latest.user?.username || "Unknown"}</p>
                      <p><span className="font-semibold text-[#F179E1]">🏆 Score:</span> {latest.score}</p>
                      <p><span className="font-semibold text-[#F179E1]">🗓️ Date:</span> {new Date(latest.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
