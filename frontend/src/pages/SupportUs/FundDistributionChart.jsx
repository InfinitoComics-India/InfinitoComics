import React, { useEffect, useMemo, useState } from 'react';
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
  fundDistribution,
  INFINITO_FUND_TOTAL,
} from '../../constants/fundDistribution.js';
import { donutSegmentPath, arcMidPoint, formatIndian } from '../../utils/donutArc.js';

/* ---------------------------------------------------------------- geometry */

// The viewBox is deliberately larger than the ring so the % labels that sit
// outside R_OUTER have room to render without being clipped at the edge.
const R_OUTER = 140;
const R_INNER = 100;
const LABEL_R = R_OUTER + 20;      // sub-arc % labels
const CAT_LABEL_R = R_OUTER + 26;  // category % labels
const LABEL_ROOM = 34;             // slack for the width of the label text

const SIZE = (CAT_LABEL_R + LABEL_ROOM) * 2; // = 400
const CX = SIZE / 2;
const CY = SIZE / 2;
const GAP_DEG = 2.5;       // gap between sub-arcs when expanded
const SEGMENT_GAP = 1.5;   // gap between top-level categories

/* ------------------------------------------------------------------ sub-arc
 * One slice of a category. It is always rendered; the `morph` motion value
 * drives the split. At morph=0 the sub-arcs sit flush against each other and
 * share the parent colour, so together they read as a single solid arc. At
 * morph=1 they separate by GAP_DEG and take their own tint. Interpolating
 * that value is what produces the smooth split/merge instead of a hard swap.
 */
function SubArc({
  morph,
  mount,
  segStart,
  segSweep,
  weightBefore,
  weight,
  totalWeight,
  index,
  count,
  parentColor,
  subColor,
}) {
  const d = useTransform([mount, morph], ([p, t]) => {
    const sweep = segSweep * p;
    const gaps = (count - 1) * GAP_DEG * t;
    const usable = Math.max(sweep - gaps, 0);
    const start = segStart + (usable * weightBefore) / totalWeight + index * GAP_DEG * t;
    const end = start + (usable * weight) / totalWeight;
    return donutSegmentPath(CX, CY, R_INNER, R_OUTER, start, end);
  });

  const fill = useTransform(morph, [0, 1], [parentColor, subColor]);

  return <motion.path d={d} fill={fill} />;
}

/* ------------------------------------------------------------- category arc */

function CategoryArc({ category, segStart, segSweep, expanded, mount }) {
  const morph = useMotionValue(0);

  useEffect(() => {
    const controls = animate(morph, expanded ? 1 : 0, {
      duration: 0.45,
      ease: 'easeInOut',
    });
    return () => controls.stop();
  }, [expanded, morph]);

  const totalWeight = category.subItems.reduce((sum, s) => sum + s.percent, 0);

  // Cumulative weight before each sub-item, so slices sit in order.
  const offsets = useMemo(() => {
    let running = 0;
    return category.subItems.map((s) => {
      const before = running;
      running += s.percent;
      return before;
    });
  }, [category.subItems]);

  // Label anchor points, computed at the fully-expanded geometry.
  const labelPoints = useMemo(() => {
    const gaps = (category.subItems.length - 1) * GAP_DEG;
    const usable = Math.max(segSweep - gaps, 0);
    return category.subItems.map((s, i) => {
      const start = segStart + (usable * offsets[i]) / totalWeight + i * GAP_DEG;
      const end = start + (usable * s.percent) / totalWeight;
      return arcMidPoint(CX, CY, LABEL_R, start, end);
    });
  }, [category.subItems, segStart, segSweep, offsets, totalWeight]);

  const categoryLabel = arcMidPoint(CX, CY, CAT_LABEL_R, segStart, segStart + segSweep);

  return (
    <g>
      {category.subItems.map((sub, i) => (
        <SubArc
          key={sub.name}
          morph={morph}
          mount={mount}
          segStart={segStart}
          segSweep={segSweep}
          weightBefore={offsets[i]}
          weight={sub.percent}
          totalWeight={totalWeight}
          index={i}
          count={category.subItems.length}
          parentColor={category.color}
          subColor={sub.color}
        />
      ))}

      {/* Category % label outside the ring, hidden while its breakdown is open */}
      <AnimatePresence>
        {!expanded && (
          <motion.text
            key={`${category.id}-cat-label`}
            x={categoryLabel.x}
            y={categoryLabel.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={category.color}
            className="text-[13px] font-bold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
          >
            {category.percent}%
          </motion.text>
        )}
      </AnimatePresence>

      {/* Floating per-sub-arc % labels, only while expanded */}
      <AnimatePresence>
        {expanded &&
          category.subItems.map((sub, i) => (
            <motion.text
              key={`${category.id}-${sub.name}-label`}
              x={labelPoints[i].x}
              y={labelPoints[i].y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={sub.color}
              className="text-[11px] font-semibold"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, delay: 0.12 + i * 0.05 }}
            >
              {sub.percent}%
            </motion.text>
          ))}
      </AnimatePresence>
    </g>
  );
}

