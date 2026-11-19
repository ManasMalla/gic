import { cn } from "@/lib/cn";

/**
 * The GITAM "ray" pattern from the brand guidelines: tapered stripes fanning along a sweeping curve,
 * in dark green on GITAM green. Decorative only. `flip` mirrors it to the left corner.
 */
const W = 1600;
const H = 520;
const stripes = Array.from({ length: 64 }, (_, i) => {
  const t = i / 63; // 0 (left of the fan) -> 1 (right edge)
  const x = 560 + t * 1070;
  const top = H - (H * 0.92) * Math.pow(t, 2.1);
  const lean = 26 * (1 - t * 0.55); // stripes tilt more on the left, stand almost upright at the right
  return { x, top, lean, key: i };
});

export function BrandRays({ className, flip, tone = "dark" }: { className?: string; flip?: boolean; tone?: "dark" | "antique" }) {
  const color = tone === "dark" ? "#004740" : "#F4E4C9";
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden
      className={cn("pointer-events-none absolute bottom-0 right-0 w-full", flip && "-scale-x-100", className)}
    >
      <g stroke={color} strokeWidth="7" strokeLinecap="butt" fill="none">
        {stripes.map((s) => (
          <line key={s.key} x1={s.x} y1={s.top} x2={s.x - s.lean} y2={H} />
        ))}
      </g>
      <path d={`M0 ${H} C 420 ${H - 40}, 1000 ${H - 120}, ${W} ${H - 330} L ${W} ${H} Z`} fill={color} opacity="0.5" />
    </svg>
  );
}
