"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error") || "unknown_error";

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Authentication Error</h1>
        <p className="text-sm text-zinc-600 mb-4">There was a problem signing you in: <strong className="text-red-600">{error}</strong></p>
        <div className="flex gap-2">
          <Link href="/login" className="inline-block px-4 py-2 bg-pink-600 text-white rounded">Back to Login</Link>
          <Link href="/" className="inline-block px-4 py-2 border rounded">Home</Link>
        </div>
      </div>
    </div>
  );
}
