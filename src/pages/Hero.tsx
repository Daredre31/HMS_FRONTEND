import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-teal)] pb-24 pt-36 sm:pb-32 sm:pt-44">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(93,202,165,0.28),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(93,202,165,0.2),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Eyebrow badge */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-teal-mid)]" />
          <span className="text-[13px] font-medium text-white/90">
            One hostel. One private system. Not a shared spreadsheet.
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-[3.3rem] lg:text-[3.7rem]">
          Your hostel still runs on paper ledgers and WhatsApp roll-calls
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-2xl text-[16.5px] leading-relaxed text-white/80 sm:text-[17px]">
          Beds get double-allocated, a boarder goes unaccounted for at 10pm
          check, and hostel fees only add up during a reconciliation weekend.
          HostelOS gives admins, heads of hostel, and students each their own
          login — so every bed, complaint, and payment lives in one place
          your staff actually trusts.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#portal"
            className="group inline-flex items-center gap-2 rounded-xl bg-[var(--color-bg-page)] px-6 py-3.5 text-[15px] font-semibold text-[var(--color-teal-hover)] shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
          >
            Access your portal
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            See what's inside
          </a>
        </div>

        {/* Trust strip */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] font-medium text-white/60">
          <span>Role-based portals</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Live occupancy &amp; fee tracking</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Session-secured logins</span>
        </div>
      </div>
    </section>
  );
}
