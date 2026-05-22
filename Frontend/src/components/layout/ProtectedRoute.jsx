import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { token } = useSelector((state) => state.auth);

  // If there is no token in memory, kick them to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they have a token, render the nested routes (Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
