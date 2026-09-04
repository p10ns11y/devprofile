import { ProjectWalkthroughMermaid } from "@/components/projects/project-walkthrough-mermaid";
import type { WalkthroughBlock } from "@/data/project-walkthroughs";

export function ProjectWalkthroughBlocks({ blocks }: { blocks: readonly WalkthroughBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "paragraph":
            return (
              <p key={key} className="projects-block-p">
                {block.text}
              </p>
            );
          case "bullets":
            return (
              <ul key={key} className="projects-bullets">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <aside key={key} className="projects-callout" role="note">
                <p>{block.text}</p>
              </aside>
            );
          case "flow":
            return (
              <ol key={key} className="projects-flow" aria-label="Flow">
                {block.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            );
          case "mermaid":
            return <ProjectWalkthroughMermaid key={key} code={block.code} />;
          default: {
            const _exhaustive: never = block;
            return _exhaustive;
          }
        }
      })}
    </>
  );
}
