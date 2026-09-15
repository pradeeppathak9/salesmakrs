import { useEffect, useState } from "react";
import client from "../api/client";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import OrderForm from "../components/OrderForm";
import OrderDetail from "../components/OrderDetail";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { IconClipboard, IconPlus } from "../components/icons";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [ordersRes, productsRes, retailersRes] = await Promise.all([
        client.get("/api/orders"),
        client.get("/api/products"),
        client.get("/api/retailers"),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setRetailers(retailersRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (payload) => {
    await client.post("/api/orders", payload);
    setShowCreate(false);
    load();
  };

  const act = async (orderId, action, body) => {
    setError("");
    setActing(true);
    try {
      await client.patch(`/api/orders/${orderId}/${action}`, body);
      setDetailOrder(null);
      setRejectOrder(null);
      setRejectReason("");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Action failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-subtitle">Orders placed by you, your salespersons, and your retailers.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <IconPlus width={16} height={16} />
          Create order
        </Button>
      </div>

      {error && <div className="alert-danger">{error}</div>}

      {showCreate && (
        <Modal title="Create order" size="lg" onClose={() => setShowCreate(false)}>
          <OrderForm
            products={products}
            retailers={retailers}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Create order"
          />
        </Modal>
      )}

      {detailOrder && (
        <Modal title={`Order #${detailOrder.id}`} size="lg" onClose={() => setDetailOrder(null)}>
          <OrderDetail order={detailOrder} />
          <div className="modal-actions">
            {detailOrder.status === "pending" && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRejectOrder(detailOrder);
                    setDetailOrder(null);
                  }}
                >
                  Reject
                </Button>
                <Button disabled={acting} onClick={() => act(detailOrder.id, "approve")}>
                  Approve
                </Button>
              </>
            )}
            {detailOrder.status === "approved" && (
              <Button disabled={acting} onClick={() => act(detailOrder.id, "fulfill")}>
                Mark fulfilled
              </Button>
            )}
            {["pending", "approved"].includes(detailOrder.status) && (
              <Button variant="secondary" disabled={acting} onClick={() => act(detailOrder.id, "cancel")}>
                Cancel order
              </Button>
            )}
          </div>
        </Modal>
      )}

      {rejectOrder && (
        <Modal title={`Reject order #${rejectOrder.id}`} onClose={() => setRejectOrder(null)}>
          <div className="field">
            <label>Reason (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. out of stock, over credit limit"
            />
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setRejectOrder(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={acting}
              onClick={() => act(rejectOrder.id, "reject", { reason: rejectReason || null })}
            >
              Reject order
            </Button>
          </div>
        </Modal>
      )}

      {loading ? (
        <p className="page-subtitle">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="table-wrap">
          <EmptyState icon={IconClipboard} message='No orders yet. Click "Create order" to add one.' />
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
