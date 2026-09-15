import { useEffect, useState } from "react";
import client from "../api/client";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import EmptyState from "./ui/EmptyState";
import { IconPlus } from "./icons";

export default function ResourcePage({
  title,
  subtitle,
  endpoint,
  icon,
  columns,
  fields,
  emptyItem,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyItem);

  const singular = title.endsWith("s") ? title.slice(0, -1) : title;

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get(endpoint);
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const openCreateForm = () => {
    setForm(emptyItem);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    const next = { ...emptyItem };
    Object.keys(emptyItem).forEach((key) => {
      next[key] = item[key] ?? emptyItem[key];
    });
    setForm(next);
    setEditingId(item.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyItem);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form };
      fields.forEach((f) => {
        if (f.type === "number") {
          payload[f.key] = payload[f.key] === "" ? 0 : Number(payload[f.key]);
        }
        if (f.type === "password" && !payload[f.key]) {
          delete payload[f.key];
        }
      });
      if (editingId) {
        await client.put(`${endpoint}/${editingId}`, payload);
      } else {
        await client.post(endpoint, payload);
      }
      closeForm();
      loadItems();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    try {
      await client.delete(`${endpoint}/${id}`);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <Button onClick={openCreateForm}>
          <IconPlus width={16} height={16} />
          Add {singular}
        </Button>
      </div>

      {error && <div className="alert-danger">{error}</div>}

      {showForm && (
        <Modal title={`${editingId ? "Edit" : "Add"} ${singular}`} onClose={closeForm}>
          <form onSubmit={handleSubmit}>
            {fields.map((f) => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <input
                  className="input"
                  type={f.type === "number" ? "number" : f.type === "password" ? "password" : "text"}
                  step={f.type === "number" ? "0.01" : undefined}
                  value={form[f.key] ?? ""}
                  required={f.required}
                  placeholder={f.placeholder}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                />
                {f.hint && <span className="hint">{f.hint}</span>}
              </div>
            ))}
            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {loading ? (
        <p className="page-subtitle">Loading...</p>
      ) : items.length === 0 ? (
        <div className="table-wrap">
          <EmptyState
            icon={icon}
            message={`No ${title.toLowerCase()} yet. Click "Add ${singular}" to create one.`}
          />
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(item) : item[c.key] || "—"}</td>
                  ))}
                  <td className="row-actions">
                    <button className="link-btn" onClick={() => openEditForm(item)}>
                      Edit
                    </button>
                    <button className="link-btn danger" onClick={() => handleDelete(item.id)}>
                      Delete
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
