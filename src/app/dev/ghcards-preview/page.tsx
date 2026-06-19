/**
 * Local preview for GitHub README SVG cards.
 * Open http://localhost:3000/dev/ghcards-preview while `pnpm dev` is running.
 * Markdown preview blocks localhost images; this page uses same-origin /api paths.
 */
export default function GhcardsPreviewPage() {
  const username = "p10ns11y";
  const limit = 2;
  const card = "recent-pushed";
  const rowIndexes = Array.from({ length: limit }, (_, index) => index);
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

  const embed = (part: string, index?: number) => {
    const params = new URLSearchParams({
      card,
      username,
      limit: String(limit),
      part,
    });
    if (index !== undefined) params.set("index", String(index));
    return `/api/ghcards/embed?${params}`;
  };

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

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
          {card} — README stack ({limit} rows, clickable)
        </h2>
        <div style={{ maxWidth: "100%" }}>
          <img
            src={embed("header")}
            alt="Recently shipped header"
            width={680}
            style={{ display: "block", maxWidth: "100%", height: "auto" }}
          />
          {rowIndexes.map((index) => (
            <a
              key={index}
              href={`/api/ghcards/go?card=${card}&username=${username}&index=${index}`}
              style={{ display: "block" }}
            >
              <img
                src={embed("row", index)}
                alt={`Recent repo row ${index + 1}`}
                width={680}
                height={48}
                style={{ display: "block", maxWidth: "100%", height: "auto" }}
              />
            </a>
          ))}
          <img
            src={embed("footer")}
            alt="Recently shipped footer"
            width={680}
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
          {`/api/ghcards/readme-html?card=${card}&username=${username}&limit=${limit}`}
        </code>
      </section>

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
