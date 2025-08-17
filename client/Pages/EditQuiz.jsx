import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import { PacmanLoader } from "react-spinners"; 
const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL =
    import.meta.env.MODE === "development"
      ? "http://localhost:3000"
      : import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/quiz/${quizId}`);
        const data = res.data;

        const formattedQuestions = data.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
        }));

        setQuiz({
          ...data,
          timeAlloted: data.time_alloted,
          questions: formattedQuestions,
        });


      } catch (err) {
        setError("Failed to fetch quiz data");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quiz.questions];
    if (field === "options") {
      updatedQuestions[index][field] = value.split(",").map((opt) => opt.trim());
    } else {
      updatedQuestions[index][field] = value;
    }
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
        },
      ],
    }));
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleSave = async () => {
    if (!quiz.title || quiz.questions.length === 0) {
      setError("Please complete all required fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: quiz.title,
        timeAlloted: parseInt(quiz.timeAlloted),
        questions: quiz.questions,
      };

      await axios.put(`${BASE_URL}/api/quiz/${quizId}/update`, payload);
      navigate(`/dashboard`);
    } catch (err) {
      setError("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
}

if (!quiz) {
  return <p className="text-center mt-8 text-white">Quiz not found</p>;
}

  return (
    <motion.div
      className="max-w-3xl mx-auto mt-10 p-6 rounded-xl shadow-lg text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-2xl font-bold text-[#9E6CFD] mb-6 text-center">📝 Edit Quiz</h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <label className="block mb-2 text-sm">Title</label>
      <input
        type="text"
        name="title"
        value={quiz.title}
        onChange={handleQuizChange}
        className="w-full p-2 rounded bg-gray-700 text-white mb-4 focus:outline-none"
        placeholder="Quiz Title"
      />

      <label className="block mb-2 text-sm">Time Allotted (in minutes)</label>
      <input
        type="number"
        name="timeAlloted"
        value={quiz.timeAlloted}
        onChange={handleQuizChange}
        className="w-full p-2 rounded bg-gray-700 text-white mb-6 focus:outline-none"
      />

      <div className="space-y-8">
        {quiz.questions.map((q, index) => (
          <div
            key={index}
            className=" p-4 border border-gray-600 rounded-lg shadow relative"
          >
            <h3 className="font-semibold mb-2 text-[#FFD700]">Question {index + 1}</h3>

            <textarea
              value={q.question}
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded mb-3"
              placeholder="Enter the question"
            />

            <label className="block mb-1 text-sm">Options (comma-separated)</label>
            <input
              type="text"
              value={q.options.join(", ")}
              onChange={(e) => handleQuestionChange(index, "options", e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded mb-3"
              placeholder="Option1, Option2, Option3, Option4"
            />

            <label className="block mb-1 text-sm">Correct Answer</label>
            <input
              type="text"
              value={q.correctAnswer}
              onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded"
              placeholder="Correct answer"
            />

          
          </div>
        ))}
      </div>

      <button
        onClick={handleAddQuestion}
        className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded transition-all"
      >
        ➕ Add Question
      </button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSave}
        disabled={saving}
        className="mt-6 bg-[#9E6CFD] text-white px-6 py-2 rounded-md w-full transition-all duration-200 hover:border-2 hover:border-yellow-400 hover:shadow-[0_0_12px_#FFD700] disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </motion.button>
    </motion.div>
  );
};

export default EditQuiz;
