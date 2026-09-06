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
          case "cards":
            return (
              <ul key={key} role="list" className="projects-cards">
                {block.items.map((item) => (
                  <li key={item.title}>
                    <article className="projects-surface-card" data-card="walkthrough">
                      <p className="projects-surface-card__kicker">{item.kicker}</p>
                      <h3 className="projects-surface-card__title">{item.title}</h3>
                      <p className="projects-surface-card__body">{item.body}</p>
                      {item.example ? (
                        <p className="projects-surface-card__example" data-example="">
                          <span className="projects-surface-card__example-label">Example</span>{" "}
                          {item.example}
                        </p>
                      ) : null}
                    </article>
                  </li>
                ))}
              </ul>
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
