"use client";
import React, { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Login failed");
        setLoading(false);
        return;
      }

      if (data.requiresMFA) {
        setRequiresMFA(true);
        setAdminId(data.admin?.id || null);
        setLoading(false);
        return;
      }

      // Cookie should be set by the server; redirect to admin
      window.location.href = "/admin";
    } catch (err: any) {
      setError(String(err));
      setLoading(false);
    }
  }

  async function handleVerifyMFA(e: React.FormEvent) {
    e.preventDefault();
    if (!adminId) return setError("Missing admin id for MFA");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, email, code: mfaCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "MFA verification failed");
        setLoading(false);
        return;
      }

      // Cookie should be set by server; redirect
      window.location.href = "/admin";
    } catch (err: any) {
      setError(String(err));
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Login</h1>
        <p className="text-sm text-gray-600 mb-6">Secure access to your store management dashboard</p>

        {!requiresMFA ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-pink-500 focus:bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-pink-500 focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-pink-600 text-white px-4 py-3 text-sm font-semibold transition-colors hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyMFA} className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Multi-Factor Authentication</p>
              <p className="text-xs text-gray-600 mb-4">Check your authenticator app and enter the 6-digit code</p>
              <input
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-pink-500 focus:bg-white tracking-widest text-center"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-pink-600 text-white px-4 py-3 text-sm font-semibold transition-colors hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
