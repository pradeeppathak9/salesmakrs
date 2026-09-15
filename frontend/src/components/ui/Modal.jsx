export default function Modal({ title, onClose, size, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal${size === "lg" ? " modal-lg" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}
