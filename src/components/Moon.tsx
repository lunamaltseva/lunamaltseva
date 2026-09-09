interface MoonProps {
  /** Illuminated fraction, 0 (new) → 1 (full). */
  fraction: number;
  /** Degrees to rotate the disk so the terminator tilts correctly. */
  rotation: number;
  /** Rendered size in CSS pixels. */
  size?: number;
}

const R = 98; // disk radius within the -100..100 viewBox

/**
 * SVG path for the lit portion of the disk, drawn with the bright limb pointing
 * right (+x). The whole group is rotated by `rotation` to set the real tilt.
 */
function litPath(fraction: number): string {
  const k = Math.max(0, Math.min(1, fraction));
  const rx = R * Math.abs(2 * k - 1); // terminator ellipse half-width
  const sweep = k > 0.5 ? 0 : 1; // gibbous bulges away from the lit limb, crescent toward it
  return `M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} A ${rx} ${R} 0 0 ${sweep} 0 ${-R} Z`;
}

export default function Moon({ fraction, rotation, size = 480 }: MoonProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      role="img"
      aria-label="The current phase of the Moon"
      style={{ display: 'block' }}
    >
      <g transform={`rotate(${rotation})`}>
        {/* Unlit face: pitch black against the night sky. */}
        <circle cx="0" cy="0" r={R} fill="#ffffff" />
        {/* Lit face: pure white. */}
        <path d={litPath(fraction)} fill="#000000" />
      </g>
      {/* White outline tracing the full disk. */}
      <circle cx="0" cy="0" r={R} fill="none" stroke="#ffffff" strokeWidth="0.4" />
    </svg>
  );
}
