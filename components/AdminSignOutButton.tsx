"use client";

import { useState } from "react";

export default function AdminSignOutButton() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);

    try {
      await fetch("/admin/signout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (error) {
      console.error("Admin signout failed:", error);
    } finally {
      window.location.href = "/admin/login";
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}