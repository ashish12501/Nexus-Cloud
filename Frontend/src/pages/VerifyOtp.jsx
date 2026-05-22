import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialEmail = state?.email || "";

  const [form, setForm] = useState({ email: initialEmail, otp: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await apiClient.post(
        "/auth/verify-otp",
        {
          email: form.email,
          otp: form.otp,
        },
        { withCredentials: true },
      );

      setSuccess("Profile verified! Please log in.");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Unable to verify. Please try again.";
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
          <h1 className="text-2xl font-semibold">Verify OTP</h1>
          <p className="text-sm text-slate-400">Enter the code sent to your email</p>
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
              <label htmlFor="otp">OTP Code</label>
              <span className="text-[11px] normal-case text-slate-400">6-digit code</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" role="presentation">
                <path
                  fill="currentColor"
                  d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v2h14V6H5Zm0 4v8h14v-8H5Zm2 3h3v2H7v-2Zm5 0h3v2h-3v-2Z"
                />
              </svg>
              <input
                id="otp"
                name="otp"
                type="text"
                placeholder="123456"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength="6"
                required
                value={form.otp}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="mt-1 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:brightness-105 disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <span>Need to change email?</span>
          <Link to="/signup" className="font-semibold text-indigo-200 hover:text-white">
            Go back
          </Link>
        </div>
      </div>
    </div>
  );
}
