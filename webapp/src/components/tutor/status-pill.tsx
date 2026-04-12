export function StatusPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const toneClassName =
    tone === "good"
      ? "bg-primary text-white"
      : tone === "bad"
        ? "bg-error text-white"
        : "bg-surface-container-low text-on-surface";

  return (
    <div
      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] shadow-neumorphic-raised ${toneClassName}`}
    >
      <span className="mr-2 opacity-75">{label}</span>
      <span>{value}</span>
    </div>
  );
}
