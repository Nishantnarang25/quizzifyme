import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { FaPenFancy, FaGamepad, FaTrophy } from "react-icons/fa";
import { PacmanLoader } from 'react-spinners';

const BASE_URL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : import.meta.env.VITE_SERVER_URL;

const ProfileBar = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({});
    const [allBadges, setAllBadges] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                const [userRes, statsRes, badgeRes] = await Promise.all([
                    axios.get(`${BASE_URL}/api/user/${user.id}`),
                    axios.get(`${BASE_URL}/api/user/${user.id}/stats`),
                    axios.get(`${BASE_URL}/api/badges`)
                ]);

                setUserData(userRes.data);
                setStats(statsRes.data);
                setAllBadges(badgeRes.data);

                console.log(badgeRes.data)
            } catch (error) {
                console.error('❌ Error fetching profile data:', error);
            }
        };

        fetchData();
    }, [user?.id]);

    const xp = userData?.xp || 0;
    const xpPercent = Math.min((xp / 2000) * 100, 100).toFixed(0);

    const earnedBadges = userData?.badges || [];
    const earnedBadgeNames = earnedBadges;
    const lockedBadges = allBadges.filter(b => !earnedBadgeNames.includes(b.name));

    const badgeImageMap = {
        "Welcome Aboard!": "/welcome_abroad.png",
        "Quiz Champ": "/quiz_champ.png",
        "Speedster": "/speedster.png",
        "Streak Master": "/streaker.png",
        "First Blood": "/first_blood.png",

        //"Flawless Victory": "/flawless_victory.png",
        //"Comeback Kid": "/comeback_kid.png",
        //"Fast & Furious": "/fast_and_furious.png",


        "Explorer": "/explorer.png",
        "Lucky Guess": "/lucky_guess.png",
        "Legend": "/legend.png"
    };

    return (
        <aside className="w-72 h-screen bg-[#1F1F1F] text-white shadow-lg p-6 fixed top-0 right-0 border-l border-[#2F2F3F] overflow-y-auto z-50">

            {/* User Info */}
            <div className="text-center mb-8">
                {userData ? (
                    <>
                        <FaUserCircle className="text-5xl mx-auto text-gray-300" />
                        <h2 className="mt-2 text-xl font-bold">{userData.username}</h2>
                        <p className="text-sm text-gray-400">{userData.email}</p>

                        {/* XP Progress Bar */}
                        <div className="mt-4 w-full bg-[#2F2F3F] rounded-full h-2.5">
                            <div
                                className="bg-gradient-to-r from-[#FBE483] to-[#F179E1] h-2.5 rounded-full"
                                style={{ width: `${xpPercent}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 italic tracking-wide">
                            {xp >= 2000 ? "🎉 Max Level! Time to prestige?" : `XP: ${xp}/2000`}
                        </p>
                    </>
                ) : (
                        <div className="flex items-center space-x-2 text-lg font-semibold text-pink-500">
                            <span>Loading profile</span>
                            <div className="flex space-x-1">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                            </div>

                    </div>)}
            </div>

            {lockedBadges && lockedBadges.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-6 text-gray-200 text-center">🔒 Locked Badges</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
                        {lockedBadges.map((badge, index) => {
                            const imagePath = badgeImageMap[badge.name];
                            if (!imagePath) return null;

                            return (
                                <li key={index} className="flex flex-col items-center gap-2">
                                    <img
                                        src={imagePath}
                                        alt={badge.name}
                                        title={badge.name}
                                        className="w-28 h-28 object-contain transition-transform duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_#FF8C00] rounded-xl"
                                    />
                                    <span className="text-sm text-gray-300 font-medium text-center">{badge.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}



            <div className="mt-10">
                <h3 className="text-lg font-medium bg-clip-text text-white  mb-4 relative inline-block">
                    Progress Overview
                    <span className="block w-full h-0.5 bg-gradient-to-r from-[#FBE483] to-[#F179E1] mt-1 animate-pulse"></span>
                </h3>

                <div className="space-y-4">
                    {/* Quizzes Created */}
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-xl shadow-md hover:scale-[1.02] transition duration-200 group">
                        <div className="flex items-center gap-3">
                            <FaPenFancy className="text-yellow-400 text-xl group-hover:rotate-12 transition" />
                            <span className="text-gray-300">Quizzes Created</span>
                        </div>
                        <span className="text-yellow-300 text-lg font-bold animate-pulse">
                            {stats.quizzesCreated || 0}
                        </span>
                    </div>

                    {/* Quizzes Played */}
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-xl shadow-md hover:scale-[1.02] transition duration-200 group">
                        <div className="flex items-center gap-3">
                            <FaGamepad className="text-blue-400 text-xl group-hover:scale-110 transition" />
                            <span className="text-gray-300">Quizzes Played</span>
                        </div>
                        <span className="text-blue-300 text-lg font-bold animate-bounce">
                            {stats.totalAttempts || 0}
                        </span>
                    </div>

                    {/* Win Ratio */}
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-xl shadow-md hover:scale-[1.02] transition duration-200 group">
                        <div className="flex items-center gap-3">
                            <FaTrophy className="text-pink-400 text-xl group-hover:-rotate-6 transition" />
                            <span className="text-gray-300">Win Ratio</span>
                        </div>
                        <span className="text-pink-300 text-lg font-bold animate-[pulse_2s_ease-in-out_infinite]">
                            {stats.winRatio || 0}%
                        </span>
                    </div>
                </div>
            </div>



        </aside>
    );
};

export default ProfileBar;
