import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAllStudentsAPI, deleteStudentAPI } from "../services/api";

// ── Types ─────────────────────────────────────────────────────

interface Student {
  _id: string;
  name: string;
  email: string;
  tokenId: string;
  currentSession: string;
  paymentStatus: "paid" | "pending";
  expiryDate: string;
  isTaken: boolean;
  bed: {
    bedNumber: string;
    room: { roomNumber: string | number };
  };
}

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

// ── Sidebar nav — same across all admin pages ─────────────────

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <GridIcon /> },
  { label: "Students", path: "/admin/students", icon: <UsersIcon /> },
  { label: "Rooms", path: "/admin/rooms", icon: <DoorIcon /> },
  { label: "Payments", path: "/admin/payments", icon: <ReceiptIcon /> },
  { label: "Complaints", path: "/admin/complaints", icon: <ChatIcon /> },
  { label: "Tasks", path: "/admin/tasks", icon: <TaskIcon /> },
  { label: "Notifications", path: "/admin/notifications", icon: <BellIcon /> },
];

// ── Students page ─────────────────────────────────────────────

export default function Students() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [copiedId, setCopiedId] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Guard route — no session means back to login
  useEffect(() => {
    const stored = localStorage.getItem("hms_user");
    if (!stored) { navigate("/login"); return; }
    setAdmin(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Load all students on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllStudentsAPI();
        setStudents(res.data.data || []);
      } catch {
        setError("Could not load students. Try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter and search runs entirely in memory — no extra API calls
  const filtered = useMemo(() => {
    return students
      .filter((s) => filter === "all" || s.paymentStatus === filter)
      .filter((s) =>
        search.trim() === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.tokenId.toLowerCase().includes(search.toLowerCase())
      );
  }, [students, search, filter]);

  // Copy token to clipboard and show brief confirmation
  const handleCopy = (tokenId: string, id: string) => {
    navigator.clipboard.writeText(tokenId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStudentAPI(deleteTarget._id);
      setStudents((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      setError("Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    navigate("/login");
  };

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
        <div className={`flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center flex-shrink-0">
                <HouseIconSm />
              </div>
              <span className="text-teal-light text-sm font-semibold tracking-tight">HostelOS</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="hidden md:flex text-sidebar-muted hover:text-teal transition-colors p-1 rounded"
          >
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
                <LogoutIcon />Sign out
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
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-text-secondary hover:text-text-primary transition-colors">
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-text-primary tracking-tight">Students</h1>
              <p className="text-xs text-text-secondary hidden sm:block">
                {filtered.length} of {students.length} students
              </p>
            </div>
          </div>
          <Link
            to="/admin/students/new"
            className="flex items-center gap-1.5 bg-teal hover:bg-teal-hover text-white text-xs font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Add student</span>
          </Link>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {error && (
            <div className="flex items-center gap-2.5 bg-red-bg border border-red-border text-red rounded-lg px-4 py-3 text-sm mb-5">
              <AlertIcon />
              {error}
            </div>
          )}

          {/* Search and filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by name, email or token ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full pl-9 pr-4 py-2.5 rounded-lg text-sm
                  bg-bg-card border border-border text-text-primary
                  placeholder:text-text-muted
                  focus:outline-none focus:border-teal
                  transition-colors duration-150
                "
              />
            </div>

            {/* Payment status filter tabs */}
            <div className="flex items-center bg-bg-card border border-border rounded-lg p-1 gap-1 flex-shrink-0">
              {(["all", "paid", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors
                    ${filter === f ? "bg-teal text-white" : "text-text-secondary hover:text-text-primary"}
                  `}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Students table */}
          <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
            {loading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-3">
                  <UsersIcon />
                </div>
                <p className="text-sm font-medium text-text-primary mb-1">
                  {search || filter !== "all" ? "No students match your search" : "No students yet"}
                </p>
                <p className="text-xs text-text-muted mb-4">
                  {search || filter !== "all" ? "Try adjusting your filters" : "Add your first student to get started"}
                </p>
                {!search && filter === "all" && (
                  <Link
                    to="/admin/students/new"
                    className="inline-flex items-center gap-1.5 bg-teal hover:bg-teal-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <PlusIcon /> Add student
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border bg-bg-page">
                      <th className="text-left text-xs text-text-muted font-medium px-4 md:px-5 py-3">Student</th>
                      <th className="text-left text-xs text-text-muted font-medium px-4 md:px-5 py-3">Room / Bed</th>
                      <th className="text-left text-xs text-text-muted font-medium px-4 md:px-5 py-3">Session</th>
                      <th className="text-left text-xs text-text-muted font-medium px-4 md:px-5 py-3">Payment</th>
                      <th className="text-left text-xs text-text-muted font-medium px-4 md:px-5 py-3">Token</th>
                      <th className="text-left text-xs text-text-muted font-medium px-4 md:px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s._id} className="border-b border-border-soft last:border-0 hover:bg-bg-page transition-colors">

                        {/* Name + email */}
                        <td className="px-4 md:px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal text-xs font-semibold flex-shrink-0">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-text-primary truncate">{s.name}</p>
                              <p className="text-xs text-text-muted truncate">{s.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Room and bed */}
                        <td className="px-4 md:px-5 py-3.5">
                          <p className="text-xs text-text-primary">Room {s.bed?.room?.roomNumber}</p>
                          <p className="text-xs text-text-muted">{s.bed?.bedNumber}</p>
                        </td>

                        {/* Session */}
                        <td className="px-4 md:px-5 py-3.5 text-xs text-text-secondary whitespace-nowrap">
                          {s.currentSession}
                        </td>

                        {/* Payment badge */}
                        <td className="px-4 md:px-5 py-3.5">
                          <PaymentBadge status={s.paymentStatus} />
                        </td>

                        {/* Token + copy button */}
                        <td className="px-4 md:px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-text-secondary truncate max-w-[100px]">
                              {s.tokenId}
                            </span>
                            <button
                              onClick={() => handleCopy(s.tokenId, s._id)}
                              title="Copy token"
                              className="text-text-muted hover:text-teal transition-colors flex-shrink-0"
                            >
                              {copiedId === s._id ? <CheckIcon /> : <CopyIcon />}
                            </button>
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 md:px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {/* View details */}
                            <button
                              onClick={() => setSelectedStudent(s)}
                              title="View details"
                              className="p-1.5 rounded-lg text-text-muted hover:text-blue hover:bg-blue-bg transition-colors"
                            >
                              <EyeIcon />
                            </button>
                            {/* Edit */}
                            <Link
                              to={`/admin/students/edit/${s._id}`}
                              title="Edit student"
                              className="p-1.5 rounded-lg text-text-muted hover:text-amber hover:bg-amber-bg transition-colors"
                            >
                              <EditIcon />
                            </Link>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget(s)}
                              title="Delete student"
                              className="p-1.5 rounded-lg text-text-muted hover:text-red hover:bg-red-bg transition-colors"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Student detail modal ── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-bg-card rounded-2xl border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Student details</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-light flex items-center justify-center text-teal text-lg font-bold flex-shrink-0">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{selectedStudent.name}</p>
                  <p className="text-xs text-text-muted">{selectedStudent.email}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Room", value: `Room ${selectedStudent.bed?.room?.roomNumber}` },
                  { label: "Bed", value: selectedStudent.bed?.bedNumber },
                  { label: "Session", value: selectedStudent.currentSession },
                  { label: "Expiry", value: new Date(selectedStudent.expiryDate).toLocaleDateString("en-GB") },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-bg-page rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-0.5">{label}</p>
                    <p className="text-xs font-medium text-text-primary">{value}</p>
                  </div>
                ))}
              </div>

              {/* Payment status */}
              <div className="flex items-center justify-between bg-bg-page rounded-lg p-3">
                <p className="text-xs text-text-muted">Payment status</p>
                <PaymentBadge status={selectedStudent.paymentStatus} />
              </div>

              {/* Token with copy */}
              <div className="bg-bg-page rounded-lg p-3">
                <p className="text-xs text-text-muted mb-1.5">Login token</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-text-primary tracking-wider">
                    {selectedStudent.tokenId}
                  </span>
                  <button
                    onClick={() => handleCopy(selectedStudent.tokenId, selectedStudent._id + "-modal")}
                    className="flex items-center gap-1.5 text-xs text-teal hover:text-teal-hover font-medium transition-colors flex-shrink-0"
                  >
                    {copiedId === selectedStudent._id + "-modal" ? (
                      <><CheckIcon /> Copied</>
                    ) : (
                      <><CopyIcon /> Copy</>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2 justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary border border-border rounded-lg transition-colors"
              >
                Close
              </button>
              <Link
                to={`/admin/students/edit/${selectedStudent._id}`}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal hover:bg-teal-hover rounded-lg transition-colors"
              >
                Edit student
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-bg-card rounded-2xl border border-border w-full max-w-sm shadow-xl p-6">
            <div className="w-10 h-10 bg-red-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon color="var(--color-red)" />
            </div>
            <h2 className="text-sm font-semibold text-text-primary text-center mb-1">
              Remove student?
            </h2>
            <p className="text-xs text-text-secondary text-center mb-6">
              This will permanently remove <strong>{deleteTarget.name}</strong> and free up their bed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-page transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-red hover:opacity-90 rounded-lg transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? <><SpinnerIcon /> Removing...</> : "Yes, remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Sub-components ────────────────────────────────────────────

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-green-bg text-green border border-green-border",
    pending: "bg-amber-bg text-amber border border-amber-border",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse p-5 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-bg-page rounded-lg" />
      ))}
    </div>
  );
}


// ── Icons ─────────────────────────────────────────────────────

function HouseIconSm() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
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
function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
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
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}
function EyeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function TrashIcon({ color = "currentColor" }: { color?: string }) {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>;
}
function CopyIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
}
function CheckIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>;
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
function SpinnerIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>;
}
