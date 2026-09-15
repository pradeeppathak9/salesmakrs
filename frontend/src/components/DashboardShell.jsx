import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconLogOut } from "./icons";
import { LOGIN_PATH } from "../constants/roles";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function DashboardShell({ navItems, primaryField, secondaryField }) {
  const { role, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(LOGIN_PATH[role]);
  };

  const primary = profile?.[primaryField];
  const secondary = profile?.[secondaryField];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S</span>
          Salesmakrs
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="account">
            <div className="account-avatar">{initials(primary)}</div>
            <div className="account-info">
              <div className="account-name">{primary}</div>
              <div className="account-email">{secondary}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-block" onClick={handleLogout}>
            <IconLogOut />
            Log out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
