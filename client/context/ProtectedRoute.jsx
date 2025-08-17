import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-white text-center py-10">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/about/QuizzifyMe" replace />;
  }

  return children;
};

export default ProtectedRoute;
