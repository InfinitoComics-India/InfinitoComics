// Arc path math for the donut chart.
// Angles are in degrees, 0deg = 12 o'clock, increasing clockwise.

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/**
 * Builds an SVG path for a donut (ring) segment.
 * Returns an empty string for non-positive sweeps so nothing is painted.
 */
export const donutSegmentPath = (cx, cy, rInner, rOuter, startAngle, endAngle) => {
  const sweep = endAngle - startAngle;
  if (sweep <= 0.01) return '';

  // A single arc command cannot span a full circle, so clamp just under 360.
  const end = sweep >= 359.99 ? startAngle + 359.99 : endAngle;
  const largeArc = end - startAngle > 180 ? 1 : 0;

  const oStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const oEnd = polarToCartesian(cx, cy, rOuter, end);
  const iEnd = polarToCartesian(cx, cy, rInner, end);
  const iStart = polarToCartesian(cx, cy, rInner, startAngle);

  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${iStart.x} ${iStart.y}`,
    'Z',
  ].join(' ');
};

/** Point at the middle of a segment, at a given radius. Used for labels. */
export const arcMidPoint = (cx, cy, r, startAngle, endAngle) =>
  polarToCartesian(cx, cy, r, (startAngle + endAngle) / 2);

/** Indian-style digit grouping, e.g. 1234654 -> "12,34,654". */
export const formatIndian = (value) =>
  Math.round(value).toLocaleString('en-IN');

export { polarToCartesian };
