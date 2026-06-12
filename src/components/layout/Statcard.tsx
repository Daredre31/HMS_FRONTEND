import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  // color variant drives the icon bg + accent
  variant?: "teal" | "green" | "amber" | "blue" | "red";
  subtext?: string;
  loading?: boolean;
}

const variantMap: Record<
  NonNullable<StatCardProps["variant"]>,
  { bg: string; icon: string; border: string }
> = {
  teal: {
    bg: "bg-[var(--color-teal-light)]",
    icon: "text-[var(--color-teal)]",
    border: "border-[var(--color-teal-border)]",
  },
  green: {
    bg: "bg-[var(--color-green-bg)]",
    icon: "text-[var(--color-green)]",
    border: "border-[var(--color-green-border)]",
  },
  amber: {
    bg: "bg-[var(--color-amber-bg)]",
    icon: "text-[var(--color-amber)]",
    border: "border-[var(--color-amber-border)]",
  },
  blue: {
    bg: "bg-[var(--color-blue-bg)]",
    icon: "text-[var(--color-blue)]",
    border: "border-[var(--color-blue-border)]",
  },
  red: {
    bg: "bg-[var(--color-red-bg)]",
    icon: "text-[var(--color-red)]",
    border: "border-[var(--color-red-border)]",
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  variant = "teal",
  subtext,
  loading = false,
}: StatCardProps) {
  const styles = variantMap[variant];

  return (
    <div
      className={`bg-[var(--color-bg-card)] border ${styles.border} rounded-xl p-4 flex items-start gap-4`}
    >
      {/* icon bubble */}
      <div className={`p-2.5 rounded-lg ${styles.bg} shrink-0`}>
        <Icon size={20} className={styles.icon} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wide mb-1">
          {label}
        </p>

        {loading ? (
          // skeleton shimmer
          <div className="h-7 w-16 rounded bg-[var(--color-dark-mid)] animate-pulse" />
        ) : (
          <p className="text-[var(--color-text-primary)] text-2xl font-bold leading-none">
            {value}
          </p>
        )}

        {subtext && !loading && (
          <p className="text-[var(--color-text-muted)] text-xs mt-1 truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
