import {
  type AreaId,
  BUILDING_AREAS,
  BUILDING_CLUSTERS,
  BUILDING_PROJECTS,
} from "@/data/building-landscape";
import { projectByKey, projectRepoUrl } from "@/lib/homepage-from-cvdata";

/** Evidenced hire-surface graph — nodes must exist in cvdata (hub excepted). */
export type SystemNode = {
  id: string;
  label: string;
  role: string;
  href?: string;
};

export type SystemEdge = {
  from: string;
  to: string;
  label: string;
};

export type HireLandscapeRow = {
  key: string;
  clusterTitle: string;
  area: AreaId;
  areaTitle: string;
};

export type HireLandscapeDock = {
  area: AreaId;
  title: string;
  start: number;
  end: number;
};

const HUB: SystemNode = {
  id: "cvdata",
  label: "cvdata",
  role: "Single master record. Site, PDFs, and apply packs read one file",
};

function projectNode(key: string, role: string): SystemNode {
  const project = projectByKey(key);
  if (!project) {
    throw new Error(`hire-systems: ${key} is not in cvdata.projects`);
  }
  return {
    id: key,
    label: project.name,
    role,
    href: projectRepoUrl(key),
  };
}

export const hireSystemNodes: SystemNode[] = [
  HUB,
  projectNode("devprofile", "Public hire surface, grounded Q&A, CV as a build artifact"),
  projectNode("collab-finder", "Local Tauri apply cockpit. Human promote before anything sticks"),
  projectNode("ensembly", "Operator kernel under Grok Bot and Grok Build. HITL gates, T1 ledger"),
  projectNode(
    "participatory-mesh",
    "Elixir/OTP CommandFabric. Explicit allowlist on a distributed mesh. Transport is swappable."
  ),
];

/** Record plane + ensembly/mesh pairing. Landscape topology is hireLandscapeRows. */
export const hireSystemEdges: SystemEdge[] = [
  { from: "cvdata", to: "devprofile", label: "one source, no drift" },
  { from: "cvdata", to: "collab-finder", label: "role-fit packs" },
  { from: "ensembly", to: "participatory-mesh", label: "authorize, then dispatch" },
];

/**
 * Left-band stars on the hire cut of /building.
 * Operator (ensembly) sits at the sink, not in this list.
 * Hire-cut keys for LandscapeAtlas. Operator ensembly is included by layout.
 */
export const HIRE_LANDSCAPE_KEYS = ["collab-finder", "devprofile", "participatory-mesh"] as const;

export const hireOperatorKey = "ensembly";
export const hireRecordKey = "cvdata";

function clusterTitle(clusterId: string): string {
  const cluster = BUILDING_CLUSTERS.find((item) => item.id === clusterId);
  if (!cluster) {
    throw new Error(`hire-systems: unknown cluster ${clusterId}`);
  }
  return cluster.title;
}

function areaTitle(areaId: AreaId): string {
  const area = BUILDING_AREAS.find((item) => item.id === areaId);
  if (!area) {
    throw new Error(`hire-systems: unknown area ${areaId}`);
  }
  return area.title;
}

export function hireLandscapeRows(): HireLandscapeRow[] {
  return HIRE_LANDSCAPE_KEYS.map((key) => {
    const project = BUILDING_PROJECTS.find((item) => item.key === key);
    if (!project) {
      throw new Error(`hire-systems: ${key} is missing from BUILDING_PROJECTS`);
    }
    if (project.role === "operator") {
      throw new Error(`hire-systems: ${key} is the operator, not a left-band star`);
    }
    return {
      key,
      clusterTitle: clusterTitle(project.cluster),
      area: project.area,
      areaTitle: areaTitle(project.area),
    };
  });
}

export function hireLandscapeDocks(rows: HireLandscapeRow[]): HireLandscapeDock[] {
  const docks: HireLandscapeDock[] = [];
  rows.forEach((row, index) => {
    const last = docks.at(-1);
    if (last && last.area === row.area) {
      last.end = index + 2;
      return;
    }
    docks.push({
      area: row.area,
      title: row.areaTitle,
      start: index + 1,
      end: index + 2,
    });
  });
  return docks;
}

export const hireSystemsCaption =
  "ensembly sits at the operator loop. participatory-mesh runs only the allowlist.";
