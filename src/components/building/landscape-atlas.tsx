import type { ReactNode } from "react";
import {
  ATLAS_EPITHET_DY,
  ATLAS_NAME_BASELINE,
  dockLabelX,
  layoutAtlas,
  type PlacedStar,
  starNameAnchorX,
  visibleProjects,
} from "@/components/building/atlas-layout";
import {
  BUILDING_AREAS,
  BUILDING_CLUSTERS,
  BUILDING_LOOP_STAGES,
  BUILDING_RELEASE_KINDS,
  BUILDING_SINGULARITY,
} from "@/data/building-landscape";

export type {
  AreaDock,
  AtlasScene,
  ClusterBand,
  Curve,
  GridSeg,
  InkRect,
  PlacedStar,
} from "@/components/building/atlas-layout";
export { layoutAtlas, visibleProjects } from "@/components/building/atlas-layout";

const WHITE_HOLE_RINGS = [
  { rx: 112, ry: 38, offset: 0 },
  { rx: 86, ry: 28, offset: 8 },
  { rx: 62, ry: 19, offset: 16 },
  { rx: 40, ry: 12, offset: 24 },
] as const;

function WhiteHole() {
  return (
    <g className="white-hole">
      <ellipse rx="168" ry="96" fill="url(#wh-halo)" />
      <g transform="rotate(-11)">
        {WHITE_HOLE_RINGS.map((ring) => (
          <g key={ring.rx} transform={`translate(${ring.offset} 0)`}>
            <ellipse rx={ring.rx} ry={ring.ry} fill="url(#wh-depth)" opacity="0.55" />
            <ellipse
              rx={ring.rx}
              ry={ring.ry}
              fill="none"
              stroke="url(#wh-caustic)"
              strokeWidth="1.15"
            />
          </g>
        ))}
        <g clipPath="url(#wh-left)">
          <ellipse rx="20" ry="20" fill="url(#wh-infall)" />
        </g>
        <g transform="translate(26 0)">
          <ellipse rx="22" ry="22" fill="url(#wh-core)" filter="url(#wh-soft)" />
          <circle r="6.5" fill="#f7fbff" />
        </g>
      </g>
      <path d="M 28 -8 C 72 -36, 118 -22, 148 -6" className="white-hole__ray" fill="none" />
      <path d="M 30 0 C 80 2, 124 4, 156 6" className="white-hole__ray" fill="none" />
      <path d="M 28 8 C 72 34, 118 24, 148 10" className="white-hole__ray" fill="none" />
      <path d="M 26 -18 C 58 -48, 96 -44, 128 -28" className="white-hole__ray" fill="none" />
      <path d="M 26 18 C 58 48, 96 44, 128 28" className="white-hole__ray" fill="none" />
    </g>
  );
}

type ReleaseKind = (typeof BUILDING_RELEASE_KINDS)[number]["id"];

const RELEASE_SHORT: Record<ReleaseKind, string> = {
  spark: "ideas",
  flame: "active builds",
  dust: "fragments",
  star: "shipped work",
};

function ReleaseGlyph({ kind }: { kind: ReleaseKind }) {
  if (kind === "spark") {
    return <path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" />;
  }
  if (kind === "flame") {
    return <path d="M 0 -9 C 6 -3, 6 4, 0 8 C -6 4, -6 -3, 0 -9 Z" />;
  }
  if (kind === "dust") {
    return (
      <>
        <circle cx="-5" cy="2" r="1.6" />
        <circle cx="1" cy="-4" r="1.3" />
        <circle cx="5" cy="3" r="1.8" />
        <circle cx="-1" cy="6" r="1.1" />
      </>
    );
  }
  return (
    <path d="M 0 -9 L 2.6 -3 L 9 -2.8 L 4 1.4 L 5.6 8 L 0 4.4 L -5.6 8 L -4 1.4 L -9 -2.8 L -2.6 -3 Z" />
  );
}

type LoopLayerProps = { scene: ReturnType<typeof layoutAtlas> };

