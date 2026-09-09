import type { HireContent } from "@/lib/hire-content";

const nodeLayout: Record<string, { x: number; y: number }> = {
  cvdata: { x: 200, y: 150 },
  devprofile: { x: 320, y: 70 },
  "collab-finder": { x: 320, y: 240 },
  ensembly: { x: 80, y: 240 },
};

type HireSystemsGraphProps = {
  systems: HireContent["systems"];
};

export function HireSystemsGraph({ systems }: HireSystemsGraphProps) {
  return (
    <figure className="hire-phi__map" aria-labelledby="hire-systems-caption">
      <svg
        viewBox="0 0 400 320"
        className="hire-phi__map-svg"
        role="img"
        aria-labelledby="hire-systems-caption"
      >
        <title id="hire-systems-svg-title">
          How cvdata, devprofile, collab-finder, and ensembly connect
        </title>
        {systems.edges.map((edge) => {
          const from = nodeLayout[edge.from];
          const to = nodeLayout[edge.to];
          if (!from || !to) return null;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="hire-phi__map-edge" />
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 6}
                className="hire-phi__map-edge-label"
                textAnchor="middle"
              >
                {edge.label}
              </text>
            </g>
          );
        })}
        {systems.nodes.map((node) => {
          const pos = nodeLayout[node.id];
          if (!pos) return null;
          const isHub = node.id === "cvdata";
          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHub ? 28 : 22}
                className={`hire-phi__map-node${isHub ? " hire-phi__map-node--hub" : ""}`}
              />
              <text
                x={pos.x}
                y={pos.y + 4}
                className="hire-phi__map-node-label"
                textAnchor="middle"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption id="hire-systems-caption" className="hire-phi__map-caption">
        {systems.caption}
      </figcaption>
      <ul className="hire-phi__map-legend">
        {systems.nodes.map((node) => (
          <li key={node.id} className="hire-phi__legend-item">
            {node.href ? (
              <a href={node.href} className="hire-phi__legend-link">
                {node.label}
              </a>
            ) : (
              <span className="hire-phi__legend-name">{node.label}</span>
            )}
            <span className="hire-phi__legend-role">{node.role}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
