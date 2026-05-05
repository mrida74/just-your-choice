"use client";

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  callbackUrl?: string;
};

export default function SignOutButton({ callbackUrl = "/" }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl })}
      className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
    >
      Sign out
    </button>
  );
}
