export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-pink-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-600 border-r-pink-600 animate-spin"></div>
      </div>
    </div>
  );
}
