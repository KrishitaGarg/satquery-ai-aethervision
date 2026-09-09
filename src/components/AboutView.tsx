import React from 'react';
import {
  Eye,
  FileText,
  Crosshair,
  GitCompare,
  Combine,
  Bot,
  ArrowRight,
  Satellite,
  UploadCloud,
  MessageSquareText,
  CheckCircle2,
} from 'lucide-react';

const CAPABILITIES = [
  {
    code: 'VQA',
    icon: Eye,
    title: 'Visual question answering',
    body: 'Ask direct questions about objects, counts, spatial patterns, and facility footprints.',
  },
  {
    code: 'SCN',
    icon: FileText,
    title: 'Scene description',
    body: 'Get a holistic read on land use, topography, and environmental context.',
  },
  {
    code: 'GRD',
    icon: Crosshair,
    title: 'Region grounding',
    body: 'Point at a text description and get back the bounding coordinates on the scene.',
  },
  {
    code: 'CHG',
    icon: GitCompare,
    title: 'Change detection',
    body: 'Compare two passes over time to track deforestation, construction, or water levels.',
  },
  {
    code: 'SAR',
    icon: Combine,
    title: 'Optical + SAR fusion',
    body: 'Cross-reference true-color optical imagery with cloud-penetrating radar.',
  },
  {
    code: 'AGT',
    icon: Bot,
    title: 'Agentic orchestration',
    body: 'Your query is classified and routed to the right analytical tool automatically.',
  },
];

const BENCHMARKS = [
  { name: 'BigEarthNet', tag: 'Land cover', body: 'Large-scale multispectral and SAR land-cover archive.' },
  { name: 'RSVQA', tag: 'VQA', body: 'Visual question answering benchmark built for remote sensing.' },
  { name: 'VRSBench', tag: 'Grounding', body: 'High-resolution captioning and visual grounding dataset.' },
  { name: 'CDVQA', tag: 'Change', body: 'Bi-temporal change detection question-answering dataset.' },
];

const FOCUS_AREAS = [
  'Multimodal remote sensing',
  'Bi-temporal change modeling',
  'Optical + SAR synthesis',
  'Autonomous agent routing',
];

const WORKFLOW_STEPS = [
  {
    icon: UploadCloud,
    title: 'Upload a scene',
    body: 'Drop in optical, multispectral, or SAR imagery — no format conversion needed.',
  },
  {
    icon: MessageSquareText,
    title: 'Ask in plain language',
    body: 'Skip the pipeline. Type the question the way you would ask a colleague.',
  },
  {
    icon: CheckCircle2,
    title: 'Get a grounded answer',
    body: 'Routed to the right tool and returned with spatial evidence and a confidence score.',
  },
];

// Hand-placed parcel rectangles standing in for farmland/urban blocks on the
// hero scene tile. Not randomized — deliberately arranged so nothing overlaps
// the grounding box or the pivot cluster.
const PARCELS = [
  { x: 40, y: 62, w: 52, h: 36, o: 0.7 },
  { x: 96, y: 62, w: 34, h: 36, o: 0.5 },
  { x: 40, y: 102, w: 34, h: 44, o: 0.55 },
  { x: 78, y: 106, w: 40, h: 40, o: 0.4 },
  { x: 40, y: 150, w: 78, h: 30, o: 0.6 },
  { x: 40, y: 184, w: 46, h: 40, o: 0.45 },
  { x: 90, y: 184, w: 28, h: 40, o: 0.65 },
  { x: 40, y: 228, w: 78, h: 34, o: 0.5 },
  { x: 336, y: 62, w: 38, h: 30, o: 0.55 },
  { x: 336, y: 96, w: 38, h: 34, o: 0.4 },
  { x: 336, y: 134, w: 38, h: 40, o: 0.6 },
  { x: 340, y: 232, w: 34, h: 30, o: 0.5 },
  { x: 200, y: 240, w: 60, h: 34, o: 0.45 },
  { x: 264, y: 244, w: 44, h: 30, o: 0.6 },
];

