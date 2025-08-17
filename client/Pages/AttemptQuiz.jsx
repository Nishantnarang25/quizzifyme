import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

const AttemptQuiz = () => {
  const { user } = useAuth();
  const { username, quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  useEffect(() => {
    const fetchQuiz = async () => {
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://quizzify-me-backend.onrender.com';
      
      try {
        const response = await axios.get(`${baseUrl}/api/questions/${quizId}`);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const getMedalImage = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { type: 'Gold', src: '/gold.png' };
    if (percentage >= 70) return { type: 'Silver', src: '/silver.png' };
    if (percentage >= 50) return { type: 'Bronze', src: '/bronze.png' };
    return null;
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const attemptPayload = {
        user_id: user?.id,
        quiz_id: questions[0].quiz_id,
        answers: Object.entries(answers).map(([questionId, selected_answer]) => {
          const question = questions.find((q) => q.id === parseInt(questionId));
          const is_correct = question.correct_answer === selected_answer;
          return {
            question_id: parseInt(questionId),
            selected_answer,
            is_correct,
          };
        }),
      };

      const baseUrl =
        process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://quizzify-me-backend.onrender.com';
      try {
        const res = await axios.post(`${baseUrl}/api/attempts`, attemptPayload);
        setResult(res.data);
        setShowOverlay(true);
      } catch (error) {
        console.error('Error submitting attempt:', error);
        alert('Submission failed');
      }
    }
  };

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>;
  if (!questions.length) return <p className="text-white text-center mt-10">No questions found</p>;

  const medal = result ? getMedalImage(result.score, result.total_questions_attempted) : null;

  return (
    <div className="p-6 max-w-3xl mx-auto text-white relative">
      <h1 className="text-3xl font-bold text-center mb-6 text-purple-300">
        Quiz by <span className="text-[#9E6CFD]">@{username}</span>
      </h1>

      <div className="bg-[#2A2A2A] p-6 rounded-2xl shadow-lg border border-[#3A3A3A]">
        <p className="mb-6 text-lg font-semibold">
          Q{currentIndex + 1}. {questions[currentIndex].question}
        </p>

        <ul className="space-y-4">
          {questions[currentIndex].options.map((option, index) => {
            const qId = questions[currentIndex].id;
            const selected = answers[qId] === option;

            return (
              <li
                key={index}
                onClick={() => setAnswers((prev) => ({ ...prev, [qId]: option }))}
                className={`px-4 py-3 rounded-xl cursor-pointer transition duration-300 ease-in-out border text-sm
                  ${selected
                    ? 'bg-[#9E6CFD]/20 border-[#9E6CFD] text-[#E1D8FF] shadow-[0_0_10px_#9E6CFD66]'
                    : 'bg-[#1F1F1F] hover:bg-[#2F2F2F] border-[#3F3F3F] hover:border-[#9E6CFD]/50'}`}
              >
                {option}
              </li>
            );
          })}
        </ul>

        <div className="mt-6 text-center">
          <button
            onClick={handleNext}
            className="bg-[#9E6CFD] hover:bg-[#a984ff] text-white px-6 py-2 rounded-xl mt-4 shadow-md hover:shadow-[0_0_12px_#9E6CFD] transition-all duration-300 ease-in-out"
          >
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      {showOverlay && result && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          {medal?.type === 'Gold' && <Confetti />}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1F1F1F] p-8 rounded-2xl shadow-2xl text-white max-w-md w-full border border-[#3A3A3A] relative"
          >
            <h2 className="text-3xl font-bold text-center text-green-400 mb-6">
              🎉 Quiz Completed!
            </h2>

            {medal && (
              <div className="flex justify-center mb-4">
                <img
                  src={medal.src}
                  alt={`${medal.type} Medal`}
                  className={`h-60 ${medal.type === 'Gold' ? 'animate-pulse' : ''}`}
                />
              </div>
            )}

            <div className="text-center space-y-2">
              <p>
                <span className="text-gray-400">Attempt ID:</span>{' '}
                <span className="font-mono text-purple-300">{result.attempt_id}</span>
              </p>
              <p>
                Score: <strong className="text-yellow-300">{result.score}</strong>
              </p>
              <p>Total Questions: {result.total_questions_attempted}</p>
              <p>Quiz ID: {result.quiz_id}</p>
              <p>User ID: {result.user_id}</p>
            </div>

            <button
              onClick={() => {
                setShowOverlay(false);
                setTimeout(() => navigate('/dashboard'), 5000);
              }}
              className="mt-6 w-full bg-[#9E6CFD] hover:bg-[#a984ff] text-white py-2 rounded-xl shadow-md transition duration-300"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AttemptQuiz;
