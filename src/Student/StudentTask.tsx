import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getMyTasksAPI, completeTaskAPI, logout } from "../services/api";
//  Types 

interface StudentData {
  _id: string;
  name: string;
  email: string;
  bed: {
    bedNumber: string;
    room: { roomNumber: string | number };
  };
}

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  isComplete: boolean;
  createdAt: string;
}

type FilterTab = "pending" | "completed";

//  Student sidebar nav 

const NAV_ITEMS = [
  { label: "Dashboard",    path: "/student/dashboard",  icon: <GridIcon /> },
  { label: "My Room",      path: "/student/room",       icon: <DoorIcon /> },
  { label: "Payment",      path: "/student/payment",    icon: <ReceiptIcon /> },
  { label: "Tasks",        path: "/student/tasks",      icon: <TaskIcon /> },
  { label: "Complaints",   path: "/student/complaints", icon: <ChatIcon /> },
  { label: "Handbook",     path: "/student/handbook",   icon: <BookIcon /> },
];

//  Student Tasks Page 

export default function StudentTasks() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [student, setStudent] = useState<StudentData | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tab, setTab] = useState<FilterTab>("pending");
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Load student from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("hms_student");
    if (!stored) { navigate("/student/login"); return; }
    setStudent(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Load tasks
  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyTasksAPI();
      setTasks(res.data.data || []);
    } catch (err: any) {
      // Backend returns 400 when there are no tasks — treat as empty, not an error
      if (err.response?.status === 400) {
        setTasks([]);
      } else {
        setError(err.response?.data?.message || "Failed to load tasks.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      localStorage.removeItem("hms_token");
      localStorage.removeItem("hms_student_token");
      localStorage.removeItem("hms_user");
      localStorage.removeItem("hms_student");
      navigate("/student/login");
    }
  };

  const handleComplete = async (id: string) => {
    setCompletingId(id);
    try {
      const res = await completeTaskAPI(id);
      const updated = res.data.data;
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to mark task complete.");
    } finally {
      setCompletingId(null);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.isComplete);
  const completedTasks = tasks.filter((t) => t.isComplete);
  const visibleTasks = tab === "pending" ? pendingTasks : completedTasks;

  const isOverdue = (dueDate: string) => new Date(dueDate).getTime() < Date.now();

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

        <div className={`p-3 border-t border-white/5 flex-shrink-0 ${collapsed ? "flex flex-col items-center gap-2" : ""}`}>
          {!collapsed ? (
            <div>
              <p className="text-xs text-white font-medium truncate">{student?.name}</p>
              <p className="text-xs text-sidebar-muted truncate mb-2.5">{student?.email}</p>
              <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-sidebar-muted hover:text-red transition-colors">
                <LogoutIcon /> Sign out
              </button>
            </div>
          ) : (
            <>
              <span className="text-xs font-bold text-teal">{student?.name?.charAt(0)}</span>
              <button onClick={handleLogout} title="Sign out" className="text-sidebar-muted hover:text-red transition-colors">
                <LogoutIcon />
              </button>
            </>
          )}
        </div>
      </aside>

      {/*  Main area  */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="h-16 bg-bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-text-secondary hover:text-text-primary transition-colors">
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-text-primary tracking-tight">My tasks</h1>
              <p className="text-xs text-text-secondary hidden sm:block">
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal text-xs font-bold flex-shrink-0">
            {student?.name?.charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-5">

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="bg-bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-amber-bg flex items-center justify-center text-amber flex-shrink-0">
                    <TaskIcon />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">Pending</p>
                </div>
                <p className="text-2xl font-bold text-text-primary pl-0.5">{pendingTasks.length}</p>
              </div>
              <div className="bg-bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-green-bg flex items-center justify-center text-green flex-shrink-0">
                    <CheckCircleIcon />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">Completed</p>
                </div>
                <p className="text-2xl font-bold text-text-primary pl-0.5">{completedTasks.length}</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-bg border border-red-border text-red rounded-lg px-3 py-2.5 text-xs">
                <AlertIcon /> {error}
              </div>
            )}

            {/* ── Tabs ── */}
            <div className="flex gap-2 border-b border-border">
              {(["pending", "completed"] as FilterTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                    tab === t
                      ? "border-teal text-teal"
                      : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {t === "pending" ? `Pending (${pendingTasks.length})` : `Completed (${completedTasks.length})`}
                </button>
              ))}
            </div>

            {/* ── Task list ── */}
            <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
              {loading ? (
                <div className="animate-pulse p-5 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-bg-page rounded-lg" />)}
                </div>
              ) : visibleTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-2">
                    <TaskIcon />
                  </div>
                  <p className="text-xs font-medium text-text-primary mb-1">
                    {tab === "pending" ? "No pending tasks" : "No completed tasks yet"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {tab === "pending" ? "You're all caught up." : "Finish a task to see it here."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {visibleTasks.map((task) => {
                    const overdue = !task.isComplete && isOverdue(task.dueDate);
                    return (
                      <div key={task._id} className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-bg-page transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-medium text-text-primary ${task.isComplete ? "line-through text-text-muted" : ""}`}>
                              {task.title}
                            </p>
                            {overdue && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-bg text-red border border-red-border flex-shrink-0">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed mb-1.5">{task.description}</p>
                          <p className="text-xs text-text-muted">
                            Due {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>

                        <div className="flex-shrink-0">
                          {task.isComplete ? (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-green">
                              <CheckCircleIcon /> Done
                            </span>
                          ) : (
                            <button
                              onClick={() => handleComplete(task._id)}
                              disabled={completingId === task._id}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-teal hover:bg-teal-hover disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              {completingId === task._id ? <><SpinnerIcon /> Saving...</> : "Mark done"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
function AlertIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function CheckCircleIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>; }
function SpinnerIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>; }
