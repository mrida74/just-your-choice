type StatusBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

const TONE_CLASSES: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "bg-zinc-100 text-zinc-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-blue-50 text-blue-700",
};

export default function StatusBadge({ label, tone = "default" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  );
}
