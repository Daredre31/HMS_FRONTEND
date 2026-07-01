import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminLoginAPI } from "../services/api";

// Shape of what the login API sends back
interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  name?: string;
  email?: string;
  role?: string;
}

// What we store in localStorage after login
interface StoredUser {
  name: string;
  email: string;
  role: string;
}

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields before continuing.");
      return;
    }

    setLoading(true);

    try {
      const res = await adminLoginAPI({email , password})

      const data: LoginResponse = await res.data;
      console.log(data)
     

      if (res.status==400) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      // Save token and user info so other pages can access them
      localStorage.setItem("hms_token", data.token!);

      const user: StoredUser = {
        name: data.name!,
        email: data.email!,
        role: data.role!,
      };
      localStorage.setItem("hms_user", JSON.stringify(user));

      navigate("/admin/dashboard");
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-bg-page">

      {/*  Left panel: branding and context */}
      <div className="hidden lg:flex w-[45%] bg-dark flex-col justify-between p-12 relative overflow-hidden">

        {/* Decorative ring accents — purely visual, no meaning */}
        <span className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-teal/20 pointer-events-none" />
        <span className="absolute top-10 right-10 w-48 h-48 rounded-full border border-teal/10 pointer-events-none" />
        <span className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border border-teal/15 pointer-events-none" />

        {/* Top: logo + headline */}
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center flex-shrink-0">
              <HouseIcon />
            </div>
            <span className="text-teal-light text-lg font-semibold tracking-tight">
              APPLICK_HostelOS
            </span>
          </div>

          <h1 className="text-white text-4xl font-bold leading-tight tracking-tight mb-4">
            Hostel<br />
            <span className="text-teal">Management</span><br />
            System
          </h1>

          <p className="text-dark-muted text-sm leading-relaxed max-w-xs">
            One dashboard for students, rooms, payments, and everything in between.
          </p>
        </div>

        {/* Bottom: quick feature tags */}
        <div className="flex gap-6">
          {["Students", "Rooms", "Payments"].map((tag) => (
            <div key={tag}>
              <p className="text-teal text-sm font-semibold mb-0.5">Active</p>
              <p className="text-dark-muted text-xs">{tag}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: the actual login form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Page heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-1">
              Welcome back
            </h2>
            <p className="text-text-secondary text-sm">
              Sign in to your admin account
            </p>
          </div>

          {/* Error banner — only shows when something goes wrong */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-bg border border-red-border text-red rounded-lg px-4 py-3 text-sm mb-5">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Email address
              </label>
              <input
                type="email"
                placeholder="admin@hostel.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="
                  w-full px-4 py-2.5 rounded-lg text-sm
                  bg-bg-card text-text-primary
                  border border-border
                  placeholder:text-text-muted
                  focus:outline-none focus:border-teal
                  transition-colors duration-150
                "
              />
            </div>

            {/* Password field with show/hide toggle */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="
                    w-full px-4 py-2.5 pr-11 rounded-lg text-sm
                    bg-bg-card text-text-primary
                    border border-border
                    placeholder:text-text-muted
                    focus:outline-none focus:border-teal
                    transition-colors duration-150
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 mt-1 rounded-lg text-sm font-semibold text-white
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
                "Sign in"
              )}
            </button>
          </form>

          {/* Role indicator at the bottom */}
          <div className="mt-8 flex justify-center">
            <span className="inline-flex items-center gap-2 bg-teal-light px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
              <span className="text-xs text-teal font-medium">Admin portal</span>
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}



// Keeping them here avoids an extra icon library dependency for now.
// i will  Move them to a shared /components/icons folder when the project grows.

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

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
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
