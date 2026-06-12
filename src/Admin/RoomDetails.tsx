import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { getAllBedsAPI, createBedAPI } from "../services/api";
import api from "../services/api";

// ── Types ─────────────────────────────────────────────────────

interface Room {
  _id: string;
  roomNumber: string | number;
  roomCapacity: number;
  roomStatus: "available" | "fullyOccupied" | "under_Maintenance";
}

interface Bed {
  _id: string;
  bedNumber: string;
  isOccupied: boolean;
  room: { _id: string; roomNumber: string | number };
}

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

// ── Sidebar nav ───────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <GridIcon /> },
  { label: "Students", path: "/admin/students", icon: <UsersIcon /> },
  { label: "Rooms", path: "/admin/rooms", icon: <DoorIcon /> },
  { label: "Payments", path: "/admin/payments", icon: <ReceiptIcon /> },
  { label: "Complaints", path: "/admin/complaints", icon: <ChatIcon /> },
  { label: "Tasks", path: "/admin/tasks", icon: <TaskIcon /> },
  { label: "Notifications", path: "/admin/notifications", icon: <BellIcon /> },
];

// ── Room detail page ──────────────────────────────────────────

export default function RoomDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams<{ roomId: string }>();

  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Modal for adding a bed
  const [showModal, setShowModal] = useState<boolean>(false);
  const [bedNumber, setBedNumber] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Bed | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("hms_user");
    if (!stored) { navigate("/login"); return; }
    setAdmin(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch the room details and all beds, then filter beds for this room
        const [roomRes, bedsRes] = await Promise.all([
          api.get(`/room/${roomId}`),
          getAllBedsAPI(),
        ]);
        console.table(roomRes)
        console.table(bedsRes)
        setRoom(roomRes.data.data.room);
        const allBeds: Bed[] = bedsRes.data.data.bed || [];
        // Only show beds that belong to this room
        setBeds(allBeds.filter((b) => b.room?._id === roomId));
      } catch {
        setError("Could not load room details.");
      } finally {
        setLoading(false);
      }
    };
    if (roomId) load();
  }, [roomId]);

  const handleAddBed = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bedNumber.trim()) {
      setFormError("Bed number is required.");
      return;
    }
    setCreating(true);
    try {
      const res = await createBedAPI({ bedNumber, room: roomId! });
      // Append the new bed directly — no need to refetch
      setBeds((prev) => [...prev, res.data.bed]);
      setShowModal(false);
      setBedNumber("");
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Could not add bed.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBed = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/bed/${deleteTarget._id}`);
      setBeds((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      setError("Could not delete bed. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    navigate("/login");
  };

  const occupiedCount = beds.filter((b) => b.isOccupied).length;
  const availableCount = beds.filter((b) => !b.isOccupied).length;

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
            const active = location.pathname.startsWith("/admin/rooms");
            const isRooms = path === "/admin/rooms";
            return (
              <Link key={path} to={path} title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                  ${(isRooms && active) ? "bg-teal text-white" : "text-sidebar-text hover:bg-white/5 hover:text-white"}
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
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-text-secondary">
              <Link to="/admin/rooms" className="text-xs hover:text-text-primary transition-colors">Rooms</Link>
              <span className="text-xs">/</span>
              <span className="text-xs text-text-primary font-medium">
                {room ? `Room ${room.roomNumber}` : "Loading..."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-teal hover:bg-teal-hover text-white text-xs font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Add bed</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal text-xs font-bold">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {error && (
            <div className="flex items-center gap-2.5 bg-red-bg border border-red-border text-red rounded-lg px-4 py-3 text-sm mb-5">
              <AlertIcon />{error}
            </div>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="bg-bg-card rounded-xl border border-border h-28" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-bg-card rounded-xl border border-border h-20" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Room info card */}
              {room && (
                <div className="bg-bg-card rounded-xl border border-border p-5 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-lg font-bold text-text-primary tracking-tight">
                          Room {room.roomNumber}
                        </h1>
                        <RoomStatusBadge status={room.roomStatus} />
                      </div>
                      <p className="text-xs text-text-secondary">
                        Capacity: {room.roomCapacity} beds · {occupiedCount} occupied · {availableCount} available
                      </p>
                    </div>

                    {/* Occupancy bar */}
                    <div className="sm:w-48">
                      <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                        <span>Occupancy</span>
                        <span>{beds.length > 0 ? Math.round((occupiedCount / beds.length) * 100) : 0}%</span>
                      </div>
                      <div className="h-2 bg-border-soft rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal rounded-full transition-all duration-500"
                          style={{ width: beds.length > 0 ? `${(occupiedCount / beds.length) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Beds section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">
                  Beds
                  <span className="text-text-muted font-normal ml-1.5">({beds.length})</span>
                </h2>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-teal" />
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-teal-light border border-teal-border" />
                    <span>Available</span>
                  </div>
                </div>
              </div>

              {beds.length === 0 ? (
                <div className="bg-bg-card rounded-xl border border-border py-16 text-center">
                  <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-3">
                    <BedIcon />
                  </div>
                  <p className="text-sm font-medium text-text-primary mb-1">No beds in this room yet</p>
                  <p className="text-xs text-text-muted mb-4">Add beds to start assigning students.</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 bg-teal hover:bg-teal-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <PlusIcon /> Add first bed
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {beds.map((bed) => (
                    <div
                      key={bed._id}
                      className={`
                        relative rounded-xl border p-4 flex flex-col items-center gap-2 group
                        transition-all duration-150
                        ${bed.isOccupied
                          ? "bg-teal border-teal text-white"
                          : "bg-teal-light border-teal-border text-teal hover:border-teal"
                        }
                      `}
                    >
                      {/* Bed icon */}
                      <BedIcon />

                      {/* Bed number */}
                      <p className="text-sm font-semibold">{bed.bedNumber}</p>

                      {/* Status label */}
                      <p className={`text-xs ${bed.isOccupied ? "opacity-70" : "opacity-60"}`}>
                        {bed.isOccupied ? "Occupied" : "Available"}
                      </p>

                      {/* Delete button — only shown on hover for available beds */}
                      {!bed.isOccupied && (
                        <button
                          onClick={() => setDeleteTarget(bed)}
                          className="
                            absolute top-2 right-2 opacity-0 group-hover:opacity-100
                            w-5 h-5 rounded flex items-center justify-center
                            bg-white/20 hover:bg-red-bg hover:text-red
                            transition-all duration-150
                          "
                          title="Remove bed"
                        >
                          <CloseIcon size={10} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* "Add bed" card — always at the end of the grid */}
                  <button
                    onClick={() => setShowModal(true)}
                    className="
                      rounded-xl border-2 border-dashed border-border
                      p-4 flex flex-col items-center gap-2
                      text-text-muted hover:border-teal hover:text-teal
                      transition-colors duration-150
                    "
                  >
                    <PlusIcon />
                    <p className="text-xs font-medium">Add bed</p>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Add bed modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-bg-card rounded-2xl border border-border w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">
                Add bed to Room {room?.roomNumber}
              </h2>
              <button onClick={() => { setShowModal(false); setFormError(""); }} className="text-text-muted hover:text-text-primary transition-colors">
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleAddBed} className="p-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-red-bg border border-red-border text-red rounded-lg px-3 py-2.5 text-xs">
                  <AlertIcon />{formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">Bed number</label>
                <input
                  type="text" placeholder="e.g. Bed-1, A1, Top-Bunk"
                  value={bedNumber}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setBedNumber(e.target.value);
                    if (formError) setFormError("");
                  }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-bg-page border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(""); }}
                  className="flex-1 py-2.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-bg-page transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={creating}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-teal hover:bg-teal-hover disabled:bg-teal-mid rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? <><SpinnerIcon />Adding...</> : "Add bed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete bed confirmation ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-bg-card rounded-2xl border border-border w-full max-w-sm shadow-xl p-6">
            <div className="w-10 h-10 bg-red-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon />
            </div>
            <h2 className="text-sm font-semibold text-text-primary text-center mb-1">Remove bed?</h2>
            <p className="text-xs text-text-secondary text-center mb-6">
              This will permanently remove <strong>{deleteTarget.bedNumber}</strong> from this room.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-bg-page transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBed}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-red hover:opacity-90 rounded-lg transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? <><SpinnerIcon />Removing...</> : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Badges ─────────────────────────────────────────────────────

function RoomStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "bg-green-bg text-green border border-green-border",
    fullyOccupied: "bg-red-bg text-red border border-red-border",
    under_Maintenance: "bg-amber-bg text-amber border border-amber-border",
  };
  const labels: Record<string, string> = {
    available: "Available",
    fullyOccupied: "Full",
    under_Maintenance: "Maintenance",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${map[status] ?? map.available}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Icons ─────────────────────────────────────────────────────

function HouseIconSm() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>; }
function GridIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>; }
function UsersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>; }
function DoorIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4H3v18h18V9l-8-5z" /><path d="M13 4v5h5" /></svg>; }
function ReceiptIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>; }
function ChatIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>; }
function TaskIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,11 12,14 22,4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>; }
function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>; }
function BedIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 16h20" /></svg>; }
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>; }
function ChevronLeftIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6" /></svg>; }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6" /></svg>; }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function AlertIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function CloseIcon({ size = 16 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function TrashIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>; }
function SpinnerIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>; }
