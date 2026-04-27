import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-black text-zinc-900">Page not found</h1>
        <p className="mt-3 text-sm text-zinc-600">
          The page or category you requested does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
