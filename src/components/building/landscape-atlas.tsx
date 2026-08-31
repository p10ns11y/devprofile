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

const WHITE_HOLE_RAYS = [-42, -28, -14, 0, 14, 28, 42] as const;

function WhiteHole() {
  return (
    <g className="white-hole">
      <ellipse rx="150" ry="78" fill="url(#wh-bloom)" />
      <g transform="rotate(-16)">
        <ellipse rx="96" ry="30" fill="url(#wh-disk)" opacity="0.92" />
        <ellipse
          rx="96"
          ry="30"
          fill="none"
          stroke="url(#wh-rim)"
          strokeWidth="2.2"
        />
        <ellipse rx="44" ry="14" fill="url(#wh-throat)" />
        <g clipPath="url(#wh-left)">
          <ellipse rx="22" ry="22" fill="url(#wh-infall)" />
        </g>
        <g clipPath="url(#wh-right)">
          <ellipse rx="22" ry="22" fill="url(#wh-core)" filter="url(#wh-soft)" />
        </g>
        <circle r="7" fill="#fffef6" />
      </g>
      {WHITE_HOLE_RAYS.map((deg) => {
        const rad = ((deg - 8) * Math.PI) / 180;
        const x2 = Math.cos(rad) * 118;
        const y2 = Math.sin(rad) * 52;
        return (
          <line
            key={deg}
            x1={Math.cos(rad) * 28}
            y1={Math.sin(rad) * 12}
            x2={x2}
            y2={y2}
            className="white-hole__ray"
          />
        );
      })}
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
            <stop offset="0%" stopColor="var(--atlas-ink)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--atlas-accent)" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="wh-bloom" cx="62%" cy="48%" r="58%">
            <stop offset="0%" stopColor="#fff8ee" stopOpacity="0.95" />
            <stop offset="28%" stopColor="var(--atlas-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--atlas-accent)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wh-disk" cx="38%" cy="42%" r="70%">
            <stop offset="0%" stopColor="#1a1210" stopOpacity="0.92" />
            <stop offset="55%" stopColor="var(--atlas-accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1a1210" stopOpacity="0.15" />
          </radialGradient>
          <linearGradient id="wh-rim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a1a16" />
            <stop offset="45%" stopColor="var(--atlas-accent)" />
            <stop offset="100%" stopColor="#fff6ea" />
          </linearGradient>
          <linearGradient id="wh-throat" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d0b0a" />
            <stop offset="55%" stopColor="#3a221c" />
            <stop offset="100%" stopColor="#fffaf2" />
          </linearGradient>
          <radialGradient id="wh-infall" cx="30%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#050403" />
            <stop offset="100%" stopColor="#1a1210" />
          </radialGradient>
          <radialGradient id="wh-core" cx="70%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fff4e4" />
            <stop offset="100%" stopColor="var(--atlas-accent)" stopOpacity="0.2" />
          </radialGradient>
          <clipPath id="wh-left">
            <rect x="-80" y="-80" width="80" height="160" />
          </clipPath>
          <clipPath id="wh-right">
            <rect x="0" y="-80" width="80" height="160" />
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
