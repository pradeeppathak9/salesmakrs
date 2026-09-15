import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

export default function RoleLoginPage({ title, onLogin, homePath, footer }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
      navigate(homePath);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="brand">
          <span className="brand-mark">S</span>
          SalesMakrs
        </span>
        <h1>{title}</h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert-danger">{error}</div>}
          <Button type="submit" block disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        {footer}
      </div>
    </div>
  );
}
