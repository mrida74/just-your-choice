export default function CategorySectionSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-8 w-40 rounded bg-pink-100" />
          <div className="h-64 rounded-lg bg-pink-50" />
          <div className="h-4 w-full rounded bg-pink-100" />
        </div>
      ))}
    </div>
  );
}
