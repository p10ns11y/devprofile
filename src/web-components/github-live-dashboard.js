/**
 * GitHubLiveDashboard - True Native Web Component (2026)
 *
 * Usage:
 *   <github-live-dashboard username="p10ns11y"></github-live-dashboard>
 *
 * Attributes:
 *   - username: GitHub username (default: p10ns11y)
 *
 * Events:
 *   - refresh: Fired after successful data refresh
 *   - error: Fired on fetch error (detail: error message)
 *
 * Methods:
 *   - refresh(): Manually trigger data refresh
 *
 * Zero dependencies. Shadow DOM. Fully encapsulated.
 */

import * as dashboardCache from "../lib/github/dashboard-cache-client.js";

class GitHubLiveDashboard extends HTMLElement {
  static get observedAttributes() {
    return ["username", "layout"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._username = this.getAttribute("username") || "p10ns11y";
    this._user = null;
    this._repos = [];
    this._creativeProjects = [];
    this._loading = true;
    this._error = null;
    this._lastSync = "";
    this._isRefreshing = false;
    this._abortController = null;
    this._fetchGeneration = 0;
    this._uiBound = false;
    this._unlistenDashboard = null;
  }

  _applySnapshot(snapshot) {
    if (!snapshot) return;
    this._user = snapshot.user ?? null;
    this._repos = snapshot.repos ?? [];
    this._creativeProjects = snapshot.creativeProjects ?? [];
    this._lastSync = dashboardCache.formatSyncTime(snapshot.fetchedAt);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "username" && newValue !== oldValue) {
      this._username = newValue || "p10ns11y";
      this.fetchData();
    }
    if (name === "layout" && newValue !== oldValue) {
      this.render();
    }
  }

  syncSiteTheme() {
    const theme = document.documentElement.classList.contains("dim") ? "dim" : "light";
    if (this.getAttribute("data-theme") !== theme) {
      this.setAttribute("data-theme", theme);
    }
  }

  isCompactLayout() {
    if (this.getAttribute("layout") === "compact") return true;
    if (typeof window !== "undefined" && window.location.pathname.includes("/status/code/200")) {
      return true;
    }
    return false;
  }

