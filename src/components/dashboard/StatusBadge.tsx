const TONES: Record<string, string> = {
  DELIVERED: "success",
  PAID: "success",
  COMPLETED: "success",
  SHIPPED: "info",
  PROCESSING: "info",
  PENDING: "warning",
  CANCELLED: "danger",
  REFUNDED: "danger",
  FAILED: "danger",
};

export default function StatusBadge({ status }: { status: string }) {
  const tone = TONES[status] ?? "neutral";
  return (
    <span className={`badge badge-${tone}`}>
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
