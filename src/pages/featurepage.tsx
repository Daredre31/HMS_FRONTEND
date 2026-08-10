import {
  BedDouble,
  ClipboardList,
  Wallet,
  MessageSquareWarning,
  CheckSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: BedDouble,
    title: "Bed-level allocation",
    description:
      "Assign a boarder to a bunk, not just a room. Blocks, rooms and bed spaces stay accurate for the whole session.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based portals",
    description:
      "Admin, HOH and student each get their own login and their own view. Nobody sees more than their role needs.",
  },
  {
    icon: MessageSquareWarning,
    title: "Complaints & maintenance",
    description:
      "A student logs a broken lock or a leaking tap, the right HOH gets it, and status stays visible until it's closed.",
  },
  {
    icon: CheckSquare,
    title: "Task management",
    description:
      "HOH assigns duties and follow-ups to staff, tracks what's done and what's overdue, without a paper duty roster.",
  },
  {
    icon: Wallet,
    title: "Hostel fees & dues",
    description:
      "Paid, pending and owing at a glance, with a per-term record every parent and admin can trust.",
  },
  {
    icon: ClipboardList,
    title: "Live notifications",
    description:
      "Complaints, announcements and roll-call gaps reach the right person the moment they happen, not the next morning.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[var(--color-bg-page)] py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Eyebrow */}
        <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">
          What's inside
        </span>

        {/* Headline */}
        <h2 className="mt-4 font-serif text-[2.1rem] font-semibold leading-[1.15] tracking-tight text-[var(--color-text-primary)] sm:text-[2.6rem]">
          Six problems, solved for your hostel only
        </h2>

        {/* Subtext */}
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--color-text-secondary)]">
          No modules you'll never open, and no other hostel's data in the
          same system. Just the six things your boarding house actually
          runs on, configured to your blocks, terms and staff.
        </p>

        {/* Grid */}
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group bg-[var(--color-bg-card)] p-8 transition-colors hover:bg-[var(--color-teal-light)]/40"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-teal-light)] text-[var(--color-teal)] transition-colors group-hover:bg-[var(--color-teal)] group-hover:text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>

              <h3 className="mt-5 text-[16.5px] font-semibold text-[var(--color-text-primary)]">
                {title}
              </h3>

              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