  connectedCallback() {
    this.syncSiteTheme();
    this._themeObserver = new MutationObserver(() => this.syncSiteTheme());
    this._themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    this._bindUi();
    this.render();
    this._initDashboard();

    // Refresh shortcut only on the live dashboard page (avoid hijacking browser reload)
    this._keyHandler = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "r") return;
      if (!window.location.pathname.includes("/status/code/200")) return;
      e.preventDefault();
      this.refresh();
    };
    document.addEventListener("keydown", this._keyHandler);

    // Auto-refresh every 10 minutes when visible
    this._interval = setInterval(() => {
      if (!document.hidden && !this._loading && !this._isRefreshing) {
        this.fetchData(false);
      }
    }, dashboardCache.REFRESH_INTERVAL_MS);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._keyHandler);
    if (this._themeObserver) this._themeObserver.disconnect();
    if (this._interval) clearInterval(this._interval);
    if (this._abortController) this._abortController.abort();
    if (this._unlistenDashboard) this._unlistenDashboard();
  }

  async _initDashboard() {
    this._unlistenDashboard = dashboardCache.listenForDashboardUpdates(async (msg) => {
      if (msg.username && msg.username !== this._username) return;
      const snapshot = await dashboardCache.getSnapshot(this._username);
      if (!snapshot) return;
      this._applySnapshot(snapshot);
      this._loading = false;
      this._isRefreshing = false;
      this.render();
    });
    dashboardCache.registerDashboardBackgroundSync(this._username).catch(() => {});
    this.fetchData();
  }

  get username() {
    return this._username;
  }

  set username(val) {
    this.setAttribute("username", val);
  }

  _bindUi() {
    if (this._uiBound || !this.shadowRoot) return;
    this._uiBound = true;
    this.shadowRoot.addEventListener("click", (e) => {
      const path = e.composedPath();
      const target = path[0];
      if (!(target instanceof Element)) return;
      if (target.id === "refresh-btn" || target.closest("#refresh-btn")) {
        e.preventDefault();
        this.refresh();
        return;
      }
      if (target.id === "retry-btn" || target.closest("#retry-btn")) {
        e.preventDefault();
        this.refresh();
      }
    });
  }

  // Public method
  refresh() {
    this.fetchData(true);
  }

  async fetchData(showRefreshing = false) {
    const generation = ++this._fetchGeneration;

    if (showRefreshing) {
      this._isRefreshing = true;
      this.render();
    }

    this._error = null;

    if (this._abortController) this._abortController.abort();
    this._abortController = new AbortController();

    const timeoutId = setTimeout(() => {
      if (this._abortController) this._abortController.abort();
    }, 15000);

    try {
      const result = await dashboardCache.loadDashboardData(this._username, {
        forceRefresh: showRefreshing,
        signal: this._abortController.signal,
        onCached: (cached) => {
          if (generation !== this._fetchGeneration) return;
          this._applySnapshot(cached);
          this._loading = false;
          this.render();
        },
      });

      if (generation !== this._fetchGeneration) return;

      this._applySnapshot(result);
      if (result.source === "cache-fallback" && result.error) {
        this._error = result.error;
      }

      this._loading = false;
      this._isRefreshing = false;
      this.render();

      this.dispatchEvent(
        new CustomEvent("refresh", {
          bubbles: true,
          detail: { user: this._user, repos: this._repos },
        })
      );
    } catch (err) {
      if (generation !== this._fetchGeneration) return;

      if (err.name !== "AbortError") {
        this._error = err.message || "Failed to load data";
        this._loading = false;
        this._isRefreshing = false;
        this.render();
        this.dispatchEvent(
          new CustomEvent("error", {
            bubbles: true,
            detail: this._error,
          })
        );
      }
    } finally {
      clearTimeout(timeoutId);
      if (generation === this._fetchGeneration) {
        this._isRefreshing = false;
      }
    }
  }

  timeAgo(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    const intervals = [
      [31536000, "y"],
      [2592000, "mo"],
      [86400, "d"],
      [3600, "h"],
      [60, "m"],
    ];

    for (const [secs, label] of intervals) {
      const interval = Math.floor(seconds / secs);
      if (interval >= 1) return `${interval}${label} ago`;
    }
    return "just now";
  }

  getLanguageColor(lang) {
    const colors = {
      TypeScript: "#3178c6",
      JavaScript: "#f1e05a",
      Shell: "#89e051",
      Rust: "#dea584",
      Python: "#3572A5",
      C: "#555555",
      TeX: "#3D6117",
      HTML: "#e34c26",
      CSS: "#563d7c",
    };
    return colors[lang] || "#64748b";
  }

  escapeHtml(str) {
    if (str == null) return "";
    return String(str).replace(
      /[<>&'"]/g,
      (c) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          "'": "&apos;",
          '"': "&quot;",
        })[c]
    );
  }

  renderTopicChips(topics) {
    if (!topics?.length) return "";
    const chips = topics
      .slice(0, 8)
      .map((topic) => `<span class="topic-chip">${this.escapeHtml(topic)}</span>`)
      .join("");
    return `<div class="topic-chips">${chips}</div>`;
  }

  renderRepoCard({
    href,
    name,
    description,
    language,
    stars,
    time,
    topics = [],
    badgeHtml = "",
    ownerLogin = null,
  }) {
    const showOwner = ownerLogin && ownerLogin.toLowerCase() !== this._username.toLowerCase();
    const ownerPrefix = showOwner
      ? `<span class="repo-owner">${this.escapeHtml(ownerLogin)}/</span>`
      : "";
    const langColor = this.getLanguageColor(language);
    const langStat = language
      ? `<span class="stat"><span class="language-dot" style="background:${langColor}"></span><span>${this.escapeHtml(language)}</span></span>`
      : "";
    const desc = description ? `<p class="repo-desc">${this.escapeHtml(description)}</p>` : "";
    const topicChips = this.renderTopicChips(topics);

    return `
      <div class="grid-item">
        <a href="${this.escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="repo-card">
          <div class="repo-card__head">
            <div class="repo-card__title-row">
              <span class="repo-name">${ownerPrefix}${this.escapeHtml(name)}</span>
              ${badgeHtml}
            </div>
            ${desc}
            ${topicChips}
          </div>
          <div class="repo-card__foot">
            <div class="repo-card__stats">
              ${langStat}
              <span class="stat stat-stars">★ <span>${stars ?? 0}</span></span>
            </div>
            <div class="repo-card__time">
              <span class="time-label">pushed</span>
              <span class="time-value">${time}</span>
            </div>
          </div>
        </a>
      </div>
    `;
  }

  render() {
    this.syncSiteTheme();
    const shadow = this.shadowRoot;
    const recentlyPushed = [...this._repos]
      .filter((r) => !r.fork && !r.private)
      .sort(
        (a, b) =>
          new Date(b.pushed_at || b.updated_at || 0) - new Date(a.pushed_at || a.updated_at || 0)
      )
      .slice(0, 8);

    const creativeProjects = this._creativeProjects;
    const compact = this.isCompactLayout();
    const refreshLabel = this._isRefreshing ? "Syncing…" : "Refresh";

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          color: var(--gh-text);
          background: transparent;
        }

        :host,
        :host([data-theme="light"]) {
          color-scheme: light;
          --gh-text: #1a1a1a;
          --gh-muted: #5c5c5c;
          --gh-border: #e0e0e0;
          --gh-card: #ffffff;
          --gh-card-hover: #fafafa;
          --gh-accent: #c2410c;
          --gh-accent-text: #ffffff;
          --gh-accent-soft: rgba(194, 65, 12, 0.12);
          --gh-star: #9a6700;
          --gh-divider: #ebebeb;
          --gh-pill: #f5f5f5;
          --gh-success: #15803d;
          --gh-panel: #fafafa;
        }

        :host([data-theme="dim"]) {
          color-scheme: dark;
          --gh-text: #e8e8e8;
          --gh-muted: #a3a3a3;
          --gh-border: #404040;
          --gh-card: #2a2a2a;
          --gh-card-hover: #333333;
          --gh-accent: #ea580c;
          --gh-accent-text: #1a1a1a;
          --gh-accent-soft: rgba(234, 88, 12, 0.2);
          --gh-star: #fbbf24;
          --gh-divider: #3a3a3a;
          --gh-pill: #333333;
          --gh-success: #4ade80;
          --gh-panel: #242424;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: ${compact ? "0" : "1.5rem 0 2rem"};
        }

        .toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          padding: 0.75rem 1rem;
          background: var(--gh-panel);
          border: 1px solid var(--gh-border);
          border-radius: 12px;
        }

        .sync-pill {
          font-family: ui-monospace, monospace;
          font-size: 0.72rem;
          color: var(--gh-muted);
          background: var(--gh-pill);
          border: 1px solid var(--gh-border);
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
        }

        .sync-time { color: var(--gh-success); font-weight: 600; }

        .toolbar-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        }

        .hint {
          font-size: 0.68rem;
          color: var(--gh-muted);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.45rem 1rem;
          border-radius: 9999px;
          font-size: 0.8125rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          border: 1px solid transparent;
          font-family: inherit;
        }

        .btn-ghost {
          color: var(--gh-text);
          background: transparent;
          border-color: var(--gh-border);
        }

        .btn-ghost:hover {
          border-color: var(--gh-accent);
          color: var(--gh-accent);
        }

        .btn-primary {
          color: var(--gh-accent-text);
          background: var(--gh-accent);
          border-color: var(--gh-accent);
        }

        .btn-primary:hover:not(:disabled) {
          filter: brightness(1.05);
        }

        .btn-primary:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .profile {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.25rem;
        }

        .profile__main {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          min-width: 0;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          border: 2px solid var(--gh-accent-soft);
          flex-shrink: 0;
        }

        .profile__name {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          margin: 0;
          color: var(--gh-text);
          line-height: 1.2;
        }

        .profile__user {
          font-size: 0.75rem;
          background: var(--gh-pill);
          border: 1px solid var(--gh-border);
          padding: 0.1rem 0.55rem;
          border-radius: 9999px;
          font-family: ui-monospace, monospace;
          color: var(--gh-muted);
        }

        .profile__bio {
          margin: 0.35rem 0 0;
          max-width: 420px;
          color: var(--gh-muted);
          font-size: 0.95rem;
          line-height: 1.45;
        }

        .profile__meta {
          margin-top: 0.75rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--gh-muted);
        }

        .profile__followers { color: var(--gh-success); }

        .nav {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.25rem;
          padding-bottom: 1.75rem;
          border-bottom: 1px solid var(--gh-border);
          margin-bottom: 1.75rem;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 2rem;
          font-size: 0.75rem;
          color: var(--gh-muted);
        }

        .loading-wrap {
          display: flex;
          justify-content: center;
          padding: 4rem 0;
          text-align: center;
          color: var(--gh-muted);
        }

        .error-panel {
          max-width: 420px;
          margin: 3rem auto;
          text-align: center;
          padding: 2rem;
          background: var(--gh-card);
          border-radius: 16px;
          border: 1px solid var(--gh-border);
          color: var(--gh-text);
        }

        .error-panel p { color: var(--gh-muted); font-size: 0.875rem; }

        .section-block {
          margin-bottom: 2.5rem;
        }

        .section-header {
          font-size: 1.35rem;
          font-weight: 600;
          letter-spacing: -0.03em;
          margin: 0;
          color: var(--gh-text);
        }

        .section-sub {
          font-size: 0.8rem;
          color: var(--gh-muted);
          margin: 0.15rem 0 0;
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 1rem;
        }

        .section-head__left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .section-icon {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1rem;
        }

        .section-icon--push { background: rgba(234, 179, 8, 0.12); }
        .section-icon--creative { background: rgba(139, 92, 246, 0.12); }

        .topic-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.55rem;
          min-height: 1.5rem;
        }

        .topic-chips:empty {
          display: none;
        }

        .topic-chip {
          display: inline-block;
          font-size: 0.62rem;
          font-weight: 500;
          line-height: 1.2;
          padding: 0.18rem 0.5rem;
          border-radius: 9999px;
          background: var(--gh-accent-soft);
          color: var(--gh-accent);
          border: 1px solid var(--gh-border);
          font-family: ui-monospace, monospace;
        }

        :host([data-theme="light"]) .topic-chip {
          background: #fff7ed;
          color: #c2410c;
          border-color: #fed7aa;
        }

        .count-pill {
          background: var(--gh-pill);
          border: 1px solid var(--gh-border);
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.68rem;
          font-family: ui-monospace, monospace;
          color: var(--gh-muted);
          white-space: nowrap;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          align-items: stretch;
        }

        @media (min-width: 480px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .grid-item {
          min-width: 0;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .grid-item > .repo-card {
          flex: 1 1 auto;
          height: 100%;
          min-height: 10.5rem;
        }

        .repo-card {
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          width: 100%;
          min-height: 10.5rem;
          padding: 1.15rem 1.25rem 1rem;
          background: var(--gh-card);
          border: 1px solid var(--gh-border);
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          box-sizing: border-box;
        }

        .repo-card:hover {
          border-color: var(--gh-accent);
          background: var(--gh-card-hover);
          box-shadow: 0 0 0 1px var(--gh-accent-soft), 0 12px 28px -8px rgba(0, 0, 0, 0.35);
        }

        .repo-card:focus-visible {
          outline: 2px solid var(--gh-accent);
          outline-offset: 2px;
        }

        .repo-card--unavailable {
          cursor: default;
          opacity: 0.85;
        }

        .repo-card--unavailable:hover {
          border-color: var(--gh-border);
          background: var(--gh-card);
          box-shadow: none;
        }

        .repo-card__head {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          min-width: 0;
          min-height: 5.5rem;
          padding-bottom: 0.85rem;
        }

        .repo-card__title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .repo-name {
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: -0.02em;
          color: var(--gh-text);
          line-height: 1.3;
          word-break: break-word;
        }

        .repo-owner {
          font-weight: 500;
          font-size: 0.75rem;
          color: var(--gh-muted);
          font-family: ui-monospace, monospace;
        }

        .repo-desc {
          margin: 0.45rem 0 0;
          font-size: 0.8125rem;
          line-height: 1.45;
          color: var(--gh-muted);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-height: calc(1.45em * 3);
        }

        .repo-card__foot {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--gh-divider);
          margin-top: auto;
          flex-shrink: 0;
        }

        .repo-card__stats {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.65rem 1rem;
        }

        .stat {
          font-size: 0.72rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--gh-muted);
        }

        .stat-stars { color: var(--gh-star); }

        .language-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .repo-card__time {
          text-align: right;
          font-family: ui-monospace, monospace;
          font-size: 0.68rem;
          flex-shrink: 0;
        }

        .time-label {
          display: block;
          color: var(--gh-muted);
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .time-value {
          display: block;
          color: var(--gh-text);
          margin-top: 0.1rem;
        }

        .nav {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.25rem;
          padding-bottom: 1.75rem;
          border-bottom: 1px solid var(--gh-border);
          margin-bottom: 1.75rem;
        }

        .badge {
          font-size: 0.62rem;
          padding: 0.15rem 0.55rem;
          border-radius: 9999px;
          font-weight: 600;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }

        .daily-badge {
          background: rgba(34, 197, 94, 0.12);
          color: var(--gh-success);
          border: 1px solid rgba(34, 197, 94, 0.28);
        }

        :host([data-theme="light"]) .daily-badge {
          background: #dcfce7;
          color: #166534;
          border-color: #bbf7d0;
        }

        .experiment-badge {
          background: rgba(168, 85, 247, 0.12);
          color: #a855f7;
          border: 1px solid rgba(168, 85, 247, 0.22);
        }

        :host([data-theme="light"]) .experiment-badge {
          background: #f3e8ff;
          color: #7e22ce;
          border-color: #e9d5ff;
        }

        .empty-state {
          text-align: center;
          padding: 2.5rem 1.5rem;
          background: var(--gh-card);
          border: 1px dashed var(--gh-border);
          border-radius: 14px;
          color: var(--gh-muted);
        }

        .skeleton {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background: linear-gradient(90deg, var(--gh-divider) 25%, var(--gh-border) 50%, var(--gh-divider) 75%);
          background-size: 200% 100%;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }

        .footer-quote {
          margin: 2.5rem auto 0;
          max-width: 36rem;
          text-align: center;
          font-size: 0.8rem;
          line-height: 1.5;
          color: var(--gh-muted);
          padding: 0.75rem 1.25rem;
          border: 1px solid var(--gh-border);
          border-radius: 9999px;
          background: var(--gh-pill);
        }
      </style>

      <div class="container">
        ${
          compact
            ? `
          <div class="toolbar">
            <div class="sync-pill">LAST SYNC: <span class="sync-time">${this._lastSync || "—"}</span></div>
            <div class="toolbar-actions">
              <span class="hint">Cmd/Ctrl + R</span>
              <a class="btn btn-ghost" href="https://github.com/${this.escapeHtml(this._username)}" target="_blank" rel="noopener noreferrer">GitHub</a>
              <button id="refresh-btn" type="button" class="btn btn-primary" ${this._isRefreshing ? 'disabled aria-busy="true"' : ""}>${refreshLabel}</button>
            </div>
          </div>
        `
            : `
          <div class="nav profile">
            <div class="profile__main">
              ${
                this._user
                  ? `
                <img class="avatar" src="${this.escapeHtml(this._user.avatar_url)}" alt="${this.escapeHtml(this._user.login)}">
              `
                  : `
                <div class="skeleton avatar"></div>
              `
              }
              <div>
                <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                  <h1 class="profile__name">${this._user ? this.escapeHtml(this._user.name || this._user.login) : "Loading…"}</h1>
                  <span class="profile__user">${this.escapeHtml(this._username)}</span>
                </div>
                <p class="profile__bio">${this._user ? this.escapeHtml(this._user.bio || "Builder of useful things") : ""}</p>
                <div class="profile__meta">
                  ${this._user?.location ? `<span>📍 ${this.escapeHtml(this._user.location)}</span>` : ""}
                  <span class="profile__followers">👥 ${this._user ? this._user.followers.toLocaleString() : "—"} followers</span>
                </div>
              </div>
            </div>
            <div class="toolbar-actions">
              <a class="btn btn-ghost" href="https://github.com/${this.escapeHtml(this._username)}" target="_blank" rel="noopener noreferrer">GitHub</a>
              <button id="refresh-btn" type="button" class="btn btn-primary" ${this._isRefreshing ? 'disabled aria-busy="true"' : ""}>${refreshLabel}</button>
            </div>
          </div>
          <div class="status-row">
            <div class="sync-pill">LAST SYNC: <span class="sync-time">${this._lastSync || "—"}</span></div>
            <span class="hint">Cmd/Ctrl + R · GitHub REST API</span>
          </div>
        `
        }

        ${
          this._loading
            ? `
          <div class="loading-wrap">
            <div>
              <div class="skeleton" style="width:48px;height:48px;border-radius:9999px;margin:0 auto;"></div>
              <p style="margin-top:1rem;">Fetching live data…</p>
            </div>
          </div>
        `
            : this._error
              ? `
          <div class="error-panel">
            <div style="font-size:2rem;margin-bottom:0.75rem;">⚠️</div>
            <h3 style="margin:0 0 0.5rem;">Failed to load dashboard</h3>
            <p>${this.escapeHtml(this._error)}</p>
            <button type="button" class="btn btn-primary" style="margin-top:1.25rem" id="retry-btn">Try again</button>
          </div>
        `
              : `
          <div>
            <section class="section-block">
              <div class="section-head">
                <div class="section-head__left">
                  <div class="section-icon section-icon--creative" aria-hidden="true">✦</div>
                  <div>
                    <h2 class="section-header">Creative Projects</h2>
                    <p class="section-sub">Creative, technically strong — topics from GitHub</p>
                  </div>
                </div>
                <span class="count-pill">${creativeProjects.length} curated</span>
              </div>

              <div class="grid">
                ${creativeProjects
                  .map((entry) => {
                    if (!entry.repo) {
                      const shortName = entry.fullName.split("/").pop() || entry.fullName;
                      return `
                        <div class="grid-item">
                          <div class="repo-card repo-card--unavailable">
                            <div class="repo-card__head">
                              <div class="repo-card__title-row">
                                <span class="repo-name">${this.escapeHtml(shortName)}</span>
                                <span class="badge experiment-badge">unavailable</span>
                              </div>
                              <p class="repo-desc">${this.escapeHtml(entry.fullName)} — private or not found via API.</p>
                            </div>
                          </div>
                        </div>
                      `;
                    }
                    const repo = entry.repo;
                    const ownerLogin = repo.owner?.login || entry.fullName.split("/")[0] || null;
                    return this.renderRepoCard({
                      href: repo.html_url,
                      name: repo.name,
                      description: repo.description,
                      language: repo.language,
                      stars: repo.stargazers_count,
                      time: this.timeAgo(repo.pushed_at || repo.updated_at),
                      topics: entry.topics,
                      ownerLogin,
                    });
                  })
                  .join("")}
              </div>
            </section>

            <section class="section-block">
              <div class="section-head">
                <div class="section-head__left">
                  <div class="section-icon section-icon--push" aria-hidden="true">⏱</div>
                  <div>
                    <h2 class="section-header">Recently Pushed</h2>
                    <p class="section-sub">Latest code changes (git pushes)</p>
                  </div>
                </div>
                <span class="count-pill">${recentlyPushed.length} repos</span>
              </div>

              <div class="grid">
                ${
                  recentlyPushed.length > 0
                    ? recentlyPushed
                        .map((repo) => {
                          const forkBadge = repo.fork
                            ? '<span class="badge experiment-badge">fork</span>'
                            : "";
                          return this.renderRepoCard({
                            href: repo.html_url,
                            name: repo.name,
                            description: repo.description,
                            language: repo.language,
                            stars: repo.stargazers_count,
                            time: this.timeAgo(repo.pushed_at || repo.updated_at),
                            badgeHtml: forkBadge,
                          });
                        })
                        .join("")
                    : '<div class="grid-item" style="flex: 1 1 100%; max-width: 100%;"><div class="empty-state">No recent pushes found.</div></div>'
                }
              </div>
            </section>
          </div>
        `
        }

        <p class="footer-quote">
          Most of what I build starts as a solution to my own daily annoyances — then gets polished and shared.
        </p>
      </div>
    `;

    this._bindUi();
  }
}

// Register the custom element
if (!customElements.get("github-live-dashboard")) {
  customElements.define("github-live-dashboard", GitHubLiveDashboard);
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = GitHubLiveDashboard;
}
