import { useState, type FormEvent, type ChangeEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { studentLoginAPI } from "../services/api";

// What the student login API sends back
interface StudentLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  loginStudent?: {
    _id: string;
    name: string;
    email: string;
    tokenId: string;
    currentSession: string;
    paymentStatus: string;
    expiryDate: string;
    bed: {
      bedNumber: string;
      room: {
        roomNumber: string;
      };
    };
  };
}

export default function StudentLogin() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [tokenId, setTokenId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Force uppercase so HMS-XXXXXXXX always looks right as the user types
    setTokenId(e.target.value.toUpperCase());
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!tokenId.trim()) {
      setError("Enter the ID your hostel admin gave you.");
      inputRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const res = await studentLoginAPI({tokenId})

      const data: StudentLoginResponse = await res.data;

      if (res.status == 400) {
        setError(data.message || "ID not recognised. Contact your admin.");
        return;
      }

      // Save the JWT and student info for protected student routes
      localStorage.setItem("hms_student_token", data.token!);
      localStorage.setItem("hms_student", JSON.stringify(data.loginStudent));

      navigate("/student/dashboard");
    } catch {
      setError("Could not reach the server. Try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-bg-page">

      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex w-[45%] bg-dark flex-col justify-between p-12 relative overflow-hidden">

        {/* Decorative rings — consistent visual language across all auth pages */}
        <span className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-teal/20 pointer-events-none" />
        <span className="absolute top-10 right-10 w-48 h-48 rounded-full border border-teal/10 pointer-events-none" />
        <span className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border border-teal/15 pointer-events-none" />

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center flex-shrink-0">
              <HouseIcon />
            </div>
            <span className="text-teal-light text-lg font-semibold tracking-tight">
              HostelOS
            </span>
          </div>

          <h1 className="text-white text-4xl font-bold leading-tight tracking-tight mb-4">
            Your hostel,<br />
            <span className="text-teal">your</span><br />
            portal
          </h1>

          <p className="text-dark-muted text-sm leading-relaxed max-w-xs">
            Check your room details, track payments, view tasks, and stay updated — all in one place.
          </p>
        </div>

        {/* What the student can do after logging in */}
        <div className="flex flex-col gap-3">
          {[
            { icon: <BedIcon />, label: "View your room and bed info" },
            { icon: <ReceiptIcon />, label: "Track your payment status" },
            { icon: <TaskIcon />, label: "See assigned tasks" },
            { icon: <BellIcon />, label: "Get hostel announcements" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-teal">{icon}</span>
              <span className="text-dark-muted text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: the login form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Heading — written for a student, not a system */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-1">
              Enter your student ID
            </h2>
            <p className="text-text-secondary text-sm">
              Use the unique ID your hostel admin gave you after registration.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-bg border border-red-border text-red rounded-lg px-4 py-3 text-sm mb-5">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Token input — the only field on this page */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Student ID
              </label>
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. ID-EP_LQXZKGY"
                value={tokenId}
                onChange={handleChange}
                autoComplete="off"
                spellCheck={false}
                className="
                  w-full px-4 py-3 rounded-lg text-sm font-mono tracking-widest
                  bg-bg-card text-text-primary
                  border border-border
                  placeholder:text-text-muted placeholder:tracking-normal placeholder:font-sans
                  focus:outline-none focus:border-teal
                  transition-colors duration-150
                "
              />
              <p className="text-xs text-text-muted mt-1.5">
                Your ID starts with <span className="font-mono text-text-secondary">ID-</span> and was given to you by your admin.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-lg text-sm font-semibold text-white
                bg-teal hover:bg-teal-hover
                disabled:bg-teal-mid disabled:cursor-not-allowed
                transition-colors duration-200
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Signing in...
                </>
              ) : (
                "Access my portal"
              )}
            </button>
          </form>

          {/* Help text — tells the student what to do if they don't have an ID */}
          <div className="mt-8 p-4 bg-blue-bg border border-blue-border rounded-lg">
            <p className="text-xs text-blue font-medium mb-1">Don't have an ID?</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your ID is issued by the hostel admin after you complete registration and payment. Contact your admin if you haven't received yours.
            </p>
          </div>

          {/* Student role badge */}
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 bg-teal-light px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
              <span className="text-xs text-teal font-medium">Student portal</span>
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}


// ── Inline SVG icons ──────────────────────────────────────────
// Consistent with AdminLogin and AdminSignup.
// Move to /components/icons/index.tsx when the project grows.

function HouseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 16h20" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,11 12,14 22,4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2.5"
      className="animate-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
