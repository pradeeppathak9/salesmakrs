import { IconInbox } from "../icons";

export default function EmptyState({ icon: Icon = IconInbox, message, action }) {
  return (
    <div className="empty-state">
      <Icon className="icon" />
      <p>{message}</p>
      {action}
    </div>
  );
}
