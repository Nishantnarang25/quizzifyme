import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : import.meta.env.VITE_SERVER_URL;

  const { user, setUser } = useAuth();
  const [overlay, setOverlay] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [takenUsernames, setTakenUsernames] = useState([]);
  const [usernameTaken, setUsernameTaken] = useState(false);

  const handleLogin = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const email = decoded.email;
      setEmail(email);

      const res = await axios.post(`${BASE_URL}/api/user/create`, {
        email,
      });

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.profileCompleteStatus === false) {
        setOverlay(true);
      } else {
        setOverlay(false);
      }

      setTakenUsernames(res.data.takenUsernames);
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

      setUser(res.data.updatedUser);
      localStorage.setItem("user", JSON.stringify(res.data.updatedUser));
      setOverlay(false);
    } catch (error) {
      console.error("Username update error:", error);
    }
  };

  return (
    <div className="relative">
      <GoogleLogin
        onSuccess={handleLogin}
        onError={() => console.log("Login Failed")}
      />

      {/* Overlay for username input */}
      {overlay && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-[#1F1F1F] text-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-[#F179E1]">Welcome!</h2>
            <p className="mb-4 text-gray-300">
              Please choose a unique username to complete your profile.
            </p>
            <form onSubmit={handleForm} className="flex flex-col gap-3">
              <label htmlFor="username" className="text-sm font-medium text-gray-400">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#2A2A2A] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#877BFC] border border-gray-600"
                placeholder="Enter your username"
              />
              {usernameTaken && (
                <p className="text-red-500 text-sm">Username is already taken!</p>
              )}
              <button
                type="submit"
                className="bg-[#877BFC] text-white px-4 py-2 rounded-md hover:bg-white hover:text-[#1F1F1F] transition-all duration-300"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
