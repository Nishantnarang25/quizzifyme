import { createContext, useContext, useState, useEffect } from "react";

// createContext - this helps us to create a box where we wrap the AuthProvider
// Create a context (like a shared box)
const AuthContext = createContext();

// Provider component to wrap around the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NEW - this tracks if auth is still loading

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // NEW - once check is done, stop loading
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext in any component
export const useAuth = () => useContext(AuthContext);

//Basically we are fetching th user using localStorage.getItem("user");
//Usually the user = null, but we check if there is no user in local storage
//and if there is a user,  if (storedUser) {
//    setUser(JSON.parse(storedUser));
//  }
