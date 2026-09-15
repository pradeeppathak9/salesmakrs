import RoleOrdersPage from "../../components/RoleOrdersPage";

export default function SalespersonMyOrders() {
  return (
    <RoleOrdersPage
      title="My orders"
      subtitle="Orders you've placed on behalf of retailers."
      canCancel={(order) => order.status === "pending"}
    />
  );
}
