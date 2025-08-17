import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Quiz = () => {
    const BASE_URL = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : import.meta.env.VITE_SERVER_URL;

    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [quizId, setQuizId] = useState(null);
    const [title, setTitle] = useState('');
    const [timeAlloted, setTimeAlloted] = useState(10);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([]);
    const [currentOptionValue, setCurrentOptionValue] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [editingIndex, setEditingIndex] = useState(-1);
    const [questions, setQuestions] = useState([]);
    const [previewQuestions, setPreviewQuestions] = useState(false);
    const [quizFinalized, setQuizFinalized] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const addOption = () => {
        const trimmed = currentOptionValue.trim();
        if (!trimmed || options.includes(trimmed)) {
            alert('Option cannot be empty or duplicate');
            return;
        }
        if (options.length >= 4) return;
        setOptions([...options, trimmed]);
        setCurrentOptionValue('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const createQuiz = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/api/quiz/create`, {
                title,
                timeAlloted,
                user_id: user.id,
            });
            setQuizId(res.data.id);
            setStep(2);
        } catch (err) {
            console.error('Error creating quiz:', err);
        }
    };

    const handleFinalizedQuiz = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/api/quiz/finalQuiz`, {
                quizId,
                createdBy: user.username,
                title,
                timeAlloted,
                totalQuestions: questions.length,
                questions,
            });

            setShareUrl(`${window.location.origin}/quiz/${user?.username}/${quizId}`);
            setQuizFinalized(true);
            setStep(1);
            setQuestions([]);
            setPreviewQuestions(false);
        } catch (err) {
            console.error('Error finalizing quiz:', err);
            alert('Something went wrong while finalizing the quiz.');
        }
    };

    const handleSaveQuestion = () => {
        const newQuestion = { question, options, correctAnswer, quizId };
        if (editingIndex === -1) {
            setQuestions([...questions, newQuestion]);
        } else {
            const updated = [...questions];
            updated[editingIndex] = newQuestion;
            setQuestions(updated);
            setEditingIndex(-1);
        }

        setQuestion('');
        setOptions([]);
        setCorrectAnswer('');
        setCurrentOptionValue('');
    };

    const handleEdit = (index) => {
        const q = questions[index];
        setQuestion(q.question);
        setOptions(q.options);
        setCorrectAnswer(q.correctAnswer);
        setEditingIndex(index);
    };

    const handleDelete = (index) => {
        const updated = [...questions];
        updated.splice(index, 1);
        setQuestions(updated);
        if (index === editingIndex) {
            setEditingIndex(-1);
            setQuestion('');
            setOptions([]);
            setCorrectAnswer('');
        }
    };

    const handleGenerateQuiz = () => {
        if (questions.length === 0) {
            alert('Add at least one question before generating the quiz.');
            return;
        }
        setPreviewQuestions(true);
    };

    const goBack = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    return (
        <div className="max-w-3xl mx-auto p-4 text-white ">
            {step === 1 && (
                <div className="flex justify-center">
                    <div className="rounded-lg p-6 shadow-md space-y-4 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-left">🎯 Create Quiz</h2>

                        <label className="block">Quiz Title:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded text-white"
                            placeholder="Enter quiz title"
                        />

                        <label className="block">Allotted Time (in minutes):</label>
                        <input
                            type="number"
                            value={timeAlloted}
                            onChange={(e) => setTimeAlloted(Number(e.target.value))}
                            className="w-full p-2 bg-gray-700 rounded text-white"
                        />

                        <button
                            onClick={createQuiz}
                            className="bg-[#9E6CFD] text-white px-4 py-2 rounded mt-4 w-full transition-all duration-300 ease-in-out border-2 border-transparent hover:border-[#FFD700] hover:shadow-[0_0_12px_#FFD700] hover:scale-105"                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && !previewQuestions && (
                <div className="flex justify-center">
                    <div className="space-y-6 mt-4 w-full max-w-2xl">
                        <button
                            onClick={goBack}
                            className="text-sm text-gray-300 hover:underline"
                        >
                            ⬅ Back to Quiz Setup
                        </button>

                        <div className=" rounded-lg p-6 shadow space-y-4">
                            <h2 className="text-xl font-semibold">
                                {editingIndex === -1 ? 'Add Question' : 'Edit Question'}
                            </h2>

                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="w-full p-2 bg-gray-700 rounded text-white"
                                placeholder="Enter your question"
                            />

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={currentOptionValue}
                                    onChange={(e) => setCurrentOptionValue(e.target.value)}
                                    className="flex-1 p-2 bg-gray-700 rounded text-white"
                                    placeholder="Enter option"
                                />
                                <button
                                    onClick={addOption}
                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                                >
                                    Add Option
                                </button>
                            </div>

                            <div>
                                <p className="font-medium mb-1">Choose Correct Answer:</p>
                                {options.length === 0 ? (
                                    <p className="text-gray-400">No options added yet.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {options.map((opt, i) => (
                                            <label key={i} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={correctAnswer === opt}
                                                    onChange={() => setCorrectAnswer(opt)}
                                                />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSaveQuestion}
                                disabled={!question || options.length < 2 || !correctAnswer}
                                className={`${!question || options.length < 2 || !correctAnswer
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white px-4 py-2 rounded w-full`}
                            >
                                {editingIndex === -1 ? 'Add Question' : 'Update Question'}
                            </button>
                        </div>

                        <div className="rounded-lg p-4 space-y-3">
                            <h3 className="text-lg font-semibold">📝 All Questions</h3>
                            {questions.length === 0 && (
                                <p className="text-gray-400">No questions added yet.</p>
                            )}
                            {questions.map((q, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-gray-700 rounded-lg shadow space-y-2"
                                >
                                    <p>
                                        <strong>Q{index + 1}:</strong> {q.question}
                                    </p>
                                    <ul className="pl-4 list-disc">
                                        {q.options.map((opt, i) => (
                                            <li
                                                key={i}
                                                className={
                                                    opt === q.correctAnswer
                                                        ? 'text-green-400 font-semibold'
                                                        : ''
                                                }
                                            >
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex gap-3 mt-2">
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="text-blue-400 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="text-red-400 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleGenerateQuiz}
                                disabled={questions.length === 0}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mt-4 w-full"
                            >
                                Generate Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewQuestions && (
                <div className="rounded-lg p-6 mt-6 space-y-4 border border-white">
                    <h2 className="text-xl font-bold">📋 Preview Questions</h2>
                    {questions.map((q, index) => (
                        <div key={index}>
                            <strong>Q{index + 1}:</strong> {q.question}
                            <ul className="pl-4 list-disc">
                                {q.options.map((opt, i) => (
                                    <li
                                        key={i}
                                        className={
                                            opt === q.correctAnswer
                                                ? 'text-green-400 font-semibold'
                                                : ''
                                        }
                                    >
                                        {opt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <button
                        onClick={handleFinalizedQuiz}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        Finalize & Publish
                    </button>
                </div>
            )}

            {quizFinalized && shareUrl && (
                <div className="mt-6 p-4 bg-green-800 rounded text-center space-y-2">
                    <p className="text-white font-semibold">✅ Quiz Published!</p>
                    <a
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleCopy}
                        className="text-blue-300 hover:underline"
                    >
                        {shareUrl}
                    </a>
                    {copied && <span className="text-green-300">Link copied!</span>}
                </div>
            )}
        </div>
    );
};

export default Quiz;