function LoopLayer({ scene }: LoopLayerProps) {
  const { sink, width, height } = scene;
  const glyphX = sink.x + 150;
  const step = 64;
  const firstY = sink.y - (step * (BUILDING_RELEASE_KINDS.length - 1)) / 2;
  const topY = 26;
  const bottomY = height - 22;
  const feedback = `M ${glyphX} ${firstY - 16} C ${glyphX} ${topY}, ${glyphX} ${topY}, ${glyphX - 60} ${topY} L 60 ${topY} C 24 ${topY}, 24 ${topY}, 24 ${topY + 30}`;
  const decay = `M 24 ${height - 64} C 24 ${bottomY}, 24 ${bottomY}, 60 ${bottomY} L ${sink.x - 170} ${bottomY} C ${sink.x - 120} ${bottomY}, ${sink.x - 112} ${sink.y + 80}, ${sink.x - 70} ${sink.y + 22}`;
  return (
    <g className="building-loop">
      <path
        d={feedback}
        className="building-loop__feedback"
        fill="none"
        markerEnd="url(#loop-arrow)"
      />
      <text x={width / 2 - 120} y={topY + 16} className="building-loop__note">
        feedback: learnings, requirements, changes reshape the map
      </text>
      <path d={decay} className="building-loop__decay" fill="none" markerEnd="url(#loop-arrow)" />
      <text x={80} y={bottomY - 8} className="building-loop__note">
        decay: retired, archived, melted work drifts back as raw material
      </text>
      <text x={sink.x - 132} y={sink.y - 44} className="building-loop__face" textAnchor="end">
        intake
      </text>
      <text x={sink.x + 70} y={sink.y - 56} className="building-loop__face">
        release
      </text>
      {BUILDING_RELEASE_KINDS.map((kind, index) => {
        const y = firstY + index * step;
        return (
          <g key={kind.id} data-release={kind.id}>
            <path
              d={`M ${sink.x + 40} ${sink.y} C ${sink.x + 90} ${sink.y}, ${glyphX - 50} ${y}, ${glyphX - 14} ${y}`}
              className="building-loop__ray"
              fill="none"
            />
            <g
              transform={`translate(${glyphX} ${y})`}
              className={`building-loop__glyph building-loop__glyph--${kind.id}`}
            >
              <ReleaseGlyph kind={kind.id} />
            </g>
            <text x={glyphX + 16} y={y + 1} className="building-loop__kind">
              {kind.label}
            </text>
            <text x={glyphX + 16} y={y + 15} className="building-loop__kind-note">
              {RELEASE_SHORT[kind.id]}
            </text>
          </g>
        );
      })}
      {scene.trunks.map((trunk, index) => (
        <circle
          key={`seed-${trunk.key}`}
          r="3"
          className="building-loop__seed"
          style={{ offsetPath: `path("${trunk.d}")`, animationDelay: `${index * -1.1}s` }}
        />
      ))}
    </g>
  );
}

const COORDINATION_TARGETS = [
  { id: "apps", label: "apps" },
  { id: "harnesses", label: "harnesses" },
  { id: "bots", label: "SI bots" },
  { id: "mesh", label: "mesh of devices" },
  { id: "computer", label: "Bot computer" },
] as const;

const PORTAL_NAME_Y = 98;
const PORTAL_NOTE_Y = 113;
const SPINE_X = -30;
const SPINE_TOP_Y = 122;
const ROW_FIRST_Y = 142;
const ROW_STEP = 22;
const LABEL_X = -16;

function rowY(index: number): number {
  return ROW_FIRST_Y + index * ROW_STEP;
}

function OwnBots({ y }: { y: number }) {
  return (
    <g data-loop="own-bots">
      <path d={`M 34 ${y} L 74 ${y}`} className="building-loop__decide-line" fill="none" />
      {[46, 58, 70].map((cx) => (
        <circle key={cx} cx={cx} cy={y} r="2.6" className="building-loop__seed-static" />
      ))}
      <text x="82" y={y + 4} className="building-loop__kind-note">
        delegates to its own bots
      </text>
    </g>
  );
}

