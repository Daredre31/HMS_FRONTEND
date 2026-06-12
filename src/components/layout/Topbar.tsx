import { Menu, PanelLeftClose, PanelLeftOpen, Bell } from "lucide-react";

interface TopbarProps {
  isSidebarCollapsed: boolean;
  onMobileOpen: () => void;
  onDesktopToggle: () => void;
  adminName?: string;
}

export default function Topbar({
  isSidebarCollapsed,
  onMobileOpen,
  onDesktopToggle,
  adminName = "Admin",
}: TopbarProps) {
  // first name only
  const firstName = adminName.split(" ")[0];

  return (
    <header className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* hamburger — mobile only */}
        <button
          onClick={onMobileOpen}
          className="lg:hidden p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dark-mid)] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* collapse toggle — desktop only */}
        <button
          onClick={onDesktopToggle}
          className="hidden lg:flex p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dark-mid)] transition-colors"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>

        <span className="text-[var(--color-text-secondary)] text-sm hidden sm:block">
          Welcome back, <span className="text-[var(--color-text-primary)] font-medium">{firstName}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* notification bell — placeholder for now */}
        <button className="p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-dark-mid)] transition-colors relative">
          <Bell size={18} />
          {/* unread dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-teal)]" />
        </button>

        {/* avatar */}
        <div className="w-8 h-8 rounded-full bg-[var(--color-teal)] flex items-center justify-center text-white text-xs font-bold">
          {firstName[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
