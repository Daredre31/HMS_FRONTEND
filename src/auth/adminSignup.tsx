import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminSignupAPI } from "../services/api";

// What the signup API sends back
interface SignupResponse {
  success: boolean;
  message: string;
  name?: string;
  email?: string;
  role?: string;
}

// Local form state shape — keeps the form logic clean
interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AdminSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // Single handler for all inputs — avoids four separate onChange functions
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  // Password strength indicator — purely visual feedback for the user
  const getPasswordStrength = (): { label: string; width: string; color: string } => {
    const p = form.password;
    if (!p) return { label: "", width: "0%", color: "" };
    if (p.length < 6) return { label: "Too short", width: "25%", color: "bg-red" };
    if (p.length < 8) return { label: "Weak", width: "50%", color: "bg-amber" };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "Fair", width: "70%", color: "bg-amber" };
    return { label: "Strong", width: "100%", color: "bg-teal" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Client-side validation before hitting the network
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await adminSignupAPI({
        name:form.name , email:form.email, password:form.password
      })
      const data: SignupResponse = await res.data;

      if (res.data === 400) {
        setError(data.message || "Signup failed. Please try again.");
        return;
      }

      // Show brief success state before redirecting to login
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-bg-page">

      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex w-[45%] bg-dark flex-col justify-between p-12 relative overflow-hidden">

        {/* Decorative rings — same language as the login page */}
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
            Set up your<br />
            <span className="text-teal">admin</span><br />
            account
          </h1>

          <p className="text-dark-muted text-sm leading-relaxed max-w-xs">
            This is a one-time setup. Once your account is created you can start adding rooms, beds, and students immediately.
          </p>
        </div>

        {/* Steps — gives the user a sense of what comes after signup */}
        <div className="flex flex-col gap-4">
          {[
            { step: "01", label: "Create admin account" },
            { step: "02", label: "Add rooms and beds" },
            { step: "03", label: "Register students" },
          ].map(({ step, label }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="text-xs font-mono text-teal">{step}</span>
              <span className="text-dark-muted text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: signup form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-1">
              Create account
            </h2>
            <p className="text-text-secondary text-sm">
              Fill in the details below to get started.
            </p>
          </div>

          {/* Success state — shown briefly before redirect */}
          {success && (
            <div className="flex items-center gap-2.5 bg-green-bg border border-green-border text-green rounded-lg px-4 py-3 text-sm mb-5">
              <CheckIcon />
              <span>Account created! Redirecting to login...</span>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-bg border border-red-border text-red rounded-lg px-4 py-3 text-sm mb-5">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Damilare Olaniyi"
                value={form.name}
                onChange={handleChange}
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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                placeholder="admin@hostel.com"
                value={form.email}
                onChange={handleChange}
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

            {/* Password with strength meter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
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

              {/* Strength bar — only visible once the user starts typing */}
              {form.password && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-border-soft rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
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
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Inline match feedback — saves the user from submitting to find out */}
              {form.confirmPassword && (
                <p className={`text-xs mt-1 ${form.password === form.confirmPassword ? "text-green" : "text-red"}`}>
                  {form.password === form.confirmPassword ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Link back to login */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{" "}
            <Link
              to="admin/login"
              className="text-teal font-medium hover:text-teal-hover transition-colors"
            >
              Sign in
            </Link>
          </p>

          {/* Role badge */}
          <div className="mt-6 flex justify-center">
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


// ── Inline SVG icons ──────────────────────────────────────────
// Same set as AdminLogin for visual consistency.
// Pull these into /components/icons/index.tsx when the app grows.

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

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="flex-shrink-0">
      <polyline points="20,6 9,17 4,12" />
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
