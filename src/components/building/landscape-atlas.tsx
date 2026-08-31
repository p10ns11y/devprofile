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
        <title id="atlas-title">Landscape of current public projects</title>
        <desc id="atlas-desc">
          Clusters on the left. Operator sits next to the sink. Lines run to one operator loop.
        </desc>
        <defs>
          <linearGradient id="atlas-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--atlas-ink)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--atlas-accent)" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="atlas-well" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--atlas-accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--atlas-accent)" stopOpacity="0" />
          </radialGradient>
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

        <circle cx={sink.x} cy={sink.y} r="88" fill="url(#atlas-well)" />

        {nodes.map((node) => (
          <path
            key={`edge-${node.key}`}
            d={curvePath(node.x + 8, node.y, sink.x - 78, sink.y)}
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
          <circle r="14" className="building-atlas__sink" />
          <text className="building-atlas__sink-label" textAnchor="middle" y="36">
            {BUILDING_SINGULARITY.label}
          </text>
        </g>
      </svg>
      <figcaption className="building-atlas__caption">
        {BUILDING_SINGULARITY.line} mesh is private cooking. Other names are public repos.
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
