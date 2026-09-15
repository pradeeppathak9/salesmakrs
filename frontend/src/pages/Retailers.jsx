import ResourcePage from "../components/ResourcePage";
import Badge from "../components/ui/Badge";
import { IconStore } from "../components/icons";

const columns = [
  { key: "name", label: "Name" },
  { key: "contact_person", label: "Contact" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  {
    key: "has_login",
    label: "Portal access",
    render: (item) =>
      item.has_login ? (
        <Badge tone="up">Enabled</Badge>
      ) : (
        <Badge tone="neutral-muted">Not set</Badge>
      ),
  },
];

const fields = [
  { key: "name", label: "Retailer name", required: true },
  { key: "contact_person", label: "Contact person" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  {
    key: "password",
    label: "Portal password",
    type: "password",
    placeholder: "Leave blank to skip",
    hint: "Optional — set this to let the retailer log into their own portal later. Leave blank when editing to keep the current password unchanged.",
  },
];

const emptyItem = {
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  password: "",
};

export default function Retailers() {
  return (
    <ResourcePage
      title="Retailers"
      subtitle="The retailers your business supplies."
      endpoint="/api/retailers"
      icon={IconStore}
      columns={columns}
      fields={fields}
      emptyItem={emptyItem}
    />
  );
}
