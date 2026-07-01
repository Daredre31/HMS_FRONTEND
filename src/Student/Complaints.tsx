import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getMyComplaintsAPI, createComplaintAPI, logout } from "../services/api";

// ── Types

interface Complaint {
  _id: string;
  title: string;
  category: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "resolved" | "rejected";
  adminResponse: string | null;
  createdAt: string;
}

interface StudentData {
  name: string;
  email: string;
}

// ── Sidebar nav

const NAV_ITEMS = [
  { label: "Dashboard", path: "/student/dashboard", icon: <GridIcon /> },
  { label: "My Room", path: "/student/room", icon: <DoorIcon /> },
  { label: "Payment", path: "/student/payment", icon: <ReceiptIcon /> },
  { label: "Tasks", path: "/student/tasks", icon: <TaskIcon /> },
  { label: "Complaints", path: "/student/complaints", icon: <ChatIcon /> },
  { label: "Handbook", path: "/student/handbook", icon: <BookIcon /> },
];

// ── Student Complaints page 

export default function StudentComplaints() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Controls whether the form is visible or the list
  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Selected complaint for detail view
  const [selected, setSelected] = useState<Complaint | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    priority: "low",
  });

  useEffect(() => {
    const stored = localStorage.getItem("hms_student");
    if (!stored) { navigate("/student/login"); return; }
    setStudent(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyComplaintsAPI();
        setComplaints(res.data.data || []);
      } catch {
        setError("Could not load your complaints.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.description) {
      setFormError("Title, category and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createComplaintAPI(form);
      // add new complaint to the top of the list without refetching
      setComplaints((prev) => [res.data.data, ...prev]);
      setShowForm(false);
      setForm({ title: "", category: "", description: "", priority: "low" });
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Could not submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  

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
              <span className="text-teal-light text-sm font-semibold tracking-tight">APPCLICk_HostelOS</span>
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
              <p className="text-xs text-white font-medium truncate">{student?.name}</p>
              <p className="text-xs text-sidebar-muted truncate mb-2.5">{student?.email}</p>
              <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-sidebar-muted hover:text-red transition-colors">
                <LogoutIcon /> Sign out
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} title="Sign out" className="text-sidebar-muted hover:text-red transition-colors"><LogoutIcon /></button>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="h-16 bg-bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-text-secondary hover:text-text-primary transition-colors">
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-text-primary tracking-tight">Complaints</h1>
              <p className="text-xs text-text-secondary hidden sm:block">{complaints.length} submitted</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-teal hover:bg-teal-hover text-white text-xs font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors"
          >
            <PlusIcon />
            <span className="hidden sm:inline">New complaint</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {error && (
            <div className="flex items-center gap-2.5 bg-red-bg border border-red-border text-red rounded-lg px-4 py-3 text-sm mb-5">
              <AlertIcon />{error}
            </div>
          )}

          {/* Empty state */}
          {!loading && complaints.length === 0 && (
            <div className="bg-bg-card rounded-xl border border-border py-16 text-center">
              <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-3">
                <ChatIcon />
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">No complaints yet</p>
              <p className="text-xs text-text-muted mb-4">Submit a complaint if you have an issue that needs attention.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 bg-teal hover:bg-teal-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <PlusIcon /> Submit complaint
              </button>
            </div>
          )}

          {/* Complaints list */}
          {!loading && complaints.length > 0 && (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className="bg-bg-card rounded-xl border border-border p-4 hover:border-teal transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate group-hover:text-teal transition-colors">
                        {c.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{c.category} · {new Date(c.createdAt).toLocaleDateString("en-GB")}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{c.description}</p>
                  {/* Show a hint when admin has responded */}
                  {c.adminResponse && (
                    <div className="mt-3 pt-3 border-t border-border-soft flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                      <p className="text-xs text-teal font-medium">Admin responded — tap to read</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skeleton loader */}
          {loading && (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-bg-card rounded-xl border border-border h-24" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Submit complaint form modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <div className="bg-bg-card rounded-t-2xl sm:rounded-2xl border border-border w-full sm:max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Submit a complaint</h2>
              <button onClick={() => { setShowForm(false); setFormError(""); }} className="text-text-muted hover:text-text-primary transition-colors">
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="flex items-center gap-2 bg-red-bg border border-red-border text-red rounded-lg px-3 py-2.5 text-xs">
                  <AlertIcon />{formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">Title</label>
                <input
                  type="text" name="title" placeholder="Brief summary of the issue"
                  value={form.title} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Category</label>
                  <select
                    name="category" value={form.category} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary focus:outline-none focus:border-teal transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="noise">Noise</option>
                    <option value="cleanliness">Cleanliness</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Priority</label>
                  <select
                    name="priority" value={form.priority} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary focus:outline-none focus:border-teal transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(""); }}
                  className="flex-1 py-2.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-bg-page transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-teal hover:bg-teal-hover disabled:bg-teal-mid rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <><SpinnerIcon />Submitting...</> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Complaint detail modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <div className="bg-bg-card rounded-t-2xl sm:rounded-2xl border border-border w-full sm:max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary truncate pr-4">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0">
                <CloseIcon />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Meta */}
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={selected.priority} />
                <StatusBadge status={selected.status} />
                <span className="text-xs text-text-muted">{selected.category}</span>
                <span className="text-xs text-text-muted">·</span>
                <span className="text-xs text-text-muted">{new Date(selected.createdAt).toLocaleDateString("en-GB")}</span>
              </div>

              {/* Description */}
              <div className="bg-bg-page rounded-lg p-4">
                <p className="text-xs text-text-muted mb-1.5 font-medium">Your complaint</p>
                <p className="text-sm text-text-primary leading-relaxed">{selected.description}</p>
              </div>

              {/* Admin response — only shows when admin has replied */}
              {selected.adminResponse ? (
                <div className="bg-teal-light rounded-lg p-4 border border-teal-border">
                  <p className="text-xs text-teal font-medium mb-1.5">Admin response</p>
                  <p className="text-sm text-text-primary leading-relaxed">{selected.adminResponse}</p>
                </div>
              ) : (
                <div className="bg-bg-page rounded-lg p-4 text-center">
                  <p className="text-xs text-text-muted">No response yet. Admin will reply soon.</p>
                </div>
              )}
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setSelected(null)}
                className="w-full py-2.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-bg-page transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Badge
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-bg text-amber border border-amber-border",
    in_progress: "bg-blue-bg text-blue border border-blue-border",
    resolved: "bg-green-bg text-green border border-green-border",
    rejected: "bg-red-bg text-red border border-red-border",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${map[status] ?? map.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    low: "bg-bg-page text-text-secondary border border-border",
    medium: "bg-amber-bg text-amber border border-amber-border",
    high: "bg-red-bg text-red border border-red-border",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${map[priority] ?? map.low}`}>
      {priority}
    </span>
  );
}


// ── Icons

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
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function AlertIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function CloseIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function SpinnerIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>; }
