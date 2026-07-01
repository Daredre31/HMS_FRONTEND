import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createTaskAPI, getAllTasksAPI, getAllStudentsAPI, logout } from "../services/api";

//  Types 

interface StudentData {
  _id: string;
  name: string;
  email: string;
  tokenId: string;
  currentSession: string;
  paymentStatus: "paid" | "pending";
  expiryDate: string;
  bed: {
    bedNumber: string;
    room: { roomNumber: string | number };
  };
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignTo: { name: string } | string;
  dueDate: string;
  createdAt: string;
}

interface AnnouncementForm {
  title: string;
  description: string;
  dueDate: string;
}

//  HOH sidebar nav

const NAV_ITEMS = [
  { label: "Dashboard",     path: "/hoh/dashboard",     icon: <GridIcon /> },
  { label: "My Room",       path: "/student/room",      icon: <DoorIcon /> },
  { label: "Payment",       path: "/student/payment",   icon: <ReceiptIcon /> },
  { label: "Create Task",   path: "/hoh/create-task",   icon: <TaskIcon /> },
  { label: "Announcement",  path: "/hoh/announcement",  icon: <MegaphoneIcon /> },
  { label: "Complaints",    path: "/student/complaints", icon: <ChatIcon /> },
  { label: "Handbook",      path: "/student/handbook",  icon: <BookIcon /> },
];

//  HOH Dashboard 