/* ------------------------------------------------------------- centre total */

/* Rendered inside the SVG so it scales with the chart and always fits the
 * hollow centre. textAnchor="middle" keeps it centred on every frame, so the
 * digits never reflow or wrap while counting up. */
function CentreTotal({ total }) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(formatIndian(0));

  useEffect(() => {
    const unsubscribe = count.on('change', (v) => setDisplay(formatIndian(v)));
    const controls = animate(count, total, { duration: 1.4, ease: 'easeOut' });
    return () => {
      unsubscribe();
      controls.stop();
    };
  }, [count, total]);

  return (
    <g className="pointer-events-none">
      <text
        x={CX}
        y={CY - 24}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#6B7280"
        style={{ fontSize: 15, letterSpacing: '0.2em' }}
      >
        INFINITO FUND
      </text>
      <text
        x={CX}
        y={CY + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#111827"
        style={{ fontSize: 36, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
      >
        {display}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- legend row */

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

function CategoryRow({ category, expanded, onToggle }) {
  return (
    <div className="relative border-l-4 pl-3 text-start" style={{ borderColor: category.color }}>
      <span className="block text-sm font-semibold" style={{ color: category.color }}>
        {category.percent}%
      </span>

      <h3 className="text-lg sm:text-xl font-semibold text-black">{category.name}</h3>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-sm text-[#4B5563]"
      >
        {category.subItems.map((sub) => (
          <motion.div
            key={sub.name}
            variants={itemVariants}
            className="flex items-center gap-2 py-0.5"
          >
            <span
              className="inline-block w-2 h-2 shrink-0"
              style={{ backgroundColor: sub.color }}
            />
            <span>{sub.name}</span>

            {/* % appears only when the breakdown is open */}
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.2 }}
                  className="font-semibold"
                  style={{ color: sub.color }}
                >
                  {sub.percent}%
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="mt-2 flex items-center gap-1 text-[11px] font-medium tracking-widest text-gray-700 hover:text-black hover:underline cursor-pointer"
      >
        {expanded ? 'HIDE BREAKDOWN' : 'VIEW BREAKDOWN'}
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex"
        >
          <ChevronDown size={14} aria-hidden="true" />
        </motion.span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------- chart */

function FundDistributionChart() {
  // Independent open/closed state per category, so several can be open at once.
  const [expandedIds, setExpandedIds] = useState({});

  const toggle = (id) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  // Mount progress: drives the arcs sweeping out from 0deg.
  const mount = useMotionValue(0);
  useEffect(() => {
    const controls = animate(mount, 1, { duration: 0.8, ease: 'easeOut' });
    return () => controls.stop();
  }, [mount]);

  // Cumulative start angle per category.
  const segments = useMemo(() => {
    const totalPercent = fundDistribution.reduce((s, c) => s + c.percent, 0);
    let cursor = 0;
    return fundDistribution.map((category) => {
      const full = (category.percent / totalPercent) * 360;
      const segStart = cursor;
      cursor += full;
      return { category, segStart, segSweep: Math.max(full - SEGMENT_GAP, 0) };
    });
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div className="w-11/12 lg:w-2/3 bg-white text-gray-800">
        <div className="w-full pt-16 font-sans">
          <h2 className="text-start text-2xl md:text-[1.9rem] font-bold mb-6">
            HOW WE DISTRIBUTE OUR FUNDS
          </h2>

          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Donut */}
            <div className="w-full max-w-[400px] shrink-0">
              <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="Donut chart of how Infinito distributes its funds"
              >
                {segments.map(({ category, segStart, segSweep }) => (
                  <CategoryArc
                    key={category.id}
                    category={category}
                    segStart={segStart}
                    segSweep={segSweep}
                    expanded={!!expandedIds[category.id]}
                    mount={mount}
                  />
                ))}
                <CentreTotal total={INFINITO_FUND_TOTAL} />
              </svg>
            </div>

            {/* Legend */}
            <div className="w-full flex-1 space-y-8">
              {fundDistribution.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  expanded={!!expandedIds[category.id]}
                  onToggle={() => toggle(category.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FundDistributionChart;
