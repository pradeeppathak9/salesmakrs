import DashboardShell from "./DashboardShell";
import { IconClipboard, IconPlus } from "./icons";

const navItems = [
  { to: "/retailer/place-order", label: "Place order", icon: IconPlus },
  { to: "/retailer/orders", label: "My orders", icon: IconClipboard },
];

export default function RetailerLayout() {
  return <DashboardShell navItems={navItems} primaryField="name" secondaryField="email" />;
}
