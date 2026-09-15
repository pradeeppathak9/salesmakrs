import { useEffect, useState } from "react";
import client from "../../api/client";
import OrderForm from "../../components/OrderForm";

export default function RetailerPlaceOrder() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get("/api/products");
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load catalog");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (payload) => {
    await client.post("/api/orders", payload);
    setSuccess(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Place order</h1>
          <p className="page-subtitle">
            Browse the catalog and place an order. It will need your distributor's approval.
          </p>
        </div>
      </div>

      {success && (
        <div className="alert-success">Order placed — it's now pending your distributor's approval.</div>
      )}
      {error && <div className="alert-danger">{error}</div>}

      {loading ? (
        <p className="page-subtitle">Loading catalog...</p>
      ) : (
        <div className="card order-form-card">
          <OrderForm products={products} onSubmit={handleSubmit} submitLabel="Place order" />
        </div>
      )}
    </div>
  );
}
