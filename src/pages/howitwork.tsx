interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "We set up your hostel",
    description:
      "A private instance with your blocks, rooms and houses loaded in, ready before your boarders arrive.",
  },
  {
    number: "02",
    title: "Import your boarders",
    description:
      "One spreadsheet in, and bed allocation, fees and roll-call are ready the same day.",
  },
  {
    number: "03",
    title: "Run the session",
    description:
      "HOH checks in every night, admin reconciles fees, and every entry stays logged for the term.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[var(--color-bg-soft)] py-24 sm:py-28">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        {/* Left: sticky intro */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">
            How it works
          </span>

          <h2 className="mt-4 font-serif text-[2.1rem] font-semibold leading-[1.15] tracking-tight text-[var(--color-text-primary)] sm:text-[2.6rem]">
            Live before the next resumption
          </h2>

          <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-[var(--color-text-secondary)]">
            One hostel, one instance. Your boarder data never sits beside
            another hostel's — your rules, your backups, your record.
          </p>
        </div>

        {/* Right: numbered steps */}
        <div className="flex flex-col gap-5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-7 transition-colors hover:border-[var(--color-teal-border)]"
            >
              <span className="shrink-0 font-serif text-[1.9rem] font-semibold leading-none text-[var(--color-teal-mid)]">
                {step.number}
              </span>
              <div>
                <h3 className="text-[16.5px] font-semibold text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
