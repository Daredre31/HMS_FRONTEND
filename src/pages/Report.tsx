import { Check, Users, Wallet, MessageSquareWarning, ClipboardCheck } from "lucide-react";

const REPORT_TYPES = [
  "Fee collection by house, term and payment method",
  "Nightly roll-call trend, with missed check-ins flagged",
  "Complaint turnaround time, by category and HOH",
  "Occupancy by block, down to the empty bed",
];

const STATS = [
  {
    icon: Users,
    label: "Occupancy",
    value: "96%",
    tone: "blue" as const,
  },
  {
    icon: Wallet,
    label: "Fees collected",
    value: "82%",
    tone: "green" as const,
  },
  {
    icon: MessageSquareWarning,
    label: "Open complaints",
    value: "3",
    tone: "amber" as const,
  },
  {
    icon: ClipboardCheck,
    label: "Roll-call compliance",
    value: "99%",
    tone: "green" as const,
  },
];

const TONE_STYLES = {
  green: {
    bg: "bg-[var(--color-green-bg)]",
    border: "border-[var(--color-green-border)]",
    text: "text-[var(--color-green)]",
  },
  amber: {
    bg: "bg-[var(--color-amber-bg)]",
    border: "border-[var(--color-amber-border)]",
    text: "text-[var(--color-amber)]",
  },
  blue: {
    bg: "bg-[var(--color-blue-bg)]",
    border: "border-[var(--color-blue-border)]",
    text: "text-[var(--color-blue)]",
  },
};

// Sample nightly roll-call compliance, last 7 nights — for illustration only
const NIGHTLY_BARS = [72, 88, 95, 91, 99, 100, 97];

export default function ReportsSection() {
  return (
    <section id="reports" className="bg-[var(--color-bg-page)] py-24 sm:py-28">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        {/* Left: copy */}
        <div>
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">
            Reports
          </span>

          <h2 className="mt-4 font-serif text-[2.1rem] font-semibold leading-[1.15] tracking-tight text-[var(--color-text-primary)] sm:text-[2.6rem]">
            The numbers your bursar used to chase down by hand
          </h2>

          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[var(--color-text-secondary)]">
            Every allocation, payment and roll-call already lives in one
            place. Reports just read it back to you — no export, no manual
            reconciliation, no waiting on the matron's notebook.
          </p>

          <ul className="mt-8 flex flex-col gap-3.5">
            {REPORT_TYPES.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal)]">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className="text-[14.5px] leading-relaxed text-[var(--color-text-primary)]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: dashboard mock */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-[0_20px_60px_-25px_rgba(44,44,42,0.25)]">
          {/* Window chrome */}
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-red-border)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-amber-border)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-green-border)]" />
            </div>
            <span className="text-[12px] font-medium text-[var(--color-text-muted)]">
              Term 2 · Block A
            </span>
          </div> */}

          {/* Stat tiles */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {STATS.map(({ icon: Icon, label, value, tone }) => {
              const t = TONE_STYLES[tone];
              return (
                <div
                  key={label}
                  className={`rounded-xl border p-4 ${t.bg} ${t.border}`}
                >
                  <Icon className={`h-4 w-4 ${t.text}`} strokeWidth={1.75} />
                  <p className={`mt-2.5 text-[1.4rem] font-semibold leading-none ${t.text}`}>
                    {value}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-[var(--color-text-secondary)]">
                    {label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mini trend */}
          <div className="mt-5 rounded-xl border border-[var(--color-border-soft)] p-4">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Roll-call compliance, last 7 nights
            </p>
            <div className="mt-3 flex h-16 items-end gap-2">
              {NIGHTLY_BARS.map((height, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-[var(--color-teal-mid)]"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
