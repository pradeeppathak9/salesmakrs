import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderDetail({ order }) {
  return (
    <div className="order-detail">
      <div className="order-detail-meta">
        <div>
          <span className="caption">Retailer</span>
          <br />
          {order.retailer_name}
        </div>
        <div>
          <span className="caption">Placed by</span>
          <br />
          {order.placed_by_name} ({order.placed_by_role})
        </div>
        <div>
          <span className="caption">Status</span>
          <br />
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {order.status === "rejected" && (
        <div className="alert-danger">
          Rejected{order.rejection_reason ? `: ${order.rejection_reason}` : "."}
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th className="num">Qty</th>
              <th className="num">Unit price</th>
              <th className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td className="num">{item.quantity}</td>
                <td className="num">${item.unit_price.toFixed(2)}</td>
                <td className="num">${(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-total">
        <span>Total</span>
        <strong>${order.total.toFixed(2)}</strong>
      </div>
    </div>
  );
}
