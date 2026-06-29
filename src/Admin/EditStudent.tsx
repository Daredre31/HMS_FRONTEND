import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { getStudentByIdAPI, updateStudentAPI } from "../services/api";

// ── Types 
interface FormState {
  name: string;
  email: string;
  currentSession: string;
  paymentStatus: "paid" | "pending";
  role: "student" | "hoh" | "room_master" | "assistant_hoh";
}

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

// Sidebar nav

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <GridIcon /> },
  { label: "Students", path: "/admin/students", icon: <UsersIcon /> },
  { label: "Rooms", path: "/admin/rooms", icon: <DoorIcon /> },
  { label: "Payments", path: "/admin/payments", icon: <ReceiptIcon /> },
  { label: "Complaints", path: "/admin/complaints", icon: <ChatIcon /> },
  { label: "Tasks", path: "/admin/tasks", icon: <TaskIcon /> },
  { label: "Notifications", path: "/admin/notifications", icon: <BellIcon /> },
];

// Edit student page 

export default function EditStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>("");

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    currentSession: "",
    paymentStatus: "pending",
    role: "student",
  });

  // Guard route
  useEffect(() => {
    const stored = localStorage.getItem("hms_user");
    if (!stored) { navigate("/login"); return; }
    setAdmin(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Load existing student data
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await getStudentByIdAPI(id);
        const s = res.data.data;
        setStudentName(s.name);
        setForm({
          name: s.name,
          email: s.email,
          currentSession: s.currentSession,
          paymentStatus: s.paymentStatus,
          role: s.role ?? "student",
        });
      } catch {
        setError("Could not load student details. Try refreshing.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.currentSession) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      await updateStudentAPI(id!, {
        name: form.name,
        email: form.email,
        currentSession: form.currentSession,
        paymentStatus: form.paymentStatus,
        role: form.role,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-bg-page font-sans overflow-hidden">

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:relative z-30 flex flex-col bg-dark min-h-screen
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? "w-16" : "w-56"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className={`flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center flex-shrink-0">
                <HouseIconSm />
              </div>
              <span className="text-teal-light text-sm font-semibold tracking-tight">HostelOS</span>
            </div>
          )}
          <button onClick={() => setCollapsed((p) => !p)} className="hidden md:flex text-sidebar-muted hover:text-teal transition-colors p-1 rounded">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ label, path, icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                  ${active ? "bg-teal text-white" : "text-sidebar-text hover:bg-white/5 hover:text-white"}
                  ${collapsed ? "justify-center" : ""}
                `}>
                <span className="flex-shrink-0">{icon}</span>
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`p-3 border-t border-white/5 flex-shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          {!collapsed ? (
            <div>
              <p className="text-xs text-white font-medium truncate">{admin?.name}</p>
              <p className="text-xs text-sidebar-muted truncate mb-2.5">{admin?.email}</p>
              <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-sidebar-muted hover:text-red transition-colors">
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

        {/* Navbar */}
        <header className="h-16 bg-bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-text-secondary hover:text-text-primary transition-colors">
              <MenuIcon />
            </button>
            <div className="flex items-center gap-2 text-text-secondary">
              <Link to="/admin/students" className="text-xs hover:text-text-primary transition-colors">
                Students
              </Link>
              <span className="text-xs">/</span>
              <span className="text-xs text-text-primary font-medium truncate max-w-[140px]">
                {fetching ? "Loading..." : studentName}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal text-xs font-bold">
            {admin?.name?.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Form area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-xl mx-auto">

            <div className="mb-6">
              <h1 className="text-lg font-bold text-text-primary tracking-tight mb-1">
                Edit student
              </h1>
              <p className="text-sm text-text-secondary">
                Update the student's details. Room and bed assignment cannot be changed here.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-bg border border-red-border text-red rounded-lg px-4 py-3 text-sm mb-5">
                <AlertIcon />
                {error}
              </div>
            )}

            {/* Success state */}
            {success ? (
              <div className="bg-bg-card rounded-xl border border-border p-6 text-center">
                <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon />
                </div>
                <h2 className="text-sm font-semibold text-text-primary mb-1">
                  Student updated
                </h2>
                <p className="text-xs text-text-secondary mb-5">
                  Changes to <strong>{form.name}</strong> have been saved successfully.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSuccess(false)}
                    className="flex-1 py-2.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-bg-page transition-colors"
                  >
                    Edit again
                  </button>
                  <Link
                    to="/admin/students"
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-teal hover:bg-teal-hover rounded-lg transition-colors text-center"
                  >
                    Back to students
                  </Link>
                </div>
              </div>
            ) : fetching ? (
              <div className="bg-bg-card rounded-xl border border-border p-5 md:p-6 space-y-5 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-bg-page rounded-lg" />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-bg-card rounded-xl border border-border p-5 md:p-6 space-y-5">

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1.5">Full name</label>
                    <input
                      type="text" name="name" placeholder="e.g. Damilare Olaniyi"
                      value={form.name} onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1.5">Email address</label>
                    <input
                      type="email" name="email" placeholder="student@example.com"
                      value={form.email} onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                </div>

                {/* Session + Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1.5">Session</label>
                    <input
                      type="text" name="currentSession" placeholder="e.g. Nov cohort 2025"
                      value={form.currentSession} onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1.5">Payment status</label>
                    <select
                      name="paymentStatus" value={form.paymentStatus} onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary focus:outline-none focus:border-teal transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Role assignment */}
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">
                    Assign role
                  </label>
                  <select
                    name="role" value={form.role} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary focus:outline-none focus:border-teal transition-colors"
                  >
                    <option value="student">Student</option>
                    <option value="hoh">Head of Hostel (HOH)</option>
                    <option value="room_master" disabled className="text-text-muted">Room Master — coming soon</option>
                    <option value="assistant_hoh" disabled className="text-text-muted">Assistant HOH — coming soon</option>
                  </select>
                  {form.role === "hoh" && (
                    <p className="text-xs text-amber mt-1.5">
                      This student will become HOH after they sign out and sign back in.
                    </p>
                  )}
                  {(form.role === "student") && (
                    <p className="text-xs text-text-muted mt-1.5">
                      Standard student access — no elevated permissions.
                    </p>
                  )}
                </div>

                {/* Read-only note */}
                <div className="flex items-start gap-2.5 bg-bg-page border border-border rounded-lg px-4 py-3">
                  <InfoIcon />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Room and bed assignment cannot be changed here. To reassign a student, delete and recreate them with a new bed.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Link
                    to="/admin/students"
                    className="flex-1 py-2.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-bg-page transition-colors text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-teal hover:bg-teal-hover disabled:bg-teal-mid disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <><SpinnerIcon /> Saving...</> : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Icons ─────────────────────────────────────────────────────

function HouseIconSm() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>;
}
function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
}
function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
}
function DoorIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4H3v18h18V9l-8-5z" /><path d="M13 4v5h5" /></svg>;
}
function ReceiptIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>;
}
function ChatIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
}
function TaskIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,11 12,14 22,4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>;
}
function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>;
}
function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}
function ChevronLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6" /></svg>;
}
function ChevronRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6" /></svg>;
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}
function AlertIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
}
function CheckCircleIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>;
}
function InfoIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-text-muted mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
}
function SpinnerIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>;
}