export default function HOHDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [student, setStudent] = useState<StudentData | null>(null);

  // Create task modal
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignTo: "",
    dueDate: "",
  });
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const [taskError, setTaskError] = useState<string>("");
  const [taskSuccess, setTaskSuccess] = useState<boolean>(false);

  // Announcement modal
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(false);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: "",
    description: "",
    dueDate: "",
  });
  const [announcementLoading, setAnnouncementLoading] = useState<boolean>(false);
  const [announcementError, setAnnouncementError] = useState<string>("");
  const [announcementSuccess, setAnnouncementSuccess] = useState<boolean>(false);

  // Load HOH from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("hms_student");
    if (!stored) { navigate("/student/login"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "hoh") { navigate("/student/dashboard"); return; }
    setStudent(parsed);
  }, [navigate]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Load students for task assignment dropdown
  useEffect(() => {
    getAllStudentsAPI()
      .then((res) => setStudents(res.data.data || []))
      .catch(() => {});
  }, []);

  // Load tasks created by HOH
  useEffect(() => {
    getAllTasksAPI()
      .then((res) => setTasks(res.data.data || []))
      .catch(() => {})
      .finally(() => setTasksLoading(false));
  }, []);

  
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

  // Task form 
  const handleTaskChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTaskForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (taskError) setTaskError("");
  };

  const handleTaskSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.description || !taskForm.assignTo || !taskForm.dueDate) {
      setTaskError("All fields are required.");
      return;
    }
    setTaskLoading(true);
    try {
      const res = await createTaskAPI(taskForm);
      setTasks((p) => [res.data.data, ...p]);
      setTaskSuccess(true);
      setTaskForm({ title: "", description: "", assignTo: "", dueDate: "" });
      setTimeout(() => {
        setTaskSuccess(false);
        setShowTaskModal(false);
      }, 1800);
    } catch (err: any) {
      setTaskError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setTaskLoading(false);
    }
  };

  //  Announcement form 
  const handleAnnouncementChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAnnouncementForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (announcementError) setAnnouncementError("");
  };

  const handleAnnouncementSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.description) {
      setAnnouncementError("Title and message are required.");
      return;
    }
    setAnnouncementLoading(true);
    try {
      // Announcements are broadcast tasks — assigned to "all"
      await createTaskAPI({
        title: announcementForm.title,
        description: announcementForm.description,
        assignTo: "all",
        dueDate: announcementForm.dueDate || new Date().toISOString().split("T")[0],
      });
      setAnnouncementSuccess(true);
      setAnnouncementForm({ title: "", description: "", dueDate: "" });
      setTimeout(() => {
        setAnnouncementSuccess(false);
        setShowAnnouncementModal(false);
      }, 1800);
    } catch (err: any) {
      setAnnouncementError(err.response?.data?.message || "Failed to send announcement.");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const daysUntilExpiry = student
    ? Math.ceil((new Date(student.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

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

        {/* HOH badge + user info */}
        <div className={`p-3 border-t border-white/5 flex-shrink-0 ${collapsed ? "flex flex-col items-center gap-2" : ""}`}>
          {!collapsed && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-xs font-semibold text-teal bg-teal-light px-2 py-0.5 rounded-full">HOH</span>
              <span className="text-xs text-sidebar-muted">Head of Hostel</span>
            </div>
          )}
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
              <span className="text-xs font-bold text-teal">H</span>
              <button onClick={handleLogout} title="Sign out" className="text-sidebar-muted hover:text-red transition-colors">
                <LogoutIcon />
              </button>
            </>
          )}
        </div>
      </aside>

      {/*  Main area  */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-16 bg-bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-text-secondary hover:text-text-primary transition-colors">
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-text-primary tracking-tight">
                {student ? `Welcome, ${student.name.split(" ")[0]}` : "HOH Dashboard"}
              </h1>
              <p className="text-xs text-text-secondary hidden sm:block">
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-xs font-semibold text-teal bg-teal-light px-2.5 py-1 rounded-full">HOH</span>
            <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal text-xs font-bold flex-shrink-0">
              {student?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-5">

            {/* ── HOH action cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Create Task card */}
              <div className="bg-bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-light flex items-center justify-center text-teal flex-shrink-0">
                    <TaskIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Assign task</p>
                    <p className="text-xs text-text-muted">Distribute tasks to students</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  Assign cleaning, maintenance, or any hostel duty to a specific student with a due date.
                </p>
                <button
                  onClick={() => { setShowTaskModal(true); setTaskError(""); setTaskSuccess(false); }}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-teal hover:bg-teal-hover rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <PlusIcon /> Create task
                </button>
              </div>

              {/* Announcement card */}
              <div className="bg-bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-bg flex items-center justify-center text-blue flex-shrink-0">
                    <MegaphoneIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Announcement</p>
                    <p className="text-xs text-text-muted">Broadcast to all students</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  Send a hostel-wide announcement that all students will see on their dashboard.
                </p>
                <button
                  onClick={() => { setShowAnnouncementModal(true); setAnnouncementError(""); setAnnouncementSuccess(false); }}
                  className="w-full py-2.5 text-xs font-semibold text-blue bg-blue-bg hover:opacity-80 border border-blue/20 rounded-lg transition-opacity flex items-center justify-center gap-2"
                >
                  <MegaphoneIcon /> Make announcement
                </button>
              </div>
            </div>

            {/* ── Info cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <p className="text-xs font-semibold text-text-primary">Room {student?.bed?.room?.roomNumber ?? "—"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Bed number</p>
                    <p className="text-xs font-semibold text-text-primary">{student?.bed?.bedNumber ?? "—"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${student?.paymentStatus === "paid" ? "bg-green-bg text-green" : "bg-amber-bg text-amber"}`}>
                    <ReceiptIcon />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">Payment</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Status</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${student?.paymentStatus === "paid" ? "bg-green-bg text-green border-green-border" : "bg-amber-bg text-amber border-amber-border"}`}>
                      {student?.paymentStatus ?? "pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Session</p>
                    <p className="text-xs font-semibold text-text-primary">{student?.currentSession ?? "—"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-bg flex items-center justify-center text-blue flex-shrink-0">
                    <CalendarIcon />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">Session</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Expiry</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {student ? new Date(student.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Days left</p>
                    <p className={`text-xs font-semibold ${daysUntilExpiry <= 30 ? "text-amber" : "text-green"}`}>
                      {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : "Expired"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/*  Recent tasks  */}
            <div>
              <h2 className="text-sm font-semibold text-text-primary mb-3">Recent tasks</h2>
              <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
                {tasksLoading ? (
                  <div className="animate-pulse p-5 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-bg-page rounded-lg" />)}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-10 h-10 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-2">
                      <TaskIcon />
                    </div>
                    <p className="text-xs font-medium text-text-primary mb-1">No tasks yet</p>
                    <p className="text-xs text-text-muted">Create your first task to get started</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-page transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-text-primary truncate">{task.title}</p>
                          <p className="text-xs text-text-muted truncate">
                            {typeof task.assignTo === "object" ? task.assignTo.name : task.assignTo === "all" ? "All students" : task.assignTo}
                          </p>
                        </div>
                        <div className="text-xs text-text-muted flex-shrink-0 ml-4">
                          Due {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Create Task Modal ── */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-bg-card rounded-2xl border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Assign task</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <CloseIcon />
              </button>
            </div>

            {taskSuccess ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircleIcon />
                </div>
                <p className="text-sm font-semibold text-text-primary">Task created!</p>
                <p className="text-xs text-text-muted mt-1">The student will see it on their dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handleTaskSubmit} className="p-5 space-y-4">
                {taskError && (
                  <div className="flex items-center gap-2 bg-red-bg border border-red-border text-red rounded-lg px-3 py-2.5 text-xs">
                    <AlertIcon /> {taskError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Task title</label>
                  <input type="text" name="title" value={taskForm.title} onChange={handleTaskChange}
                    placeholder="e.g. Clean common bathroom"
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Description</label>
                  <textarea name="description" value={taskForm.description} onChange={handleTaskChange}
                    placeholder="Describe what needs to be done..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Assign to</label>
                  <select name="assignTo" value={taskForm.assignTo} onChange={handleTaskChange}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary focus:outline-none focus:border-teal transition-colors">
                    <option value="">Select student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Due date</label>
                  <input type="date" name="dueDate" value={taskForm.dueDate} onChange={handleTaskChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary focus:outline-none focus:border-teal transition-colors" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowTaskModal(false)}
                    className="flex-1 py-2.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-bg-page transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={taskLoading}
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-teal hover:bg-teal-hover disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2">
                    {taskLoading ? <><SpinnerIcon /> Assigning...</> : "Assign task"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Announcement Modal ── */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-bg-card rounded-2xl border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Make announcement</h2>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <CloseIcon />
              </button>
            </div>

            {announcementSuccess ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-bg rounded-full flex items-center justify-center mx-auto mb-3">
                  <MegaphoneIcon />
                </div>
                <p className="text-sm font-semibold text-text-primary">Announcement sent!</p>
                <p className="text-xs text-text-muted mt-1">All students will see this on their dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handleAnnouncementSubmit} className="p-5 space-y-4">
                {announcementError && (
                  <div className="flex items-center gap-2 bg-red-bg border border-red-border text-red rounded-lg px-3 py-2.5 text-xs">
                    <AlertIcon /> {announcementError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Title</label>
                  <input type="text" name="title" value={announcementForm.title} onChange={handleAnnouncementChange}
                    placeholder="e.g. Water outage notice"
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Message</label>
                  <textarea name="description" value={announcementForm.description} onChange={handleAnnouncementChange}
                    placeholder="Write your announcement here..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors resize-none" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowAnnouncementModal(false)}
                    className="flex-1 py-2.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-bg-page transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={announcementLoading}
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-teal hover:bg-teal-hover disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2">
                    {announcementLoading ? <><SpinnerIcon /> Sending...</> : "Send to all"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
function MegaphoneIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>; }
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>; }
function ChevronLeftIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6" /></svg>; }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6" /></svg>; }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function AlertIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function CheckCircleIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>; }
function CloseIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function SpinnerIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>; }
function CalendarIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>; }
