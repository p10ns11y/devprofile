import {
  BUILDING_BLURB,
  BUILDING_CLUSTERS,
  BUILDING_FALLBACK_URL,
  BUILDING_LAYOUT,
  BUILDING_PRIVATE,
  BUILDING_SINGULARITY,
} from "@/data/building-landscape";
import { projectByKey } from "@/lib/homepage-from-cvdata";

function curvePath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx + 80} ${y1}, ${mx - 40} ${y2}, ${x2} ${y2}`;
}

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

type AtlasNode = {
  key: string;
  name: string;
  href?: string;
  detail: string;
  privateCooking: boolean;
  x: number;
  y: number;
};

function resolveProject(key: string) {
  const project = projectByKey(key);
  const href = project?.url ?? BUILDING_FALLBACK_URL[key];
  const detail = BUILDING_BLURB[key] ?? project?.description;
  const privateCooking = BUILDING_PRIVATE.has(key);
  return {
    key,
    name: project?.name ?? key,
    href: privateCooking ? undefined : href,
    detail,
    privateCooking,
  };
}

function layoutClusters() {
  const { labelX, nodeX, operatorX, row, groupGap, top } = BUILDING_LAYOUT;
  let y = top;
  const left = BUILDING_CLUSTERS.filter((cluster) => !("nearSink" in cluster && cluster.nearSink));
  const near = BUILDING_CLUSTERS.filter((cluster) => "nearSink" in cluster && cluster.nearSink);

  const leftGroups = left.map((cluster) => {
    const nodes: AtlasNode[] = cluster.keys.flatMap((key, index) => {
      const resolved = resolveProject(key);
      if (!resolved.detail) {
        return [];
      }
      if (!resolved.href && !resolved.privateCooking) {
        return [];
      }
      return [
        {
          key: resolved.key,
          name: resolved.name,
          href: resolved.href,
          detail: resolved.detail,
          privateCooking: resolved.privateCooking,
          x: nodeX,
          y: y + index * row,
        },
      ];
    });
    const firstY = nodes[0]?.y ?? y;
    const lastY = nodes.at(-1)?.y ?? y;
    const clusterY = (firstY + lastY) / 2;
    y = lastY + row + groupGap;
    return { cluster, nodes, labelX, clusterY };
  });

  const mapHeight = Math.max(y + 36, 520);
  const sinkY = mapHeight / 2;
  let operatorY = sinkY;

  const operatorGroups = near.map((cluster) => {
    const nodes: AtlasNode[] = cluster.keys.flatMap((key, index) => {
      const resolved = resolveProject(key);
      if (!resolved.detail) {
        return [];
      }
      if (!resolved.href && !resolved.privateCooking) {
        return [];
      }
      return [
        {
          key: resolved.key,
          name: resolved.name,
          href: resolved.href,
          detail: resolved.detail,
          privateCooking: resolved.privateCooking,
          x: operatorX,
          y: operatorY + index * row,
        },
      ];
    });
    const firstY = nodes[0]?.y ?? operatorY;
    const lastY = nodes.at(-1)?.y ?? operatorY;
    operatorY = lastY + row;
    return { cluster, nodes, labelX: operatorX - 140, clusterY: (firstY + lastY) / 2 };
  });

  return { groups: [...leftGroups, ...operatorGroups], height: mapHeight, sinkY };
}

function ProjectMark({
  node,
}: {
  node: {
    key: string;
    name: string;
    href?: string;
    x: number;
    y: number;
  };
}) {
  const mark = (
    <>
      <circle cx={node.x} cy={node.y} r="6" className="building-atlas__star" />
      <text x={node.x + 14} y={node.y + 4} className="building-atlas__label">
        {node.name}
      </text>
    </>
  );
  if (!node.href) {
    return <g key={node.key}>{mark}</g>;
  }
  return (
    <a key={node.key} href={node.href}>
      {mark}
    </a>
  );
}

export function LandscapeAtlas() {
  const { groups, height, sinkY } = layoutClusters();
  const nodes = groups.flatMap((group) => group.nodes);
  const sink = { x: BUILDING_LAYOUT.sinkX, y: sinkY };

  return (
    <figure className="building-atlas">
      <svg
        viewBox={`0 0 ${BUILDING_LAYOUT.width} ${height}`}
        preserveAspectRatio="xMinYMid meet"
        role="img"
        aria-labelledby="atlas-title atlas-desc"
        className="building-atlas__svg"
      >
        <title id="atlas-title">
          One operator loop drawn as a white hole. Infall on the left, light on the right.
        </title>
        <desc id="atlas-desc">
          Clusters on the left fall toward a dark throat. The operator loop is drawn as a white
          hole on the far side: light coming out, not a well swallowing the work.
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

        <rect width={BUILDING_LAYOUT.width} height={height} fill="var(--atlas-ground)" />

        {Array.from({ length: Math.ceil(height / 52) }, (_, i) => (
          <line
            key={`h-${i}`}
            x1="24"
            x2={BUILDING_LAYOUT.width - 24}
            y1={24 + i * 52}
            y2={24 + i * 52}
            className="building-atlas__grid"
          />
        ))}

        {nodes.map((node) => (
          <path
            key={`edge-${node.key}`}
            d={curvePath(node.x + 8, node.y, sink.x - 92, sink.y)}
            fill="none"
            stroke="url(#atlas-flow)"
            strokeWidth="1.4"
          />
        ))}

        {groups.map((group) => (
          <text
            key={group.cluster.id}
            x={group.labelX}
            y={group.clusterY + 4}
            className="building-atlas__cluster"
          >
            {group.cluster.title}
          </text>
        ))}

        {nodes.map((node) => (
          <ProjectMark key={node.key} node={node} />
        ))}

        <g transform={`translate(${sink.x}, ${sink.y})`}>
          <WhiteHole />
          <text className="building-atlas__sink-label" textAnchor="middle" y="58">
            {BUILDING_SINGULARITY.label}
          </text>
          <text className="building-atlas__sink-sub" textAnchor="middle" y="76">
            {BUILDING_SINGULARITY.sublabel}
          </text>
        </g>
      </svg>
      <figcaption className="building-atlas__caption">
        {BUILDING_SINGULARITY.line} Penrose white hole as the other face of a black hole. mesh is
        private cooking.
      </figcaption>
    </figure>
  );
}

export function BuildingSpacemap() {
  const rows = layoutClusters().groups.flatMap((group) =>
    group.nodes.map((node) => ({
      key: node.key,
      cluster: group.cluster.title,
      name: node.name,
      detail: node.detail,
      href: node.href,
    }))
  );

  return (
    <table className="building-spacemap">
      <caption className="building-spacemap__caption">Spacemap of public work</caption>
      <thead>
        <tr>
          <th scope="col">Project</th>
          <th scope="col">Cluster</th>
          <th scope="col">What it is</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <th scope="row">
              {row.href ? <a href={row.href}>{row.name}</a> : row.name}
            </th>
            <td>{row.cluster}</td>
            <td>{row.detail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
