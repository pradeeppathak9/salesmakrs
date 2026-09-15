import { useState } from "react";
import Button from "./ui/Button";

function emptyLine() {
  return { product_id: "", quantity: 1 };
}

export default function OrderForm({ products, retailers, onSubmit, onCancel, submitLabel = "Place order" }) {
  const [retailerId, setRetailerId] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const productById = (id) => products.find((p) => String(p.id) === String(id));

  const updateLine = (index, patch) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index));

  const total = lines.reduce((sum, line) => {
    const product = productById(line.product_id);
    const qty = Number(line.quantity) || 0;
    return sum + (product ? product.price * qty : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (retailers && !retailerId) {
      setError("Select a retailer");
      return;
    }
    const items = lines
      .filter((line) => line.product_id)
      .map((line) => ({ product_id: Number(line.product_id), quantity: Number(line.quantity) || 1 }));
    if (items.length === 0) {
      setError("Add at least one product line");
      return;
    }

    setSaving(true);
    try {
      const payload = { items };
      if (retailers) payload.retailer_id = Number(retailerId);
      await onSubmit(payload);
      setLines([emptyLine()]);
      setRetailerId("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to place order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {retailers && (
        <div className="field">
          <label>Retailer</label>
          <select className="input" value={retailerId} onChange={(e) => setRetailerId(e.target.value)}>
            <option value="">Select a retailer…</option>
            {retailers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label>Products</label>
        <div className="order-lines">
          {lines.map((line, index) => {
            const product = productById(line.product_id);
            return (
              <div className="order-line" key={index}>
                <select
                  className="input"
                  value={line.product_id}
                  onChange={(e) => updateLine(index, { product_id: e.target.value })}
                >
                  <option value="">Select a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.sku ? ` (${p.sku})` : ""} — ${p.price.toFixed(2)}
                    </option>
                  ))}
                </select>
                <input
                  className="input order-line-qty"
                  type="number"
                  min="1"
                  value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: e.target.value })}
                />
                <div className="order-line-subtotal">
                  {product ? `$${(product.price * (Number(line.quantity) || 0)).toFixed(2)}` : "—"}
                </div>
                <button
                  type="button"
                  className="link-btn danger"
                  onClick={() => removeLine(index)}
                  disabled={lines.length === 1}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" className="link-btn" onClick={addLine}>
          + Add line
        </button>
      </div>

      <div className="order-total">
        <span>Total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      {error && <div className="alert-danger">{error}</div>}

      <div className="modal-actions">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Placing..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
