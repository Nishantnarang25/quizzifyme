import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PacmanLoader } from 'react-spinners';
import { Link } from 'react-router-dom';

const MyQuizzes = () => {
  const BASE_URL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : import.meta.env.VITE_SERVER_URL;

  const [quizzes, setQuizzes] = useState([]);
  const { user } = useAuth();
  const username = user?.username || null;

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!username) return;
      try {
        const response = await axios.post(`${BASE_URL}/api/quiz/my-quizzes`, { username });
        setQuizzes(response.data);
        console.log(response.data, "this is coming from Quiz")
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, [username]);

  return (
    <div className="p-6 px-4 md:px-16 max-w-7xl mx-auto text-white">
      <h2 className="text-3xl font-medium mb-8 text-left text-transparent bg-clip-text bg-gradient-to-r from-[#9E6CFD] to-[#FFCB52]">
        🧠 My Quizzes
      </h2>

      {username ? (
        quizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <Link key={quiz.id} to={`/edit-quiz/${quiz.id}`} className="no-underline">
                <div
                  className="rounded-2xl p-5 bg-gradient-to-br from-[#1f1f2f] to-[#2c2c3e] border border-[#333] shadow-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_18px_#9E6CFD]"
                >
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {quiz.title}
                  </h3>

                  <p className="text-sm text-gray-400 mb-1">
                    📅 Created: {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm mb-2">
                    🔒 Verified:{' '}
                    <span className={quiz.is_verified ? 'text-green-400' : 'text-red-400'}>
                      {quiz.is_verified ? '✅ Yes' : '❌ No'}
                    </span>
                  </p>

                  <p className="text-sm font-medium mb-4 text-gray-300">
                    ❓ Total Questions: {quiz.questions?.length ?? 0}
                  </p>

                  <div className="bg-[#2f2f3f] p-4 rounded-lg border border-[#444]">
                    <h4 className="font-semibold mb-2 text-gray-200">📋 Questions:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                      {quiz.questions.map((q) => (
                        <li key={q.id} className="text-gray-400">
                          {q.question}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
    <div className="min-h-screen flex items-center justify-center bg-[#1F1F1F]">
      <div className="text-center">
        <PacmanLoader color="#F179E1" size={30} />
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#F179E1] to-[#9E6CFD] mt-4 font-semibold text-lg">
          Fetching you Quizzes...
        </p>
      </div>
    </div>)
      ) : (
  <p className="text-center text-gray-500 mt-8">🔐 Please log in to view your quizzes.</p>
)}
    </div >
  );
};

export default MyQuizzes;
