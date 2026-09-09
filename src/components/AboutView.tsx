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

        @media (prefers-reduced-motion: reduce) {
          .sq-orbit-outer,
          .sq-orbit-inner {
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

        @media (max-width: 640px) {
          .sq-about {
            background-size: 22px 22px;
          }
        }
      `}</style>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">

        {/* ============ HERO ============ */}
        <section className="pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">

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

            {/* Telemetry / orbit visual */}
            <div className="lg:col-span-5">
              <div
                className="sq-corner relative rounded-md border p-4 sm:p-6"
                style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}
              >
                <svg
                  viewBox="0 0 400 340"
                  className="w-full h-auto"
                  role="img"
                  aria-label="SatQuery AI remote sensing visualization"
                >
                  <defs>
                    {/* Soft glow around the observation point */}
                    <radialGradient id="sq-earth-glow" cx="50%" cy="50%" r="50%">
                      <stop
                        offset="0%"
                        stopColor="var(--accent)"
                        stopOpacity="0.18"
                      />
                      <stop
                        offset="70%"
                        stopColor="var(--accent)"
                        stopOpacity="0.04"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--accent)"
                        stopOpacity="0"
                      />
                    </radialGradient>

                    {/* Subtle fade for orbit paths */}
                    <linearGradient id="sq-orbit-fade" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop
                        offset="0%"
                        stopColor="var(--ink-faint)"
                        stopOpacity="0.12"
                      />
                      <stop
                        offset="50%"
                        stopColor="var(--ink-dim)"
                        stopOpacity="0.32"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--ink-faint)"
                        stopOpacity="0.08"
                      />
                    </linearGradient>
                  </defs>

                  {/* =========================================================
                      ATMOSPHERIC GLOW
                      ========================================================= */}
                  <circle
                    cx="200"
                    cy="170"
                    r="88"
                    fill="url(#sq-earth-glow)"
                  />

                  {/* =========================================================
                      ORBITAL PATHS
                      ========================================================= */}

                  <g className="sq-orbit-outer">
                    <ellipse
                      cx="200"
                      cy="170"
                      rx="150"
                      ry="68"
                      fill="none"
                      stroke="url(#sq-orbit-fade)"
                      strokeWidth="1"
                      strokeDasharray="2 7"
                    />
                  </g>

                  <g className="sq-orbit-inner">
                    <ellipse
                      cx="200"
                      cy="170"
                      rx="92"
                      ry="112"
                      fill="none"
                      stroke="url(#sq-orbit-fade)"
                      strokeWidth="1"
                      strokeDasharray="2 7"
                    />
                  </g>

                  {/* =========================================================
                      CENTRAL EARTH / OBSERVATION NODE
                      ========================================================= */}

                  <circle
                    cx="200"
                    cy="170"
                    r="38"
                    fill="var(--accent-soft)"
                    stroke="var(--accent-line)"
                    strokeWidth="1"
                  />

                  <circle
                    cx="200"
                    cy="170"
                    r="25"
                    fill="none"
                    stroke="var(--accent-line)"
                    strokeWidth="0.75"
                    strokeDasharray="1 4"
                  />

                  <circle
                    cx="200"
                    cy="170"
                    r="3.5"
                    fill="var(--accent)"
                  />

                  {/* =========================================================
                      SATELLITE
                      ========================================================= */}

                  <g
                    className="sq-orbit-outer"
                    transform="translate(0, 0)"
                  >
                    <g transform="translate(310, 118)">
                      {/* Satellite body */}
                      <rect
                        x="-5"
                        y="-4"
                        width="14"
                        height="8"
                        rx="1"
                        fill="var(--panel)"
                        stroke="var(--ink-dim)"
                        strokeWidth="1"
                      />

                      {/* Solar panels */}
                      <rect
                        x="-13"
                        y="-2.5"
                        width="7"
                        height="5"
                        fill="var(--accent-soft)"
                        stroke="var(--ink-dim)"
                        strokeWidth="0.8"
                      />

                      <rect
                        x="9"
                        y="-2.5"
                        width="7"
                        height="5"
                        fill="var(--accent-soft)"
                        stroke="var(--ink-dim)"
                        strokeWidth="0.8"
                      />

                      {/* Satellite signal / sensor */}
                      <circle
                        cx="2"
                        cy="0"
                        r="1.5"
                        fill="var(--accent)"
                      />

                      <line
                        x1="2"
                        y1="4"
                        x2="2"
                        y2="8"
                        stroke="var(--ink-dim)"
                        strokeWidth="0.8"
                      />
                    </g>
                  </g>

                  {/* =========================================================
                      SMALL OBSERVATION MARKERS
                      ========================================================= */}

                  <g opacity="0.8">
                    <circle
                      cx="112"
                      cy="142"
                      r="2"
                      fill="var(--accent)"
                    />

                    <circle
                      cx="286"
                      cy="224"
                      r="1.8"
                      fill="var(--accent)"
                    />

                    <circle
                      cx="157"
                      cy="274"
                      r="1.5"
                      fill="var(--ink-dim)"
                    />
                  </g>

                  {/* =========================================================
                      TECHNICAL LABELS
                      ========================================================= */}

                  <g className="sq-mono">
                    <text
                      x="24"
                      y="34"
                      fontSize="9"
                      letterSpacing="1.5"
                      fill="var(--ink-faint)"
                    >
                      EARTH OBSERVATION
                    </text>

                    <text
                      x="24"
                      y="50"
                      fontSize="9"
                      letterSpacing="1"
                      fill="var(--ink-faint)"
                    >
                      MULTIMODAL ANALYSIS
                    </text>

                    <text
                      x="260"
                      y="292"
                      fontSize="9"
                      letterSpacing="1.2"
                      fill="var(--ink-faint)"
                    >
                      OPTICAL · SAR
                    </text>

                    <text
                      x="260"
                      y="308"
                      fontSize="9"
                      letterSpacing="1.2"
                      fill="var(--ink-faint)"
                    >
                      QUERY → INSIGHT
                    </text>
                  </g>

                  {/* =========================================================
                      CORNER REGISTRATION MARKS
                      ========================================================= */}

                  <g
                    stroke="var(--accent-line)"
                    strokeWidth="1"
                    fill="none"
                  >
                    {/* Top-left */}
                    <path d="M14 24 V14 H24" />

                    {/* Top-right */}
                    <path d="M376 24 V14 H366" />

                    {/* Bottom-left */}
                    <path d="M14 316 V326 H24" />

                    {/* Bottom-right */}
                    <path d="M376 316 V326 H366" />
                  </g>

                  {/* =========================================================
                      CENTER CROSSHAIR
                      ========================================================= */}

                  <g
                    stroke="var(--accent-line)"
                    strokeWidth="0.75"
                    opacity="0.55"
                  >
                    <line x1="194" y1="170" x2="187" y2="170" />
                    <line x1="206" y1="170" x2="213" y2="170" />
                    <line x1="200" y1="164" x2="200" y2="157" />
                    <line x1="200" y1="176" x2="200" y2="183" />
                  </g>
                </svg>
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
                    className="sq-row p-5 sm:p-6 flex gap-4 transition-colors"
                    style={{
                      borderRight: isLastCol ? 'none' : '1px solid var(--line)',
                      borderBottom: isLastRow ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    <div className="flex flex-col items-start gap-2 shrink-0 w-10">
                      <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 rounded-md border overflow-hidden" style={{ borderColor: 'var(--line)' }}>
            <div className="p-6 sm:p-8 space-y-3" style={{ borderRight: '1px solid var(--line)', background: 'var(--panel-soft)' }}>
              <span className="sq-mono text-[11px]" style={{ color: 'var(--ink-faint)' }}>Without SatQuery</span>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
                    className="group flex items-center justify-between gap-3 rounded border px-3 py-3 transition-colors"
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