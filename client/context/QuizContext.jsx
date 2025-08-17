import { Children } from "react";
import { createContext, useContext, useState } from "react"

// createContext - this helps us to create a box where we wrap the QuizProvider
// Create a context (like a shared box)
const QuizContext = createContext();

//Provider component to warp around the app
export const QuizProvider = ({ children }) => {
    const [participants, setParticipants] = useState([]);

    return (
        <QuizContext.Provider value={{ participants, setParticipants }}>
            {children}
        </QuizContext.Provider>
    );
};

export const useQuiz = () => useContext(QuizContext);