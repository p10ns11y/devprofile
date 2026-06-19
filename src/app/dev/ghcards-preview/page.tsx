/**
 * Local preview for GitHub README SVG cards.
 * Open http://localhost:3000/dev/ghcards-preview while `pnpm dev` is running.
 * Markdown preview blocks localhost images; this page uses same-origin /api paths.
 */
export default function GhcardsPreviewPage() {
  const username = "p10ns11y";
  const cards = [
    {
      title: "Activity Overview",
      src: `/api/ghcards/activity-overview?username=${username}`,
    },
    {
      title: "Recently Pushed (10)",
      src: `/api/ghcards/recent-pushed?username=${username}&limit=10`,
    },
    {
      title: "Recent PRs",
      src: `/api/ghcards/recent-prs?username=${username}&limit=5`,
    },
  ];

  const readmeStacks = [
    { card: "recent-pushed", limit: 4, width: 680, rowHeight: 48, label: "Recently shipped" },
    { card: "recent-prs", limit: 5, width: 640, rowHeight: 52, label: "Recent PR activity" },
  ] as const;

  return (
    <main
      id="main"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>GitHub card preview</h1>
      <p style={{ color: "#656d76", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Same-origin embeds for local testing. Profile README on GitHub needs your deployed HTTPS
        URL, not localhost.
      </p>

      {readmeStacks.map((stack) => (
        <section key={stack.card} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
            {stack.card} — README stack ({stack.limit} rows, clickable)
          </h2>
          <div style={{ maxWidth: "100%" }}>
            <img
              src={`/api/ghcards/embed?card=${stack.card}&username=${username}&limit=${stack.limit}&part=header`}
              alt={`${stack.label} header`}
              width={stack.width}
              style={{ display: "block", maxWidth: "100%", height: "auto" }}
            />
            {Array.from({ length: stack.limit }, (_, index) => (
              <a
                key={`${stack.card}-${index}`}
                href={`/api/ghcards/go?card=${stack.card}&username=${username}&index=${index}`}
                style={{ display: "block" }}
              >
                <img
                  src={`/api/ghcards/embed?card=${stack.card}&username=${username}&part=row&index=${index}`}
                  alt={`${stack.label} row ${index + 1}`}
                  width={stack.width}
                  height={stack.rowHeight}
                  style={{ display: "block", maxWidth: "100%", height: "auto" }}
                />
              </a>
            ))}
            <img
              src={`/api/ghcards/embed?card=${stack.card}&username=${username}&limit=${stack.limit}&part=footer`}
              alt={`${stack.label} footer`}
              width={stack.width}
              style={{ display: "block", maxWidth: "100%", height: "auto" }}
            />
          </div>
          <code
            style={{
              display: "block",
              marginTop: "0.75rem",
              fontSize: "0.7rem",
              wordBreak: "break-all",
            }}
          >
            {`/api/ghcards/readme-html?card=${stack.card}&username=${username}&limit=${stack.limit}`}
          </code>
        </section>
      ))}

      {cards.map((item) => (
        <section key={item.src} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>{item.title}</h2>
          <img
            src={item.src}
            alt={item.title}
            style={{ display: "block", maxWidth: "100%", height: "auto" }}
          />
          <code
            style={{
              display: "block",
              marginTop: "0.5rem",
              fontSize: "0.7rem",
              wordBreak: "break-all",
            }}
          >
            {item.src}
          </code>
        </section>
      ))}
    </main>
  );
}
