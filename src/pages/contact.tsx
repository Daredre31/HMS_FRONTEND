import { ArrowRight, Mail } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Reports", href: "#reports" },
  { label: "Privacy", href: "#privacy" },
];

export default function ContactSection() {
  return (
    <section id="contact" className="bg-[var(--color-dark)] pt-24 sm:pt-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 items-center gap-10 pb-20 lg:grid-cols-[1.1fr_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 className="font-serif text-[2.3rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.9rem]">
              Need help with the hostel portal?
            </h2>
            <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-[var(--color-sidebar-text)]">
              For login issues, fee queries or anything about your ward's
              hostel record, reach the Appclick ICT Academy hostel office
              directly and we'll sort it out.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label htmlFor="contact-email" className="sr-only">
              Your email
            </label>
            <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-[var(--color-dark-mid)] bg-[var(--color-dark-mid)]/40 px-4 py-3.5">
              <Mail className="h-4 w-4 shrink-0 text-[var(--color-sidebar-text)]" />
              <input
                id="contact-email"
                type="email"
                required
                placeholder="your.email@example.com"
                className="w-full bg-transparent text-[14.5px] text-white placeholder:text-[var(--color-sidebar-muted)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-teal-mid)] px-5 py-3.5 text-[14.5px] font-semibold text-[var(--color-dark)] transition-colors hover:bg-white"
            >
              Send message
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>
        <div className="border-t border-[var(--color-dark-mid)]" />
        <div className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--color-teal)] font-serif text-[15px] font-semibold text-white">
              <img src="/resentra-logo2.png" alt="resentra-logo" />
            </span>
            <span className="font-serif text-[15.5px] font-semibold text-white">
              Resentra
            </span>
          </a>

          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[13.5px] font-medium text-[var(--color-sidebar-text)] transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <span className="text-[13px] text-[var(--color-sidebar-muted)]">
            &copy; {new Date().getFullYear()} Appclick ICT Academy. Hostel management by UtmostLabs.
          </span>
        </div>
      </div>
    </section>
  );
}
