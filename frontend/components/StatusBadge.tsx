const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-sand/40 text-ink/70",
  PAID: "bg-moss/15 text-moss",
  PROCESSING: "bg-sand/40 text-ink/70",
  SHIPPED: "bg-clay-light/20 text-clay",
  DELIVERED: "bg-moss/15 text-moss",
  CANCELLED: "bg-clay/15 text-clay",
  REFUNDED: "bg-clay/15 text-clay",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase ${
        STATUS_STYLES[status] ?? "bg-ink/10 text-ink/60"
      }`}
    >
      {status}
    </span>
  );
}
