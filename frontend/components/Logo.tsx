export default function Logo({
  tone = "ink",
  size = 36,
  showWordmark = true,
  className = "",
}: {
  tone?: "ink" | "cream";
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  const frame = tone === "cream" ? "#F8F5EE" : "#23241F";
  const inner = tone === "cream" ? "#23241F" : "#F8F5EE";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M20 1.5 L38.5 20 L20 38.5 L1.5 20 Z" fill={frame} />
        <path d="M16 11.5 H24" stroke="#8A4632" strokeWidth="2.6" strokeLinecap="square" />
        <path
          d="M13.2 15.4 L20 28.4 L26.8 15.4"
          fill="none"
          stroke={inner}
          strokeWidth="2.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      {showWordmark && (
        <span className="font-display leading-none tracking-[0.18em] text-[1.4rem] md:text-[1.6rem]">
          VELARA
        </span>
      )}
    </span>
  );
}
