import { useEffect, useState } from "react";
import client from "../api/client";
import Modal from "./ui/Modal";
import EmptyState from "./ui/EmptyState";
import OrderDetail from "./OrderDetail";
import OrderStatusBadge from "./OrderStatusBadge";
import Button from "./ui/Button";
import { IconClipboard } from "./icons";

export default function RoleOrdersPage({ title, subtitle, canCancel }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/api/orders");
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (order) => {
    setActing(true);
    setError("");
    try {
      await client.patch(`/api/orders/${order.id}/cancel`);
      setDetailOrder(null);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to cancel order");
    } finally {
      setActing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      {error && <div className="alert-danger">{error}</div>}

      {detailOrder && (
        <Modal title={`Order #${detailOrder.id}`} size="lg" onClose={() => setDetailOrder(null)}>
          <OrderDetail order={detailOrder} />
          {canCancel(detailOrder) && (
            <div className="modal-actions">
              <Button variant="secondary" disabled={acting} onClick={() => handleCancel(detailOrder)}>
                Cancel order
              </Button>
            </div>
          )}
        </Modal>
      )}

      {loading ? (
        <p className="page-subtitle">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="table-wrap">
          <EmptyState icon={IconClipboard} message="No orders yet." />
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Retailer</th>
                <th>Placed by</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.retailer_name}</td>
                  <td>
                    {order.placed_by_name}{" "}
                    <span className="muted-inline">({order.placed_by_role})</span>
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="row-actions">
                    <button className="link-btn" onClick={() => setDetailOrder(order)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
