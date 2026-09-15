import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LOGIN_PATH } from "../constants/roles";

export default function ProtectedRoute({ role, children }) {
  const { role: currentRole } = useAuth();
  if (currentRole !== role) {
    return <Navigate to={LOGIN_PATH[role]} replace />;
  }
  return children;
}
