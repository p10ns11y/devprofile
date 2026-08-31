import {
  ATLAS_EPITHET_DY,
  ATLAS_NAME_BASELINE,
  dockLabelX,
  layoutAtlas,
  type PlacedStar,
  starNameAnchorX,
  visibleProjects,
} from "@/components/building/atlas-layout";
import { WhiteHoleInvoker, WhiteHoleTip } from "@/components/building/white-hole-gloss";
import { BUILDING_AREAS, BUILDING_CLUSTERS, BUILDING_SINGULARITY } from "@/data/building-landscape";

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

export function LandscapeAtlas() {
  const scene = layoutAtlas();

  return (
    <figure className="building-atlas">
      <svg
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        preserveAspectRatio="xMinYMid meet"
        role="img"
        aria-labelledby="atlas-title atlas-desc"
        className="building-atlas__svg"
      >
        <title id="atlas-title">
          Five cluster bands and four area docks feeding one operator loop, drawn as a white hole.
        </title>
        <desc id="atlas-desc">
          Cluster bands on the left hold the work. Names sit left of stars. Hops run to four area
          docks — Career, Systems, Creative, Learning — then trunks to a Penrose white hole, the
          other side of a black hole. A black hole would capture; this hole emits. The operator
          sits beside it as the exit.
        </desc>
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
          <foreignObject
            className="building-atlas__hole-invoker-host"
            x="-168"
            y="-96"
            width="336"
            height="176"
          >
            <div xmlns="http://www.w3.org/1999/xhtml" className="building-atlas__hole-invoker-box">
              <WhiteHoleInvoker />
            </div>
          </foreignObject>
        </g>

        {scene.operator ? <ProjectMark placedStar={scene.operator} /> : null}
      </svg>
      <figcaption className="building-atlas__caption">
        {BUILDING_SINGULARITY.line} A Penrose white hole is the other side of a black hole. mesh is
        private cooking.
      </figcaption>
      <WhiteHoleTip />
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
              {row.href ? <a href={row.href}>{row.name}</a> : row.name}
              {row.epithet ? (
                <small className="building-spacemap__epithet">{row.epithet}</small>
              ) : null}
            </th>
            <td>{row.cluster}</td>
            <td>{row.area}</td>
            <td>{row.detail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
