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
      {cards.map((card) => (
        <section key={card.src} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>{card.title}</h2>
          <img
            src={card.src}
            alt={card.title}
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
            {card.src}
          </code>
        </section>
      ))}
    </main>
  );
}
