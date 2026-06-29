import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getComplaintsAPI, respondToComplaintAPI } from "../services/api";

interface Complaint {
  _id: string;
  title: string;
  category: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "resolved" | "rejected";
  adminResponse: string | null;
  createdAt: string;
  student: { name: string; email: string; bed: { bedNumber: string; room: { roomNumber: string } } };
}

interface AdminUser { name: string; email: string; role: string; }

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <GridIcon /> },
  { label: "Students", path: "/admin/students", icon: <UsersIcon /> },
  { label: "Rooms", path: "/admin/rooms", icon: <DoorIcon /> },
  { label: "Payments", path: "/admin/payments", icon: <ReceiptIcon /> },
  { label: "Complaints", path: "/admin/complaints", icon: <ChatIcon /> },
  { label: "Tasks", path: "/admin/tasks", icon: <TaskIcon /> },
  { label: "Notifications", path: "/admin/notifications", icon: <BellIcon /> },
];

export default function AdminComplaints() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [response, setResponse] = useState<string>("");
  const [status, setStatus] = useState<string>("in_progress");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("hms_user");
    if (!stored) { navigate("/login"); return; }
    setAdmin(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getComplaintsAPI();
        setComplaints(res.data.data || []);
      } catch { setError("Could not load complaints."); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = complaints.filter((c) => filter === "all" || c.status === filter);

  const handleRespond = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!response.trim()) { setFormError("Response is required."); return; }
    setSubmitting(true);
    try {
      const res = await respondToComplaintAPI(selected!._id, { response, status });

      console.log(res.data)
      setComplaints((prev) => prev.map((c) => c._id === selected!._id ? res.data.data : c));
      setSelected(null);
      setResponse("");
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Could not submit response.");
    } finally { setSubmitting(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-bg-page font-sans overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed md:relative z-30 flex flex-col bg-dark min-h-screen transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? "w-16" : "w-56"} ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className={`flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (<div className="flex items-center gap-2.5"><div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center"><HouseIconSm /></div><span className="text-teal-light text-sm font-semibold tracking-tight">HostelOS</span></div>)}
          <button onClick={() => setCollapsed((p) => !p)} className="hidden md:flex text-sidebar-muted hover:text-teal transition-colors p-1 rounded">{collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}</button>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ label, path, icon }) => (
            <Link key={path} to={path} title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${location.pathname === path ? "bg-teal text-white" : "text-sidebar-text hover:bg-white/5 hover:text-white"} ${collapsed ? "justify-center" : ""}`}>
              <span className="flex-shrink-0">{icon}</span>
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          ))}
        </nav>
        <div className={`p-3 border-t border-white/5 flex-shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          {!collapsed ? (<div><p className="text-xs text-white font-medium truncate">{admin?.name}</p><p className="text-xs text-sidebar-muted truncate mb-2.5">{admin?.email}</p><button onClick={handleLogout} className="flex items-center gap-2 text-xs text-sidebar-muted hover:text-red transition-colors"><LogoutIcon />Sign out</button></div>)
            : <button onClick={handleLogout} title="Sign out" className="text-sidebar-muted hover:text-red transition-colors"><LogoutIcon /></button>}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-text-secondary hover:text-text-primary transition-colors"><MenuIcon /></button>
            <div><h1 className="text-sm font-semibold text-text-primary">Complaints</h1><p className="text-xs text-text-secondary hidden sm:block">{filtered.length} showing</p></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal text-xs font-bold">{admin?.name?.charAt(0).toUpperCase()}</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {error && <div className="flex items-center gap-2.5 bg-red-bg border border-red-border text-red rounded-lg px-4 py-3 text-sm mb-5"><AlertIcon />{error}</div>}

          <div className="flex items-center bg-bg-card border border-border rounded-lg p-1 gap-1 mb-5 w-fit">
            {["all", "pending", "in_progress", "resolved"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${filter === f ? "bg-teal text-white" : "text-text-secondary hover:text-text-primary"}`}>
                {f === "in_progress" ? "In progress" : f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-bg-card rounded-xl border border-border h-24" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="bg-bg-card rounded-xl border border-border py-16 text-center">
              <p className="text-sm font-medium text-text-primary mb-1">No complaints</p>
              <p className="text-xs text-text-muted">Nothing in this category right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c) => (
                <div key={c._id} onClick={() => { setSelected(c); setResponse(c.adminResponse || ""); setStatus(c.status); }}
                  className="bg-bg-card rounded-xl border border-border p-4 hover:border-teal transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate group-hover:text-teal transition-colors">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-4 h-4 rounded-full bg-teal-light flex items-center justify-center text-teal text-xs font-bold flex-shrink-0">{c.student?.name?.charAt(0).toUpperCase()}</div>
                        <p className="text-xs text-text-muted">{c.student?.name} · {c.category} · {new Date(c.createdAt).toLocaleDateString("en-GB")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{c.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Response modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <div className="bg-bg-card rounded-t-2xl sm:rounded-2xl border border-border w-full sm:max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary truncate pr-4">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"><CloseIcon /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Student info */}
              <div className="flex items-center gap-3 bg-bg-page rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal text-sm font-bold flex-shrink-0">{selected.student?.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-xs font-medium text-text-primary">{selected.student?.name}</p>
                  <p className="text-xs text-text-muted">Room {selected.student?.bed?.room?.roomNumber} · {selected.student?.bed?.bedNumber}</p>
                </div>
                <div className="ml-auto flex gap-2"><PriorityBadge priority={selected.priority} /><StatusBadge status={selected.status} /></div>
              </div>
              {/* Description */}
              <div>
                <p className="text-xs font-medium text-text-muted mb-1.5">Complaint</p>
                <p className="text-sm text-text-primary leading-relaxed bg-bg-page rounded-lg p-3">{selected.description}</p>
              </div>
              {/* Response form */}
              <form onSubmit={handleRespond} className="space-y-3">
                <p className="text-xs font-medium text-text-primary">Your response</p>
                {formError && <div className="flex items-center gap-2 bg-red-bg border border-red-border text-red rounded-lg px-3 py-2 text-xs"><AlertIcon />{formError}</div>}
                <textarea value={response} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => { setResponse(e.target.value); if (formError) setFormError(""); }}
                  placeholder="Write your response..." rows={4}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors resize-none" />
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Update status</label>
                  <select value={status} onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary focus:outline-none focus:border-teal transition-colors">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setSelected(null)} className="flex-1 py-2.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-bg-page transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-xs font-semibold text-white bg-teal hover:bg-teal-hover disabled:bg-teal-mid rounded-lg transition-colors flex items-center justify-center gap-2">
                    {submitting ? <><SpinnerIcon />Sending...</> : "Send response"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { pending: "bg-amber-bg text-amber border border-amber-border", in_progress: "bg-blue-bg text-blue border border-blue-border", resolved: "bg-green-bg text-green border border-green-border", rejected: "bg-red-bg text-red border border-red-border" };
  const labels: Record<string, string> = { pending: "Pending", in_progress: "In progress", resolved: "Resolved", rejected: "Rejected" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${map[status] ?? map.pending}`}>{labels[status] ?? status}</span>;
}
function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = { low: "bg-bg-page text-text-secondary border border-border", medium: "bg-amber-bg text-amber border border-amber-border", high: "bg-red-bg text-red border border-red-border" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${map[priority] ?? map.low}`}>{priority}</span>;
}
function HouseIconSm() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>; }
function GridIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>; }
function UsersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>; }
function DoorIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4H3v18h18V9l-8-5z" /><path d="M13 4v5h5" /></svg>; }
function ReceiptIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>; }
function ChatIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>; }
function TaskIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,11 12,14 22,4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>; }
function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>; }
function ChevronLeftIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6" /></svg>; }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6" /></svg>; }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function AlertIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function CloseIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function SpinnerIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>; }