function BotComputer({ y }: { y: number }) {
  return (
    <g data-loop="bot-computer">
      <rect x="72" y={y - 8} width="58" height="16" rx="3" className="building-loop__machine" />
      {[78, 96, 114].map((vmX) => (
        <rect
          key={vmX}
          x={vmX}
          y={y - 4}
          width="12"
          height="8"
          rx="1.5"
          className="building-loop__vm"
        />
      ))}
      <text x="138" y={y + 4} className="building-loop__kind-note">
        VMs inside
      </text>
    </g>
  );
}

/** Grok Bot + Ensembly are the portal itself: pulse at the core, coordination under the throat. */
function PortalCore({ operator }: { operator: PlacedStar | undefined }) {
  const ensembly = <tspan className="building-loop__portal-ensembly">Ensembly</tspan>;
  return (
    <g className="building-loop__portal" data-loop="portal-core">
      <ellipse cy="150" rx="150" ry="110" fill="url(#wh-halo)" opacity="0.35" />
      <g transform="translate(25 -5)" className="building-loop__pulse">
        <circle r="12" className="building-loop__pulse-ring" />
        <circle r="12" className="building-loop__pulse-ring building-loop__pulse-ring--late" />
      </g>
      <text y={PORTAL_NAME_Y} className="building-loop__node-name" textAnchor="middle">
        Grok Bot + {operator?.href ? <a href={operator.href}>{ensembly}</a> : ensembly}
      </text>
      <text y={PORTAL_NOTE_Y} className="building-loop__kind-note" textAnchor="middle">
        memory, heartbeat, decisions
      </text>
      <path
        d={`M ${SPINE_X} ${SPINE_TOP_Y} L ${SPINE_X} ${rowY(COORDINATION_TARGETS.length - 1)}`}
        className="building-loop__decide-line"
        fill="none"
      />
      {COORDINATION_TARGETS.map((target, index) => {
        const y = rowY(index);
        return (
          <g key={target.id} data-coordinates={target.id}>
            <path
              d={`M ${SPINE_X} ${y} L ${LABEL_X - 6} ${y}`}
              className="building-loop__decide-line"
              fill="none"
              markerEnd="url(#loop-arrow)"
            />
            <text x={LABEL_X} y={y + 4} className="building-loop__kind">
              {target.label}
            </text>
            {target.id === "bots" ? <OwnBots y={y} /> : null}
            {target.id === "computer" ? <BotComputer y={y} /> : null}
          </g>
        );
      })}
    </g>
  );
}

function LoopStages() {
  return (
    <ol className="sr-only">
      {BUILDING_LOOP_STAGES.map((stage) => (
        <li key={stage.id}>
          {stage.label}: {stage.line}
        </li>
      ))}
    </ol>
  );
}

function LoopLegend() {
  return (
    <ul className="building-loop__legend" aria-label="Loop legend">
      {BUILDING_LOOP_STAGES.map((stage) => (
        <li key={stage.id} data-stage={stage.id}>
          <strong>{stage.label}</strong> {stage.line}
        </li>
      ))}
    </ul>
  );
}

function starKind(placedStar: PlacedStar): "operator" | "private" | "public" {
  if (placedStar.role === "operator") {
    return "operator";
  }
  if (placedStar.privateCooking) {
    return "private";
  }
  return "public";
}

function ProjectMark({ placedStar }: { placedStar: PlacedStar }) {
  const nameX = starNameAnchorX(placedStar);
  const mark = (
    <>
      <circle
        cx={placedStar.x}
        cy={placedStar.y}
        r={placedStar.r}
        className="building-atlas__star"
        data-star={starKind(placedStar)}
      />
      <text
        x={nameX}
        y={placedStar.y + ATLAS_NAME_BASELINE}
        className="building-atlas__label"
        textAnchor="end"
      >
        {placedStar.name}
      </text>
      {placedStar.epithet ? (
        <text
          x={nameX}
          y={placedStar.y + ATLAS_EPITHET_DY}
          className="building-atlas__epithet"
          textAnchor="end"
        >
          {placedStar.epithet}
        </text>
      ) : null}
    </>
  );
  if (!placedStar.href) {
    return <g>{mark}</g>;
  }
  return <a href={placedStar.href}>{mark}</a>;
}

