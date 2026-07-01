import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/api";

// types

interface StudentData {
  _id: string;
  name: string;
  email: string;
  tokenId: string;
  currentSession: string;
  paymentStatus: "paid" | "pending";
  isTaken: boolean;
  expiryDate: string;
  bed: {
    bedNumber: string;
    room: {
      roomNumber: string | number;
      roomStatus: string;
    };
  };
}

// ── Student sidebar nav

const NAV_ITEMS = [
  { label: "Dashboard", path: "/student/dashboard", icon: <GridIcon /> },
  { label: "My Room", path: "/student/room", icon: <DoorIcon /> },
  { label: "Payment", path: "/student/payment", icon: <ReceiptIcon /> },
  { label: "Tasks", path: "/student/tasks", icon: <TaskIcon /> },
  { label: "Complaints", path: "/student/complaints", icon: <ChatIcon /> },
  { label: "Handbook", path: "/student/handbook", icon: <BookIcon /> },
];

// ── Student dashboard 

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [student, setStudent] = useState<StudentData | null>(null);

  // Pull student data from localStorage — saved during login
  useEffect(() => {
    const stored = localStorage.getItem("hms_student");
    if (!stored) {
      navigate("/student/login");
      return;
    }
    setStudent(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
  if (mobileOpen) setCollapsed(false);
}, [mobileOpen]);

  const handleLogout = async () => {
  try {
    await logout();
  } finally {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_student_token");
    localStorage.removeItem("hms_user");
    localStorage.removeItem("hms_student");
    navigate("/student/login")
  }
};

  // How many days until the token expires
  const daysUntilExpiry = student
    ? Math.ceil(
        (new Date(student.expiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const expiryWarning = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  return (
    <div className="flex h-screen bg-bg-page font-sans overflow-hidden">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:relative z-30 flex flex-col bg-dark min-h-screen
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? "w-16" : "w-56"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo + collapse */}
        <div className={`flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center flex-shrink-0">
                <HouseIconSm />
              </div>
              <span className="text-teal-light text-sm font-semibold tracking-tight">APPCLICk_HostelOS</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="hidden md:flex text-sidebar-muted hover:text-teal transition-colors p-1 rounded"
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ label, path, icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                  ${active ? "bg-teal text-white" : "text-sidebar-text hover:bg-white/5 hover:text-white"}
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span className="flex-shrink-0">{icon}</span>
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Student info + logout */}
        <div className={`p-3 border-t border-white/5 flex-shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          {!collapsed ? (
            <div>
              <p className="text-xs text-white font-medium truncate">{student?.name}</p>
              <p className="text-xs text-sidebar-muted truncate mb-2.5">{student?.email}</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-sidebar-muted hover:text-red transition-colors"
              >
                <LogoutIcon /> Sign out
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} title="Sign out" className="text-sidebar-muted hover:text-red transition-colors">
              <LogoutIcon />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top navbar */}
        <header className="h-16 bg-bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
            >
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-text-primary tracking-tight">
                {student ? `Welcome, ${student.name.split(" ")[0]}` : "Dashboard"}
              </h1>
              <p className="text-xs text-text-secondary hidden sm:block">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long", day: "numeric",
                  month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Student avatar */}
          <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal text-xs font-bold flex-shrink-0">
            {student?.name?.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* Expiry warning banner */}
          {expiryWarning && (
            <div className="flex items-center gap-2.5 bg-amber-bg border border-amber-border text-amber rounded-lg px-4 py-3 text-sm mb-5">
              <AlertIcon />
              Your hostel ID expires in <strong>{daysUntilExpiry} days</strong>. Contact admin to renew.
            </div>
          )}

          {isExpired && (
            <div className="flex items-center gap-2.5 bg-red-bg border border-red-border text-red rounded-lg px-4 py-3 text-sm mb-5">
              <AlertIcon />
              Your hostel ID has expired. Contact admin immediately.
            </div>
          )}

          <div className="space-y-5">

            {/* ── Info cards row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Room and bed card */}
              <div className="bg-bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-teal-light flex items-center justify-center text-teal flex-shrink-0">
                    <DoorIcon />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">Room info</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Room number</p>
                    <p className="text-xs font-semibold text-text-primary">
                      Room {student?.bed?.room?.roomNumber ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Bed number</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {student?.bed?.bedNumber ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Room status</p>
                    <span className="text-xs font-medium text-green bg-green-bg border border-green-border px-2 py-0.5 rounded-full">
                      {student?.bed?.room?.roomStatus ?? "Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment card */}
              <div className="bg-bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    student?.paymentStatus === "paid"
                      ? "bg-green-bg text-green"
                      : "bg-amber-bg text-amber"
                  }`}>
                    <ReceiptIcon />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">Payment</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Status</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      student?.paymentStatus === "paid"
                        ? "bg-green-bg text-green border-green-border"
                        : "bg-amber-bg text-amber border-amber-border"
                    }`}>
                      {student?.paymentStatus ?? "pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Session</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {student?.currentSession ?? "—"}
                    </p>
                  </div>
                </div>
                {student?.paymentStatus === "pending" && (
                  <div className="mt-4 pt-3 border-t border-border-soft">
                    <p className="text-xs text-amber">
                      Payment pending. Contact admin to update your status.
                    </p>
                  </div>
                )}
              </div>

              {/* Session and ID card */}
              <div className="bg-bg-card rounded-xl border border-border p-5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-bg flex items-center justify-center text-blue flex-shrink-0">
                    <CalendarIcon />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">Session</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Current session</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {student?.currentSession ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Expiry date</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {student
                        ? new Date(student.expiryDate).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Days remaining</p>
                    <p className={`text-xs font-semibold ${
                      daysUntilExpiry <= 30 ? "text-amber" : "text-green"
                    }`}>
                      {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : "Expired"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Student token card ── */}
            <div className="bg-bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-light flex items-center justify-center text-teal flex-shrink-0">
                    <KeyIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Your login ID</p>
                    <p className="text-xs text-text-muted">Keep this safe — it's how you log in</p>
                  </div>
                </div>
              </div>
              <div className="bg-bg-page rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-sm font-mono font-semibold text-text-primary tracking-widest">
                  {student?.tokenId ?? "—"}
                </span>
                <span className="text-xs text-text-muted flex-shrink-0">
                  Your access key
                </span>
              </div>
            </div>

            {/* ── Quick links ── */}
            <div>
              <h2 className="text-sm font-semibold text-text-primary mb-3">Quick access</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "My room", path: "/student/room", icon: <DoorIcon />, color: "bg-teal-light text-teal" },
                  { label: "Payment", path: "/student/payment", icon: <ReceiptIcon />, color: "bg-green-bg text-green" },
                  { label: "Complaints", path: "/student/complaints", icon: <ChatIcon />, color: "bg-amber-bg text-amber" },
                  { label: "Handbook", path: "/student/handbook", icon: <BookIcon />, color: "bg-blue-bg text-blue" },
                ].map(({ label, path, icon, color }) => (
                  <Link
                    key={path}
                    to={path}
                    className="
                      bg-bg-card border border-border rounded-xl p-4
                      flex flex-col items-center gap-2.5
                      hover:border-teal hover:shadow-sm
                      transition-all duration-150 group
                    "
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                      {icon}
                    </div>
                    <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors text-center">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Hostel rules reminder ── */}
            <div className="bg-dark rounded-xl p-5 relative overflow-hidden">
              <span className="absolute -top-8 -right-8 w-32 h-32 rounded-full border border-teal/20 pointer-events-none" />
              <span className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border border-teal/10 pointer-events-none" />
              <div className="flex items-start justify-between gap-4 relative">
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Hostel rules & handbook</p>
                  <p className="text-xs text-dark-muted leading-relaxed max-w-xs">
                    Make sure you're familiar with the hostel rules. Download the handbook for the full guidelines.
                  </p>
                </div>
                <Link
                  to="/student/handbook"
                  className="flex-shrink-0 flex items-center gap-1.5 bg-teal hover:bg-teal-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <BookIcon />
                  <span className="hidden sm:inline">View</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


// ── Icons ─────────────────────────────────────────────────────

function HouseIconSm() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>; }
function GridIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>; }
function DoorIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4H3v18h18V9l-8-5z" /><path d="M13 4v5h5" /></svg>; }
function ReceiptIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>; }
function TaskIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,11 12,14 22,4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>; }
function ChatIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>; }
function BookIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>; }
function ChevronLeftIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6" /></svg>; }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6" /></svg>; }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function AlertIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function KeyIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>; }
function CalendarIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>; }
