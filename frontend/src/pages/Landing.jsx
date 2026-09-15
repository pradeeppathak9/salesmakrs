import { Link } from "react-router-dom";
import { IconClipboard, IconStore, IconUsers } from "../components/icons";
import ThemeToggle from "../components/ThemeToggle";

const portals = [
  {
    role: "Distributor",
    icon: IconClipboard,
    description:
      "Manage your product catalog, your retailer and salesperson directory, and approve, reject, or fulfill every order that comes in.",
    loginPath: "/login",
    signupPath: "/signup",
  },
  {
    role: "Salesperson",
    icon: IconUsers,
    description:
      "Place orders on behalf of any retailer while you're in the field. Every order you place waits for your distributor's approval.",
    loginPath: "/sales/login",
  },
  {
    role: "Retailer",
    icon: IconStore,
    description:
      "Browse your distributor's catalog and place your own orders directly, then track each one through to fulfillment.",
    loginPath: "/retailer/login",
  },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <span className="brand">
          <span className="brand-mark">SM</span>
          SalesMakrs
        </span>
        <div className="landing-header-actions">
          <ThemeToggle />
          <Link to="/login" className="btn btn-secondary btn-sm">
            Distributor log in
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <p className="kicker">Distribution management</p>
        <h1 className="landing-display">Run your distribution business from one order book.</h1>
        <p className="landing-lede">
          SalesMakrs connects a distributor, their field salespersons, and their retailers around
          one shared order book. Every order a salesperson or retailer places waits for the
          distributor's approval before it moves.
        </p>
        <div className="landing-hero-actions">
          <Link to="/signup" className="btn btn-primary">
            Sign up as a Distributor
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Distributor log in
          </Link>
        </div>
      </section>

      <section className="landing-section">
        <h2>Three portals, one order book</h2>
        <p className="page-subtitle">Everyone logs in separately, scoped to what their role needs.</p>

        <div className="landing-portals">
          {portals.map(({ role, icon: Icon, description, loginPath, signupPath }) => (
            <div className="landing-portal" key={role}>
              <Icon className="landing-portal-icon" width={28} height={28} />
              <h3>{role}</h3>
              <p>{description}</p>
              <div className="landing-portal-actions">
                <Link to={loginPath} className="btn btn-secondary btn-sm">
                  Log in
                </Link>
                {signupPath && (
                  <Link to={signupPath} className="link-btn">
                    Sign up →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-statement">
        <h2>Orders from the field wait for a yes — not a spreadsheet.</h2>
      </section>

      <footer className="landing-footer">
        <span className="muted-inline">SalesMakrs</span>
      </footer>
    </div>
  );
}
