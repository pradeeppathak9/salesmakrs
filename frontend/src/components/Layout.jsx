import DashboardShell from "./DashboardShell";
import { IconBox, IconClipboard, IconStore, IconUsers } from "./icons";

const navItems = [
  { to: "/orders", label: "Orders", icon: IconClipboard },
  { to: "/products", label: "Products", icon: IconBox },
  { to: "/retailers", label: "Retailers", icon: IconStore },
  { to: "/salespersons", label: "Salespersons", icon: IconUsers },
];

export default function Layout() {
  return <DashboardShell navItems={navItems} primaryField="company_name" secondaryField="email" />;
}
