import Link from "next/link";
import { LandscapeAtlas } from "@/components/building/landscape-atlas";
import type { HireContent } from "@/lib/hire-content";
import { lcvPreview } from "@/lib/hire-lcv";
import type { SystemNode } from "@/lib/hire-systems";
import "@/styles/building.css";

type HireSystemsGraphProps = {
  systems: HireContent["systems"];
};

function NodeName({ node, className }: { node: SystemNode; className: string }) {
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
  const record = byId[systems.recordKey];
  const site = byId["devprofile"];
  const cockpit = byId["collab-finder"];

  return (
    <figure
      className="hire-phi__map"
      aria-labelledby="hire-systems-caption"
      aria-describedby="hire-atlas-desc"
      {...lcvPreview}
    >
      {record && site && cockpit ? (
        <p className="hire-phi__record">
          <NodeName node={record} className="hire-phi__atlas-link" /> feeds{" "}
          <NodeName node={site} className="hire-phi__atlas-link" /> (this site) and{" "}
          <NodeName node={cockpit} className="hire-phi__atlas-link" /> apply packs. One file, no
          drift.
        </p>
      ) : null}

      <p id="hire-atlas-desc" className="sr-only">
        Five cluster bands and four area docks feeding one operator loop, ensembly. cvdata is the
        record plane behind devprofile and collab-finder. participatory-mesh runs only the allowlist
        at the Systems dock.
      </p>

      <LandscapeAtlas embedded />

      <figcaption id="hire-systems-caption" className="hire-phi__map-caption">
        {systems.caption} Full landscape on{" "}
        <Link href="/building" className="hire-phi__map-caption-link">
          Building
        </Link>
        .
      </figcaption>
    </figure>
  );
}
