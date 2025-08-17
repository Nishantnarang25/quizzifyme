import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Quiz from "../Pages/Quiz";
import AttemptQuiz from "../Pages/AttemptQuiz";
import ProfileBar from "../components/ProfileBar";
import Dashboard from "../Pages/Dashboard";
import MyQuizzes from "../Pages/MyQuizzes";
import LiveModeQuiz from "../Pages/LiveModeQuiz";
import WaitingRoom from "../components/WaitingRoom";
import LiveQuiz from "../components/LiveQuiz";
import LandingPage from "../Pages/LandingPage";
import EditQuiz from "../Pages/EditQuiz";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../context/ProtectedRoute";

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="flex min-h-screen bg-[#1F1F1F]">
        {/* Left Sidebar - show only if logged in */}
        {user && (
          <div className="hidden md:block w-60 fixed left-0 top-0 bottom-0 z-10 bg-white shadow-md">
            <Navbar />
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 p-4 ${user ? "md:ml-64 md:mr-64" : ""}`}>
          <Routes>
            {/* ✅ Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-quizzes"
              element={
                <ProtectedRoute>
                  <MyQuizzes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-mode"
              element={
                <ProtectedRoute>
                  <LiveModeQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/waiting-room/:roomId"
              element={
                <ProtectedRoute>
                  <WaitingRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/live-room/:roomId"
              element={
                <ProtectedRoute>
                  <LiveQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-quiz/:quizId"
              element={
                <ProtectedRoute>
                  <EditQuiz />
                </ProtectedRoute>
              }
            />

            {/* 🌐 Public Routes */}
            <Route path="/quiz/:username/:quizId" element={<AttemptQuiz />} />
            <Route path="/about/QuizzifyMe" element={<LandingPage />} />
          </Routes>
        </div>

        {/* Right Sidebar - show only if logged in */}
        {user && (
          <div className="hidden md:block w-64 fixed right-0 top-0 bottom-0 z-10 bg-white shadow-md">
            <ProfileBar />
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
