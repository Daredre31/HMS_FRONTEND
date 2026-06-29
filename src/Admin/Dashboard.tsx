import { useState, useEffect, useCallback } from "react";
import {
  Users,
  BedDouble,
  AlertTriangle,
  ClipboardList,
  RefreshCw,
  CreditCard,
  MessageSquareWarning,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import StatCard from "../components/layout/Statcard";
import api, { dashboardStats} from "../services/api";
  
interface DashboardStats {
  totalStudents: number;
  occupiedRooms: number;
  totalRooms: number;
  pendingRequests: number;
  activeComplaints: number;
  pendingPayments: number;
}

interface RecentActivity {
  _id: string;
  type: "check-in" | "check-out" | "complaint" | "request" | "payment";
  description: string;
  studentName: string;
  createdAt: string;
}

const activityDot: Record<RecentActivity["type"], string> = {
  "check-in": "bg-[var(--color-green)]",
  "check-out": "bg-[var(--color-blue)]",
  complaint:  "bg-[var(--color-red)]",
  request:    "bg-[var(--color-amber)]",
  payment:    "bg-[var(--color-teal)]",
};

export default function Dashboard() {
  const [stats, setStats]  = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actLoading, setActLoading]  = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen]  = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const adminName =
    localStorage.getItem("adminName") ?? localStorage.getItem("name") ?? "Admin";

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const { data } = await dashboardStats();
         console.log(data)
      setStats(data.data);
    } catch {
      setStatsError("Couldn't load stats. Check your connection and try again.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    setActLoading(true);
    try {
      const { data } = await api.get<RecentActivity[]>(
        "/server/admin/dashboard/activity?limit=8"
      );
      setActivity(data);
    } catch {
      // non-critical — stays empty
    } finally {
      setActLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchActivity();
  }, [fetchStats, fetchActivity]);

  const occupancyPct =
    stats && stats.totalRooms > 0
      ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
      : 0;

  // main content shifts right by sidebar width — done with inline style to match sidebar
  const contentOffset = sidebarCollapsed ? "64px" : "240px";

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
      />

      {/* this wrapper pushes the content to the right of the sidebar on desktop */}
      <div
        style={{ paddingLeft: contentOffset }}
        className="flex flex-col min-h-screen transition-[padding] duration-300 max-lg:pl-0!"
      >
        <Topbar
          isSidebarCollapsed={sidebarCollapsed}
          onMobileOpen={() => setSidebarOpen(true)}
          onDesktopToggle={() => setSidebarCollapsed((p) => !p)}
          adminName={adminName}
        />

        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">

          {/* heading + refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[var(--color-text-primary)] text-xl sm:text-2xl font-bold">
                Dashboard
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
                Hostel overview at a glance
              </p>
            </div>

            <button
              onClick={() => { fetchStats(); fetchActivity(); }}
              disabled={statsLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-dark-mid)] disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={15} className={statsLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* error banner */}
          {statsError && (
            <div className="flex items-start gap-3 bg-[var(--color-red-bg)] border border-[var(--color-red-border)] text-[var(--color-red)] rounded-lg px-4 py-3 text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{statsError}</span>
            </div>
          )}

          {/* stat cards — 2 cols mobile, 3 on md, 6 on xl */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <StatCard
              label="Students"
              value={stats?.totalStudents ?? "—"}
              icon={Users}
              variant="teal"
              subtext="Registered"
              loading={statsLoading}
            />
            <StatCard
              label="Rooms"
              value={stats ? `${stats.occupiedRooms}/${stats.totalRooms}` : "—"}
              icon={BedDouble}
              variant="blue"
              subtext={`${occupancyPct}% full`}
              loading={statsLoading}
            />
            <StatCard
              label="Requests"
              value={stats?.pendingRequests ?? "—"}
              icon={ClipboardList}
              variant="amber"
              subtext="Pending"
              loading={statsLoading}
            />
            <StatCard
              label="Complaints"
              value={stats?.activeComplaints ?? "—"}
              icon={MessageSquareWarning}
              variant="red"
              subtext="Active"
              loading={statsLoading}
            />
            <StatCard
              label="Payments"
              value={stats?.pendingPayments ?? "—"}
              icon={CreditCard}
              variant="green"
              subtext="Unpaid"
              loading={statsLoading}
            />
            <StatCard
              label="Alerts"
              value="—"
              icon={AlertTriangle}
              variant="amber"
              subtext="No alerts"
              loading={statsLoading}
            />
          </div>

          {/* bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* occupancy bar */}
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="text-[var(--color-text-primary)] font-semibold text-sm mb-5">
                Room Occupancy
              </h2>

              {statsLoading ? (
                <div className="space-y-3">
                  <div className="h-3 w-full rounded bg-[var(--color-dark-mid)] animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-[var(--color-dark-mid)] animate-pulse" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Occupied</span>
                    <span className="text-[var(--color-text-primary)] font-semibold">
                      {occupancyPct}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[var(--color-dark-mid)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-teal)] transition-all duration-700"
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                    <span>{stats?.occupiedRooms ?? 0} occupied</span>
                    <span>{(stats?.totalRooms ?? 0) - (stats?.occupiedRooms ?? 0)} available</span>
                  </div>
                </div>
              )}
            </div>

            {/* recent activity */}
            <div className="lg:col-span-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="text-[var(--color-text-primary)] font-semibold text-sm mb-4">
                Recent Activity
              </h2>

              {actLoading ? (
                <ul className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-dark-mid)] animate-pulse shrink-0" />
                      <div className="flex-1 h-4 rounded bg-[var(--color-dark-mid)] animate-pulse" />
                      <div className="w-12 h-4 rounded bg-[var(--color-dark-mid)] animate-pulse" />
                    </li>
                  ))}
                </ul>
              ) : activity.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-sm text-center py-8">
                  No recent activity yet.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--color-border-soft)]">
                  {activity.map((item) => (
                    <li key={item._id} className="flex items-start gap-3 py-2.5 first:pt-0">
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activityDot[item.type]}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--color-text-primary)] text-sm truncate">
                          {item.description}
                        </p>
                        <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                          {item.studentName}
                        </p>
                      </div>
                      <time className="text-[var(--color-text-muted)] text-xs shrink-0">
                        {new Date(item.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