type LandscapeAtlasProps = {
  keys?: readonly string[];
  embedded?: boolean;
  sinkExtra?: ReactNode;
  afterFigure?: ReactNode;
};

export function LandscapeAtlas({
  keys,
  embedded = false,
  sinkExtra,
  afterFigure,
}: LandscapeAtlasProps = {}) {
  const scene = layoutAtlas(keys);
  const label = `Life-cycle loop: ${scene.bands.length} cluster bands and ${scene.docks.length} area docks; fleet seeds carry work into one portal, which is Grok Bot and ensembly together; inside it ensembly keeps memory and heartbeat and is the decision model for repeatable coordination across apps, harnesses, SI bots, a mesh of devices and the Bot computer with its VMs, and Grok Bot, the SI platform, delegates to its own bots the same way; release returns sparks, flames, dust and stars; feedback and decay close the loop`;

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      preserveAspectRatio="xMinYMid meet"
      role="img"
      aria-label={label}
      className="building-atlas__svg"
    >
      <defs>
        <linearGradient id="atlas-flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--atlas-ink)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#6b7788" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="wh-halo" cx="70%" cy="48%" r="62%">
          <stop offset="0%" stopColor="#f4f8ff" stopOpacity="0.95" />
          <stop offset="32%" stopColor="#c5d4ea" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#c5d4ea" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wh-depth" cx="30%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#0b1018" stopOpacity="0.88" />
          <stop offset="70%" stopColor="#1c2838" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#dce6f4" stopOpacity="0.05" />
        </radialGradient>
        <linearGradient id="wh-caustic" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a2330" />
          <stop offset="55%" stopColor="#9eb4d0" />
          <stop offset="100%" stopColor="#f7fbff" />
        </linearGradient>
        <radialGradient id="wh-infall" cx="28%" cy="50%" r="72%">
          <stop offset="0%" stopColor="#06080c" />
          <stop offset="100%" stopColor="#1a2330" />
        </radialGradient>
        <radialGradient id="wh-core" cx="62%" cy="42%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e7f0ff" />
          <stop offset="100%" stopColor="#b8cbe4" stopOpacity="0.15" />
        </radialGradient>
        <clipPath id="wh-left">
          <rect x="-80" y="-80" width="80" height="160" />
        </clipPath>
        <marker
          id="loop-arrow"
          viewBox="0 0 8 8"
          refX="6"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 8 4 L 0 8 Z" className="building-loop__arrow" />
        </marker>
        <filter id="wh-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      <rect width={scene.width} height={scene.height} fill="var(--atlas-ground)" />

      {scene.bands.map((clusterBand) => (
        <rect
          key={`band-${clusterBand.cluster}`}
          className="building-atlas__band"
          x={0}
          y={clusterBand.y}
          width={scene.stars[0] ? scene.stars[0].x + scene.stars[0].r + 4 : 0}
          height={clusterBand.height}
        />
      ))}

      {scene.grid.map((seg) => (
        <line
          key={`grid-${seg.y1}`}
          x1={seg.x1}
          x2={seg.x2}
          y1={seg.y1}
          y2={seg.y2}
          className="building-atlas__grid"
        />
      ))}

      {scene.hops.map((hop) => (
        <path
          key={`hop-${hop.key}`}
          d={hop.d}
          className="building-atlas__hop"
          fill="none"
          stroke="url(#atlas-flow)"
          strokeWidth="1.25"
        />
      ))}

      {scene.trunks.map((trunk) => (
        <path
          key={`trunk-${trunk.key}`}
          d={trunk.d}
          className="building-atlas__trunk"
          fill="none"
          stroke="url(#atlas-flow)"
          strokeWidth="1.6"
        />
      ))}

      <LoopLayer scene={scene} />

      {scene.bands.map((clusterBand) => (
        <text
          key={clusterBand.cluster}
          x={clusterBand.titleX}
          y={clusterBand.titleY}
          className="building-atlas__cluster"
        >
          {clusterBand.title}
        </text>
      ))}

      {scene.stars.map((placedStar) => (
        <ProjectMark key={placedStar.key} placedStar={placedStar} />
      ))}

      {scene.docks.map((areaDock) => (
        <g key={areaDock.area} className="building-atlas__dock-group">
          <ellipse
            cx={areaDock.x}
            cy={areaDock.y}
            rx={areaDock.rx}
            ry={areaDock.ry}
            className="building-atlas__dock"
          />
          <text
            x={dockLabelX(areaDock)}
            y={areaDock.y + ATLAS_NAME_BASELINE}
            className="building-atlas__area"
          >
            {areaDock.title}
          </text>
        </g>
      ))}

      <g transform={`translate(${scene.sink.x}, ${scene.sink.y})`}>
        <WhiteHole />
        <text className="building-atlas__sink-label" textAnchor="middle" y="58">
          {BUILDING_SINGULARITY.label}
        </text>
        {sinkExtra}
        <PortalCore operator={scene.operator} />
      </g>
    </svg>
  );

  const viewport = (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: lets keyboard users scroll the map sideways on narrow screens
    <div className="building-atlas__viewport" role="region" aria-label="Space map" tabIndex={0}>
      {svg}
    </div>
  );

  if (embedded) {
    return (
      <div className="building-atlas building-atlas--embedded">
        {viewport}
        <LoopStages />
      </div>
    );
  }

  return (
    <figure className="building-atlas">
      {viewport}
      <figcaption className="building-atlas__caption">
        {BUILDING_SINGULARITY.line} A Penrose white hole is the other side of a black hole.
        participatory-mesh is public CommandFabric. Allowlisted dispatch, not a chat plane.
        <span className="building-atlas__portal-line">{BUILDING_SINGULARITY.womb}</span>
      </figcaption>
      <LoopLegend />
      {afterFigure}
    </figure>
  );
}

