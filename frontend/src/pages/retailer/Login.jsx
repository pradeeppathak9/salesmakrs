import { useAuth } from "../../context/AuthContext";
import RoleLoginPage from "../../components/RoleLoginPage";
import { HOME_PATH } from "../../constants/roles";

export default function RetailerLogin() {
  const { retailerLogin } = useAuth();
  return (
    <RoleLoginPage
      title="Retailer login"
      onLogin={retailerLogin}
      homePath={HOME_PATH.retailer}
      footer={<p className="auth-switch">Ask your distributor for your login details.</p>}
    />
  );
}
