import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  CreditCard,
  MessageSquareWarning,
  Bell,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import api, { logout } from "../../services/api";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

const navItems = [
  { to: "/admin/dashboard",     icon: LayoutDashboard,      label: "Dashboard"     },
  { to: "/admin/students",      icon: Users,                label: "Students"      },
  { to: "/admin/rooms",         icon: BedDouble,            label: "Rooms"         },
  { to: "/admin/payments",      icon: CreditCard,           label: "Payments"      },
  { to: "/admin/complaints",    icon: MessageSquareWarning, label: "Complaints"    },
  { to: "/admin/notifications", icon: Bell,                 label: "Notifications" },
  { to: "/admin/requests",      icon: ClipboardList,        label: "Requests"      },
  { to: "/admin/reports",       icon: FileText,             label: "Reports"       },
  { to: "/admin/settings",      icon: Settings,             label: "Settings"      },
];

export default function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const handleLogout = () => {
    logout()
    localStorage.removeItem("token");
    window.location.href = "/admin/login"; 
  };

  // inline style is the only reliable way to drive width transitions in Tailwind v4
  // dynamic class strings like `lg:w-${x}` don't get picked up by the compiler
  const desktopWidth = isCollapsed ? "64px" : "240px";

  return (
    <>
      {/* mobile backdrop — tap anywhere outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{ width: desktopWidth }}
        className={[
          // base layout
          "fixed top-0 left-0 z-40 h-full flex flex-col overflow-hidden",
          "bg-[var(--color-dark)] border-r border-[var(--color-border)]",
          "transition-[width,transform] duration-300 ease-in-out",
          // mobile: full-width drawer that slides in/out
          "max-lg:w-60!",
          isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          // desktop always visible
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* header row */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-border)] shrink-0">
          {/* logo — hidden when collapsed */}
          <span
            className={[
              "text-[var(--color-teal)] font-bold text-lg tracking-tight whitespace-nowrap",
              "transition-opacity duration-200",
              isCollapsed ? "opacity-0 pointer-events-none w-0 overflow-hidden" : "opacity-100",
            ].join(" ")}
          >
            HostelOS
          </span>

          {/* X button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded text-[var(--color-sidebar-muted)] hover:text-[var(--color-sidebar-text)] transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* nav links */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-0.5 px-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  title={isCollapsed ? label : undefined}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium",
                      "transition-colors duration-150 whitespace-nowrap",
                      isActive
                        ? "bg-[var(--color-teal)] text-white"
                        : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-dark-mid)] hover:text-[var(--color-text-primary)]",
                      isCollapsed ? "justify-center" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  {/* label fades out when collapsed — overflow hidden on parent clips it */}
                  <span
                    className={[
                      "truncate transition-opacity duration-200",
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* logout */}
        <div className="p-2 border-t border-[var(--color-border)] shrink-0">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Log out" : undefined}
            className={[
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm whitespace-nowrap",
              "text-[var(--color-sidebar-muted)] hover:text-[var(--color-red)]",
              "hover:bg-[var(--color-red-bg)] transition-colors duration-150",
              isCollapsed ? "justify-center" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <LogOut size={18} className="shrink-0" />
            <span
              className={[
                "transition-opacity duration-200",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
              ].join(" ")}
            >
              Log out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
