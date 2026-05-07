type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
};

export default function Sparkline({
  data,
  width = 220,
  height = 48,
  stroke = "#ec4899",
}: SparklineProps) {
  if (!data.length) {
    return <div className="h-12 w-56 rounded-xl bg-zinc-100" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-56">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
