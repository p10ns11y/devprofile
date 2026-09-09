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

const HUB: SystemNode = {
  id: "cvdata",
  label: "cvdata",
  role: "Single master record — site, PDFs, and apply packs read one file",
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
  projectNode("collab-finder", "Local Tauri apply cockpit — human promote before anything sticks"),
  projectNode("ensembly", "Operator kernel under Grok Bot and Grok Build — HITL gates, T1 ledger"),
  projectNode(
    "participatory-mesh",
    "CommandFabric on a Tailscale mesh — bots dispatch allowlisted verbs only"
  ),
];

export const hireSystemEdges: SystemEdge[] = [
  { from: "cvdata", to: "devprofile", label: "one source, no drift" },
  { from: "cvdata", to: "collab-finder", label: "role-fit packs" },
  { from: "ensembly", to: "collab-finder", label: "gates before promote" },
  { from: "ensembly", to: "devprofile", label: "agent skills + verify" },
  { from: "ensembly", to: "participatory-mesh", label: "authorize, then dispatch" },
];

export const hireSystemsCaption =
  "cvdata feeds the site and the apply cockpit. ensembly gates promote. participatory-mesh runs only the allowlist.";
