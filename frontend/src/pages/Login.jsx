import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleLoginPage from "../components/RoleLoginPage";
import { HOME_PATH } from "../constants/roles";

export default function Login() {
  const { distributorLogin } = useAuth();
  return (
    <RoleLoginPage
      title="Distributor login"
      onLogin={distributorLogin}
      homePath={HOME_PATH.distributor}
      footer={
        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      }
    />
  );
}
