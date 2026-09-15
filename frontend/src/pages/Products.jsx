import ResourcePage from "../components/ResourcePage";
import { IconBox } from "../components/icons";

const columns = [
  { key: "name", label: "Name" },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price", render: (item) => `$${Number(item.price).toFixed(2)}` },
  { key: "unit", label: "Unit" },
];

const fields = [
  { key: "name", label: "Product name", required: true },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price", type: "number" },
  { key: "unit", label: "Unit (e.g. box, kg, piece)" },
];

const emptyItem = { name: "", sku: "", category: "", price: "", unit: "" };

export default function Products() {
  return (
    <ResourcePage
      title="Products"
      subtitle="The products your distribution business sells."
      endpoint="/api/products"
      icon={IconBox}
      columns={columns}
      fields={fields}
      emptyItem={emptyItem}
    />
  );
}
