import ResourcePage from "../components/ResourcePage";
import Badge from "../components/ui/Badge";
import { IconUsers } from "../components/icons";

const columns = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "region", label: "Region" },
  {
    key: "has_login",
    label: "App access",
    render: (item) =>
      item.has_login ? (
        <Badge tone="up">Enabled</Badge>
      ) : (
        <Badge tone="neutral-muted">Not set</Badge>
      ),
  },
];

const fields = [
  { key: "name", label: "Salesperson name", required: true },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "region", label: "Region / territory" },
  {
    key: "password",
    label: "App password",
    type: "password",
    placeholder: "Leave blank to skip",
    hint: "Optional — set this to let the salesperson log into the field app later. Leave blank when editing to keep the current password unchanged.",
  },
];

const emptyItem = { name: "", phone: "", email: "", region: "", password: "" };

export default function Salespersons() {
  return (
    <ResourcePage
      title="Salespersons"
      subtitle="Your team of field sales reps."
      endpoint="/api/salespersons"
      icon={IconUsers}
      columns={columns}
      fields={fields}
      emptyItem={emptyItem}
    />
  );
}
