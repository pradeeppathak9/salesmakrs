import DashboardShell from "./DashboardShell";
import { IconClipboard, IconPlus } from "./icons";

const navItems = [
  { to: "/sales/place-order", label: "Place order", icon: IconPlus },
  { to: "/sales/orders", label: "My orders", icon: IconClipboard },
];

export default function SalespersonLayout() {
  return <DashboardShell navItems={navItems} primaryField="name" secondaryField="email" />;
}
