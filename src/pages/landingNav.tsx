import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Reports", href: "#reports" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={`w-full max-w-5xl flex items-center justify-between gap-6 rounded-2xl border transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-[var(--color-border)] shadow-[0_8px_30px_-12px_rgba(44,44,42,0.25)] px-5 py-2.5"
            : "bg-white/35 backdrop-blur-sm border-white/25 px-6 py-3.5"
        }`}
      >

        <div className="flex items-center gap-2">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--color-teal)] font-serif text-base font-semibold text-white">
            <img src="/resentra-logo2.png" alt="resentra-logo" />
          </span>
          <span
            className={`font-serif text-[17px] font-semibold tracking-tight ${
              scrolled ? "text-[var(--color-text-primary)]" : "text-white"
            }`}
          >
           Resentra
          </span> </div>
        

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`text-[14.5px] font-medium transition-colors hover:text-[var(--color-teal-mid)] ${
                  scrolled ? "text-[var(--color-text-secondary)]" : "text-white/85"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">

          <Link to='/admin/login'>
              <button
            className={`text-[14.5px] font-medium transition-colors ${
              scrolled ? "text-[var(--color-text-primary)] hover:text-[var(--color-teal)]" : "text-white/90 hover:text-white"
            }`}
          >
            Sign in
          </button>
          </Link>
        

        <Link to='/student/login'> 
        <button
            className="group inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-teal)] px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-teal-hover)]"
          >
            Access your portal
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button></Link>
         
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className={`flex h-9 w-9 items-center justify-center rounded-lg md:hidden ${
            scrolled ? "text-[var(--color-text-primary)]" : "text-white"
          }`}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] w-[calc(100%-2rem)] max-w-5xl rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-xl md:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-[15px] font-medium text-[var(--color-text-primary)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2.5 border-t border-[var(--color-border-soft)] pt-4">

            <Link to='/admin/login'>
            <a
              onClick={() => setMenuOpen(false)}
              className="py-2 text-center text-[14.5px] font-medium text-[var(--color-text-primary)]"
            >
              Sign in
            </a> </Link>

            <Link to='/student/login'>
            <a
           
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-[var(--color-teal)] px-4 py-2.5 text-center text-[14px] font-semibold text-white"
            >
              Access your portal
            </a> </Link>
          </div>
        </div>
      )}
    </header>
  );
}