export function BuildingSpacemap() {
  const clusterTitleById = Object.fromEntries(
    BUILDING_CLUSTERS.map((clusterRecord) => [clusterRecord.id, clusterRecord.title])
  );
  const areaTitleById = Object.fromEntries(
    BUILDING_AREAS.map((areaRecord) => [areaRecord.id, areaRecord.title])
  );
  const rows = visibleProjects().map((placedStar) => ({
    key: placedStar.key,
    name: placedStar.name,
    href: placedStar.href,
    cluster: clusterTitleById[placedStar.cluster],
    area: areaTitleById[placedStar.area],
    detail: placedStar.detail,
    epithet: placedStar.epithet,
  }));

  return (
    <table className="building-spacemap">
      <caption className="building-spacemap__caption">Spacemap of public work</caption>
      <thead>
        <tr>
          <th scope="col">Project</th>
          <th scope="col">Cluster</th>
          <th scope="col">Area</th>
          <th scope="col">What it is</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <th scope="row">
              <span className="building-spacemap__label" aria-hidden="true">
                Project
              </span>
              {row.href ? <a href={row.href}>{row.name}</a> : row.name}
              {row.epithet ? (
                <small className="building-spacemap__epithet">{row.epithet}</small>
              ) : null}
            </th>
            <td>
              <span className="building-spacemap__label" aria-hidden="true">
                Cluster
              </span>
              {row.cluster}
            </td>
            <td>
              <span className="building-spacemap__label" aria-hidden="true">
                Area
              </span>
              {row.area}
            </td>
            <td>
              <span className="building-spacemap__label" aria-hidden="true">
                What it is
              </span>
              {row.detail}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