// Cluster of center-pivot irrigation circles inside the grounding box —
// matches the "How many center-pivot fields" example query.
const PIVOTS = [
  { cx: 208, cy: 134, r: 15 },
  { cx: 240, cy: 122, r: 11 },
  { cx: 268, cy: 146, r: 13 },
  { cx: 300, cy: 128, r: 9 },
  { cx: 212, cy: 176, r: 12 },
  { cx: 248, cy: 190, r: 10 },
  { cx: 282, cy: 182, r: 14 },
  { cx: 300, cy: 200, r: 8 },
  { cx: 232, cy: 158, r: 8 },
  { cx: 266, cy: 172, r: 7 },
  { cx: 196, cy: 200, r: 9 },
  { cx: 304, cy: 168, r: 10 },
  { cx: 220, cy: 210, r: 7 },
  { cx: 288, cy: 210, r: 8 },
];

interface AboutViewProps {
  onNavigateToAnalyze?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigateToAnalyze,
}) => {
  return (
    <div className="sq-about">
      <style>{`
        .sq-about {
          --bg: #ffffff;
          --panel: #f8fafc;
          --panel-soft: #f1f5f9;
          --line: rgba(15, 23, 42, 0.10);
          --line-strong: rgba(15, 23, 42, 0.18);
          --ink: #0f172a;
          --ink-dim: #64748b;
          --ink-faint: #94a3b8;
          --accent: #159570;
          --accent-soft: rgba(21, 149, 112, 0.10);
          --accent-line: rgba(21, 149, 112, 0.30);

          background: var(--bg);
          color: var(--ink);
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;

          background-image:
            radial-gradient(
              circle at 1px 1px,
              rgba(15, 23, 42, 0.07) 1px,
              transparent 0
            );
          background-size: 28px 28px;

          transition:
            background-color 180ms ease,
            color 180ms ease;
        }

        .dark .sq-about {
          --bg: #070b12;
          --panel: #0c121c;
          --panel-soft: #0a0f18;
          --line: rgba(148, 163, 184, 0.14);
          --line-strong: rgba(148, 163, 184, 0.26);
          --ink: #eaeef4;
          --ink-dim: #97a3b6;
          --ink-faint: #5c6b81;
          --accent: #3ddc9b;
          --accent-soft: rgba(61, 220, 155, 0.12);
          --accent-line: rgba(61, 220, 155, 0.35);

          background-image:
            radial-gradient(
              circle at 1px 1px,
              rgba(148, 163, 184, 0.16) 1px,
              transparent 0
            );
        }

        .sq-about * {
          box-sizing: border-box;
        }

        .sq-mono {
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
        }

        .sq-corner {
          position: relative;
        }

        .sq-corner::before,
        .sq-corner::after {
          content: '';
          position: absolute;
          width: 14px;
          height: 14px;
          border-color: var(--accent-line);
          opacity: 0.9;
        }

        .sq-corner::before {
          top: -1px;
          left: -1px;
          border-top: 1.5px solid;
          border-left: 1.5px solid;
        }

        .sq-corner::after {
          bottom: -1px;
          right: -1px;
          border-bottom: 1.5px solid;
          border-right: 1.5px solid;
        }

        @keyframes sq-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sq-spin-rev {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .sq-orbit-outer {
          animation: sq-spin 34s linear infinite;
          transform-origin: 200px 170px;
        }

        .sq-orbit-inner {
          animation: sq-spin-rev 22s linear infinite;
          transform-origin: 200px 170px;
        }

        @keyframes sq-hero-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sq-hero-in {
          animation: sq-hero-in 640ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes sq-scan-move {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          8% {
            opacity: 0.5;
          }
          92% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(248px);
            opacity: 0;
          }
        }

        .sq-scan {
          transform-box: fill-box;
          animation: sq-scan-move 4.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .sq-orbit-outer,
          .sq-orbit-inner,
          .sq-hero-in,
          .sq-scan {
            animation: none;
          }
        }

        .sq-btn-primary {
          background: var(--ink);
          color: var(--bg);
        }

        .sq-btn-primary:hover {
          background: var(--accent);
          color: #ffffff;
        }

        .sq-row:hover {
          background: rgba(148, 163, 184, 0.035);
        }

        .sq-team-card:hover {
          border-color: var(--accent-line);
          background: var(--panel-soft);
        }

        @media (max-width: 640px) {
          .sq-about {
            background-size: 22px 22px;
          }
        }
      `}</style>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">

        {/* ============ HERO ============ */}
        <section className="pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="sq-hero-in grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">

            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
                />
                <span className="sq-mono text-xs" style={{ color: 'var(--ink-dim)' }}>
                  An AetherVision platform
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-semibold leading-[1.08]"
                style={{ letterSpacing: '-0.02em', color: 'var(--ink)' }}
              >
                Ask your satellite imagery a question, in plain language.
              </h1>

              <p className="text-base leading-relaxed max-w-md" style={{ color: 'var(--ink-dim)' }}>
                SatQuery AI turns free-form queries into specialized remote-sensing
                workflows — reading optical, multispectral, and SAR imagery so you
                don't have to touch a GIS suite to get an answer.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onNavigateToAnalyze}
                  className="sq-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer"
                >
                  Launch SatQuery
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#research"
                  className="sq-mono inline-flex items-center gap-2 px-5 py-2.5 rounded text-xs border transition-colors"
                  style={{ borderColor: 'var(--line-strong)', color: 'var(--ink-dim)' }}
                >
                  See the research
                </a>
              </div>
            </div>

            {/* Scene grounding visual */}
            <div className="lg:col-span-5">
              <div
                className="sq-corner relative rounded-md border p-4 sm:p-6"
                style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}
              >
                <svg
                  viewBox="0 0 400 340"
                  className="w-full h-auto"
                  role="img"
                  aria-label="SatQuery AI grounding a query to a region on a satellite scene"
                >
                  <defs>
                    <linearGradient id="sq-tile-fade" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--ink-faint)" stopOpacity="0.10" />
                      <stop offset="100%" stopColor="var(--ink-faint)" stopOpacity="0.04" />
                    </linearGradient>
                  </defs>

                  {/* =========================================================
                      SCENE TILE — procedural parcel field, stands in for an
                      optical scene the model is reading
                      ========================================================= */}
                  <rect x="26" y="46" width="348" height="248" rx="3" fill="url(#sq-tile-fade)" />

                  <g stroke="var(--line-strong)" strokeWidth="0.75">
                    {PARCELS.map((p, i) => (
                      <rect
                        key={i}
                        x={p.x}
                        y={p.y}
                        width={p.w}
                        height={p.h}
                        fill={i % 3 === 0 ? 'var(--accent-soft)' : 'transparent'}
                        opacity={p.o}
                      />
                    ))}
                  </g>

                  {/* River / linear feature cutting across the tile */}
                  <path
                    d="M26 210 C 110 190, 180 230, 260 200 S 340 175, 374 190"
                    fill="none"
                    stroke="var(--ink-faint)"
                    strokeWidth="1.25"
                    opacity="0.35"
                  />

                  {/* =========================================================
                      CENTER-PIVOT FIELDS — the objects the example query
                      is asking about
                      ========================================================= */}
                  {PIVOTS.map((c, i) => (
                    <g key={i}>
                      <circle
                        cx={c.cx}
                        cy={c.cy}
                        r={c.r}
                        fill="var(--accent-soft)"
                        stroke="var(--accent-line)"
                        strokeWidth="1"
                      />
                      <circle cx={c.cx} cy={c.cy} r="1.6" fill="var(--accent)" />
                    </g>
                  ))}

                  {/* =========================================================
                      GROUNDING BOX — the model's answer, drawn on the scene
                      ========================================================= */}
                  <rect
                    x="176"
                    y="104"
                    width="146"
                    height="118"
                    rx="4"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {/* Corner ticks on the grounding box */}
                  <g stroke="var(--accent)" strokeWidth="1.5">
                    <path d="M176 116 V104 H188" fill="none" />
                    <path d="M310 104 H322 V116" fill="none" />
                    <path d="M322 210 V222 H310" fill="none" />
                    <path d="M188 222 H176 V210" fill="none" />
                  </g>

                  {/* Result tag anchored to the box */}
                  <g transform="translate(176, 84)">
                    <rect
                      x="0"
                      y="0"
                      width="88"
                      height="18"
                      rx="2"
                      fill="var(--accent)"
                    />
                    <text
                      x="8"
                      y="12.5"
                      fontSize="9.5"
                      className="sq-mono"
                      fill="var(--bg)"
                      letterSpacing="0.4"
                    >
                      14 FIELDS · 92%
                    </text>
                  </g>

                  {/* =========================================================
                      SCAN LINE — one continuous, deliberate motion
                      ========================================================= */}
                  <line
                    x1="26"
                    x2="374"
                    y1="46"
                    y2="46"
                    stroke="var(--accent)"
                    strokeWidth="1"
                    opacity="0.5"
                    className="sq-scan"
                  />

                  {/* =========================================================
                      TECHNICAL LABELS
                      ========================================================= */}
                  <g className="sq-mono">
                    <text x="26" y="34" fontSize="9" letterSpacing="1.2" fill="var(--ink-faint)">
                      SCENE TILE · 4.2 KM²
                    </text>
                    <text x="374" y="34" fontSize="9" letterSpacing="1" fill="var(--ink-faint)" textAnchor="end">
                      REGION GROUNDING
                    </text>
                  </g>

                  {/* =========================================================
                      CORNER REGISTRATION MARKS
                      ========================================================= */}
                  <g stroke="var(--accent-line)" strokeWidth="1" fill="none">
                    <path d="M14 24 V14 H24" />
                    <path d="M376 24 V14 H366" />
                    <path d="M14 316 V326 H24" />
                    <path d="M376 316 V326 H366" />
                  </g>
                </svg>

                {/* Live query preview */}
                <div
                  className="mt-4 pt-4 border-t flex items-center justify-between gap-3"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <p className="text-[12px] truncate" style={{ color: 'var(--ink-dim)' }}>
                    "How many center-pivot fields are visible?"
                  </p>
                  <div
                    className="shrink-0 flex items-center gap-1.5 sq-mono text-[11px] px-2 py-1 rounded"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    14 fields · 92%
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============ CONCEPT ============ */}
        <section className="py-14 sm:py-16 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
                What is SatQuery AI?
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--ink-dim)' }}>
                It's a domain-specialized vision-language platform that bridges
                complex satellite imagery with natural-language dialogue. Vision
                foundation models are paired with dedicated remote-sensing tools,
                so scientists, environmental analysts, and GIS practitioners can
                interrogate a single scene, verify a change over time, or fuse
                optical and radar data by asking a question instead of building a
                pipeline.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 sq-mono text-xs" style={{ color: 'var(--ink-faint)' }}>
                <span>Optical · Multispectral · SAR</span>
                <span>5 specialist workflows</span>
                <span>Natural-language interface</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CAPABILITIES ============ */}
        <section className="py-14 sm:py-16 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="mb-8 max-w-lg">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
              Six tools, routed automatically
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-dim)' }}>
              You ask in plain language. SatQuery classifies the intent and calls
              the matching tool below.
            </p>
          </div>

          <div
            className="sq-corner rounded-md border overflow-hidden"
            style={{ borderColor: 'var(--line)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {CAPABILITIES.map((cap, i) => {
                const Icon = cap.icon;
                const isLastCol = i % 2 === 1;
                const isLastRow = i >= CAPABILITIES.length - 2;
                return (
                  <div
                    key={cap.code}
                    className="sq-row group p-5 sm:p-6 flex gap-4 transition-colors"
                    style={{
                      borderRight: isLastCol ? 'none' : '1px solid var(--line)',
                      borderBottom: isLastRow ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    <div className="flex flex-col items-start gap-2 shrink-0 w-10">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                        style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-line)' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      </div>
                      <span className="sq-mono text-[10px]" style={{ color: 'var(--ink-faint)' }}>
                        {cap.code}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                        {cap.title}
                      </h3>
                      <p className="text-[13px] leading-relaxed mt-1" style={{ color: 'var(--ink-dim)' }}>
                        {cap.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ WHY IT MATTERS ============ */}
        <section className="py-14 sm:py-16 border-t" style={{ borderColor: 'var(--line)' }}>
          <h2 className="text-xl font-semibold mb-8" style={{ color: 'var(--ink)' }}>
            Why it matters
          </h2>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 rounded-md border overflow-hidden"
            style={{ borderColor: 'var(--line)' }}
          >
            <div
              className="p-6 sm:p-8"
              style={{
                borderRight: '1px solid var(--line)',
                background: 'var(--panel-soft)',
              }}
            >
              <span
                className="sq-mono text-[11px]"
                style={{ color: 'var(--ink-faint)' }}
              >
                Without SatQuery
              </span>

              <p
                className="text-sm leading-relaxed mt-3"
                style={{ color: 'var(--ink-dim)' }}
              >
                Earth observation work usually means a heavy desktop GIS suite,
                manual spectral band combinations, and file-format wrangling
                before you can answer even a simple question about a scene.
              </p>
            </div>
            <div className="p-6 sm:p-8 space-y-3" style={{ background: 'var(--panel)' }}>
              <span className="sq-mono text-[11px]" style={{ color: 'var(--accent)' }}>With SatQuery</span>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
                You ask a question in plain language. It's parsed, mapped to a
                calibrated vision-language tool, and answered with spatial
                grounding and a confidence score attached.
              </p>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="py-14 sm:py-16 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="mb-8 max-w-lg">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
              From imagery to answer
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-dim)' }}>
              No desktop GIS suite, no manual band math — three steps instead
              of a pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-md border overflow-hidden" style={{ borderColor: 'var(--line)', background: 'var(--line)' }}>
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative p-6 sm:p-7" style={{ background: 'var(--panel)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-line)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    </div>
                    <span className="sq-mono text-[11px]" style={{ color: 'var(--ink-faint)' }}>
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                    {step.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed mt-1.5" style={{ color: 'var(--ink-dim)' }}>
                    {step.body}
                  </p>

                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div
                      className="hidden sm:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full items-center justify-center z-10"
                      style={{ background: 'var(--bg)', border: '1px solid var(--line-strong)' }}
                    >
                      <ArrowRight className="w-3 h-3" style={{ color: 'var(--ink-faint)' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ RESEARCH FOUNDATION ============ */}
        <section id="research" className="py-14 sm:py-16 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="mb-6 max-w-lg">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
              Built on published benchmarks
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-dim)' }}>
              Each tool is grounded in a peer-reviewed remote-sensing dataset,
              not a general-purpose image model guessing at satellite context.
            </p>
          </div>

          <div className="rounded-md border overflow-hidden" style={{ borderColor: 'var(--line)' }}>
            {BENCHMARKS.map((b, i) => (
              <div
                key={b.name}
                className="sq-row flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-5 sm:px-6 py-4 transition-colors"
                style={{ borderBottom: i === BENCHMARKS.length - 1 ? 'none' : '1px solid var(--line)' }}
              >
                <span className="sq-mono text-sm w-32 shrink-0" style={{ color: 'var(--ink)' }}>{b.name}</span>
                <span className="sq-mono text-[11px] w-24 shrink-0" style={{ color: 'var(--accent)' }}>{b.tag}</span>
                <span className="text-[13px]" style={{ color: 'var(--ink-dim)' }}>{b.body}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ============ AETHERVISION ============ */}
        <section
          className="py-14 sm:py-16 border-t"
          style={{ borderColor: 'var(--line)' }}
        >
          <div
            className="rounded-md border overflow-hidden"
            style={{
              borderColor: 'var(--accent-line)',
              background:
                'linear-gradient(160deg, rgba(61,220,155,0.05), transparent 55%)',
            }}
          >
            {/* Team intro */}
            <div className="p-6 sm:p-9">
              <div className="flex items-center gap-2 mb-3">
                <Satellite
                  className="w-4 h-4"
                  style={{ color: 'var(--accent)' }}
                />
                <span
                  className="text-[11px] font-mono uppercase tracking-[0.16em]"
                  style={{ color: 'var(--accent)' }}
                >
                  Built by AetherVision
                </span>
              </div>

              <h2
                className="text-xl sm:text-2xl font-semibold tracking-tight"
                style={{ color: 'var(--ink)' }}
              >
                Turning Earth observation data into
                <span style={{ color: 'var(--accent)' }}>
                  {' '}accessible spatial intelligence.
                </span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
                <p
                  className="lg:col-span-2 text-sm leading-relaxed"
                  style={{ color: 'var(--ink-dim)' }}
                >
                  AetherVision is the team behind SatQuery AI. We are building a
                  natural-language interface for remote-sensing analysis, combining
                  vision-language models with specialized workflows to understand
                  single images, changes across time, and complementary information
                  from optical and SAR imagery.
                </p>

                {/* Focus areas */}
                <div className="grid grid-cols-2 gap-2 content-start">
                  {[
                    'Multimodal Understanding',
                    'Change Intelligence',
                    'Agentic Analysis',
                    'Evidence-Grounded Insights',
                  ].map((area) => (
                    <div
                      key={area}
                      className="px-3 py-2 rounded border text-[10px] leading-snug"
                      style={{
                        borderColor: 'var(--line-strong)',
                        color: 'var(--ink-dim)',
                        background: 'var(--panel)',
                      }}
                    >
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team */}
            <div
              className="border-t px-6 sm:px-9 py-6 sm:py-7"
              style={{ borderColor: 'var(--line)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span
                    className="text-[10px] font-mono uppercase tracking-[0.16em]"
                    style={{ color: 'var(--ink-faint)' }}
                  >
                    The Team
                  </span>

                  <h3
                    className="text-sm font-semibold mt-1"
                    style={{ color: 'var(--ink)' }}
                  >
                    AetherVision
                  </h3>
                </div>

                <span
                  className="text-[10px] font-mono"
                  style={{ color: 'var(--ink-faint)' }}
                >
                  SIH · SatQuery AI
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  {
                    name: 'Krishita Garg',
                    role: 'Full-stack Developer',
                    github: 'https://github.com/KrishitaGarg',
                  },
                  {
                    name: 'TEAM MEMBER 2',
                    role: 'Role / contribution',
                    github: '#',
                  },
                  {
                    name: 'TEAM MEMBER 3',
                    role: 'Role / contribution',
                    github: '#',
                  },
                  {
                    name: 'TEAM MEMBER 4',
                    role: 'Role / contribution',
                    github: '#',
                  },
                  {
                    name: 'TEAM MEMBER 5',
                    role: 'Role / contribution',
                    github: '#',
                  },
                  {
                    name: 'TEAM MEMBER 6',
                    role: 'Role / contribution',
                    github: '#',
                  },
                ].map((member) => (
                  <div
                    key={member.name}
                    className="sq-team-card group flex items-center justify-between gap-3 rounded border px-3 py-3 transition-colors"
                    style={{
                      borderColor: 'var(--line)',
                      background: 'var(--panel)',
                    }}
                  >
                    <div className="min-w-0">
                      <div
                        className="text-xs font-medium truncate"
                        style={{ color: 'var(--ink)' }}
                      >
                        {member.name}
                      </div>

                      <div
                        className="text-[10px] mt-0.5 truncate"
                        style={{ color: 'var(--ink-faint)' }}
                      >
                        {member.role}
                      </div>
                    </div>

                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on GitHub`}
                      className="shrink-0 text-[10px] font-mono transition-colors"
                      style={{ color: 'var(--ink-dim)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--ink-dim)';
                      }}
                    >
                      GitHub ↗
                    </a>
                  </div>
                ))}
              </div>

              <div
                className="mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ borderColor: 'var(--line)' }}
              >
                <p
                  className="text-[10px] leading-relaxed"
                  style={{ color: 'var(--ink-faint)' }}
                >
                  Building practical AI interfaces for understanding Earth
                  observation data.
                </p>

                <button
                  onClick={onNavigateToAnalyze}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded text-xs font-medium transition-colors"
                  style={{
                    background: 'var(--ink)',
                    color: 'var(--bg)',
                  }}
                >
                  Launch SatQuery
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="py-16 sm:py-24 border-t text-center" style={{ borderColor: 'var(--line)' }}>
          <h3 className="text-2xl sm:text-3xl font-semibold max-w-lg mx-auto" style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            Ready to query the imagery?
          </h3>
          <p className="text-sm mt-3 max-w-sm mx-auto" style={{ color: 'var(--ink-dim)' }}>
            Upload an optical or radar frame, or start from a preset scene.
          </p>
          <button
            onClick={onNavigateToAnalyze}
            className="sq-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium mt-7 transition-colors cursor-pointer"
          >
            Launch SatQuery
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

      </div>
    </div>
  );
};

export default AboutView;