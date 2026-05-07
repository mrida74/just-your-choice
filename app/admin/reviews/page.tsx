import { getReviewsForModeration, getPendingReviewCount } from "@/lib/review-service";
import ReviewModerationCard from "@/components/admin/ReviewModerationCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminReviewsPage() {
  const [reviews, pendingCount] = await Promise.all([
    getReviewsForModeration({ status: "pending", limit: 100 }),
    getPendingReviewCount(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Reviews</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Review Moderation</h1>
          <p className="mt-1 text-sm text-zinc-600">Approve, feature, or reject customer reviews.</p>
          {pendingCount > 0 && (
            <div className="mt-3 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
              {pendingCount} pending review{pendingCount !== 1 ? "s" : ""} awaiting moderation
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
            No reviews to moderate.
          </div>
        ) : (
          reviews.map((review) => <ReviewModerationCard key={review.id} review={review} />)
        )}
      </section>
    </div>
  );
}
