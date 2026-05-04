"use client";

type ProgressBarProps = {
  visible: boolean;
  progress: number;
};

export default function ProgressBar({ visible, progress }: ProgressBarProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-pink-500 via-fuchsia-500 to-pink-600 transition-[transform,opacity] duration-150 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: `scaleX(${Math.max(0, Math.min(progress, 100)) / 100})`,
        }}
      />
    </div>
  );
}
