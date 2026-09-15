import { useAuth } from "../../context/AuthContext";
import RoleLoginPage from "../../components/RoleLoginPage";
import { HOME_PATH } from "../../constants/roles";

export default function SalespersonLogin() {
  const { salespersonLogin } = useAuth();
  return (
    <RoleLoginPage
      title="Salesperson login"
      onLogin={salespersonLogin}
      homePath={HOME_PATH.salesperson}
      footer={<p className="auth-switch">Ask your distributor for your login details.</p>}
    />
  );
}
