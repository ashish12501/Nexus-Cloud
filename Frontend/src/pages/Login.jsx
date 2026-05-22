import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { setCredentials } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { data } = await apiClient.post(
        "/auth/login",
        {
          email: form.email,
          password: form.password,
        },
        { withCredentials: true },
      );

      const token = data?.user?.token || data?.token || null;

      dispatch(
        setCredentials({
          user: data.user,
          token,
        }),
      );

      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Unable to sign in. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050812] text-slate-100 flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(76,82,140,0.2),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(92,92,255,0.35),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(10,15,30,0.9),#050812_55%)]" aria-hidden />
      <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden />
      <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" aria-hidden />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-300 to-indigo-500 shadow-lg">
            <svg viewBox="0 0 64 64" className="h-11 w-11" role="presentation">
              <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#grad)" />
              <circle cx="21" cy="21" r="6" fill="#fff" />
              <circle cx="43" cy="21" r="6" fill="#fff" />
              <circle cx="21" cy="43" r="6" fill="#fff" />
              <circle cx="43" cy="43" r="6" fill="#fff" />
              <rect x="20" y="18" width="24" height="4" rx="2" fill="#fff" />
              <rect x="20" y="42" width="24" height="4" rx="2" fill="#fff" />
              <rect x="18" y="20" width="4" height="24" rx="2" fill="#fff" />
              <rect x="42" y="20" width="4" height="24" rx="2" fill="#fff" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#7b7bff" offset="0%" />
                  <stop stopColor="#5b5bff" offset="50%" />
                  <stop stopColor="#4c4cff" offset="100%" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Nexus</h1>
          <p className="text-sm text-slate-400">Universal Developer Workspace</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase" htmlFor="email">
              Email Address
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" role="presentation">
                <path
                  fill="currentColor"
                  d="M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 2-8 5-8-5h16Zm0 10H4V9l8 5 8-5v8Z"
                />
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">
              <label htmlFor="password">Password</label>
              <a className="text-[11px] normal-case text-slate-400 hover:text-slate-200" href="#">
                Forgot password?
              </a>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" role="presentation">
                <path
                  fill="currentColor"
                  d="M17 8V7a5 5 0 0 0-10 0v1H5v14h14V8h-2Zm-8-1a3 3 0 0 1 6 0v1H9V7Zm8 13H7V10h10v10Z"
                />
              </svg>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:text-slate-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" role="presentation">
                  {showPassword ? (
                    <path
                      fill="currentColor"
                      d="M12 6c-5 0-9 6-9 6s2.5 3.7 6.1 5.2l-2.3 2.3 1.4 1.4L21 8.6 19.6 7.2l-3 3C15.3 7.8 13.8 6 12 6Zm0 3c.7 0 1.3.2 1.8.6l-1.2 1.2A1.5 1.5 0 0 0 12 10.5c-.9 0-1.5.6-1.5 1.5 0 .3.1.6.2.8l-1.2 1.2C9.2 13.3 9 12.7 9 12c0-1.7 1.3-3 3-3Zm0 12c-5 0-9-6-9-6s1.6-2.4 4.3-4.3l1.5 1.5C6.9 13.2 6 14.5 6 14.5s3 4 6 4c1.3 0 2.4-.5 3.4-1.3l1.5 1.5c-1.5 1.1-3.1 1.8-4.9 1.8Z"
                    />
                  ) : (
                    <path
                      fill="currentColor"
                      d="M12 6c-5 0-9 6-9 6s4 6 9 6 9-6 9-6-4-6-9-6Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-1 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:brightness-105 disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "Signing In..." : "Sign In to Nexus"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <span>New to the platform?</span>
          <Link to="/signup" className="font-semibold text-indigo-200 hover:text-white">
            Create an account
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(56,248,165,0.12)]" aria-hidden />
            <span>System Operational</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-200">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-200">
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
