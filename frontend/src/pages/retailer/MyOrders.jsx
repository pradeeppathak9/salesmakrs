import RoleOrdersPage from "../../components/RoleOrdersPage";

export default function RetailerMyOrders() {
  return (
    <RoleOrdersPage
      title="My orders"
      subtitle="Orders for your store — placed by you or your salesperson."
      canCancel={(order) => order.status === "pending" && order.placed_by_role === "retailer"}
    />
  );
}
