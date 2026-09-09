import type { HireContent } from "@/lib/hire-content";
import type { SystemNode } from "@/lib/hire-systems";

type HireSystemsGraphProps = {
  systems: HireContent["systems"];
};

function SysNode({ node }: { node: SystemNode }) {
  const className = `hire-phi__sys-node${node.id === "cvdata" ? " hire-phi__sys-node--hub" : ""}`;
  if (node.href) {
    return (
      <a href={node.href} className={className}>
        {node.label}
      </a>
    );
  }
  return <span className={className}>{node.label}</span>;
}

export function HireSystemsGraph({ systems }: HireSystemsGraphProps) {
  const byId = Object.fromEntries(systems.nodes.map((node) => [node.id, node]));

  return (
    <figure className="hire-phi__map" aria-labelledby="hire-systems-caption">
      <ol className="hire-phi__sys-flows">
        {systems.edges.map((edge) => {
          const from = byId[edge.from];
          const to = byId[edge.to];
          if (!from || !to) return null;
          return (
            <li key={`${edge.from}-${edge.to}`} className="hire-phi__sys-flow">
              <SysNode node={from} />
              <span className="hire-phi__sys-edge">{edge.label}</span>
              <SysNode node={to} />
            </li>
          );
        })}
      </ol>
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
