export type LayoutFinding = {
  kind: string;
  target: string;
  detail: string;
};

export type LayoutMeasure = {
  inner: { w: number; h: number };
  mustShow: number;
  findings: LayoutFinding[];
};

export type SweepViewport = {
  w: number;
  h: number;
  name: string;
  ori: "portrait" | "landscape" | "square";
};

export function curatedViewports(): SweepViewport[] {
  const pairs: Array<[number, number, string]> = [
    [375, 812, "lcv-phone"],
    [768, 1024, "lcv-tablet"],
    [1280, 720, "lcv-desktop"],
    [280, 653, "small-android"],
    [390, 844, "iphone"],
    [653, 841, "fold-cover"],
    [884, 1104, "fold-inner"],
    [768, 1024, "ipad"],
    [1512, 982, "laptop"],
    [3440, 1440, "ultrawide"],
    [3840, 2160, "uhd"],
  ];
  const seen = new Set<string>();
  const out: SweepViewport[] = [];
  for (const [w, h, name] of pairs) {
    for (const [ww, hh, tag] of [
      [w, h, h >= w ? `${name}/portrait` : `${name}/landscape`] as const,
      [h, w, h >= w ? `${name}/landscape` : `${name}/portrait`] as const,
    ]) {
      const key = `${ww}x${hh}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const ori = hh > ww ? "portrait" : hh < ww ? "landscape" : "square";
      out.push({ w: ww, h: hh, name: tag, ori });
    }
  }
  return out;
}

export function measureHireLayout(): LayoutMeasure {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const doc = document.documentElement;
  const findings: LayoutFinding[] = [];

  const cls = (el: Element | null) => {
    if (!el) return "";
    if (el.id) return `#${el.id}`;
    const raw =
      typeof (el as HTMLElement).className === "string" ? (el as HTMLElement).className.trim() : "";
    const c = raw.split(/\s+/).slice(0, 3).join(".");
    return `${(el.tagName || "?").toLowerCase()}${c ? `.${c}` : ""}`;
  };

  const matrix = (cs: CSSStyleDeclaration) => {
    try {
      return new DOMMatrixReadOnly(cs.transform);
    } catch {
      return { a: 1, d: 1, b: 0, c: 0 };
    }
  };

  const inspect = (el: Element, role: string) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const lineClamp =
      cs.webkitLineClamp && cs.webkitLineClamp !== "none" ? Number(cs.webkitLineClamp) : 0;
    const ellipse =
      lineClamp > 0 ||
      (String(cs.textOverflow).includes("ellipsis") &&
        (cs.overflowX === "hidden" || cs.overflow === "hidden" || cs.overflowY === "hidden"));
    const m = matrix(cs);
    const scaleDistort =
      Math.abs(Math.abs(m.a) - Math.abs(m.d)) > 0.02 ||
      (Math.abs(m.a) > 0.02 &&
        Math.abs(Math.abs(m.a) - 1) > 0.02 &&
        cs.transform !== "none" &&
        el.matches("h1, h2, p, blockquote, [data-lcv='must-show']"));
    let ancestorClip: { via: string; x: boolean; y: boolean } | null = null;
    let node = el.parentElement;
    while (node && node !== document.documentElement) {
      const s = getComputedStyle(node);
      const clipX =
        ["hidden", "clip"].includes(s.overflowX) || ["hidden", "clip"].includes(s.overflow);
      const clipY =
        ["hidden", "clip"].includes(s.overflowY) || ["hidden", "clip"].includes(s.overflow);
      if (clipX || clipY) {
        const cr = node.getBoundingClientRect();
        const hitX = clipX && (r.left < cr.left - 1 || r.right > cr.right + 1);
        const hitY = clipY && (r.top < cr.top - 1 || r.bottom > cr.bottom + 1);
        if (hitX || hitY) {
          ancestorClip = { via: cls(node), x: hitX, y: hitY };
          break;
        }
      }
      node = node.parentElement;
    }
    const outX = r.width > 1 && (r.left < -1 || r.right > vw + 1);
    const selfOverflowX = (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 1;
    const label = `${el.getAttribute("data-lcv") ? "[must-show] " : ""}${cls(el)}`;
    const snippet = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
    if (ellipse && role === "must-show") {
      findings.push({ kind: "ellipse-must-show", target: label, detail: snippet });
    }
    if (ancestorClip && role === "must-show") {
      findings.push({
        kind: "inner-clip-must-show",
        target: label,
        detail: `clipped by ${ancestorClip.via}${snippet ? ` — ${snippet}` : ""}`,
      });
    }
    if (outX && role === "must-show") {
      findings.push({
        kind: "viewport-clip-must-show",
        target: label,
        detail: snippet || "extends past viewport x",
      });
    }
    if (selfOverflowX && role === "must-show" && !ellipse) {
      findings.push({ kind: "text-overflow-must-show", target: label, detail: snippet });
    }
    if (scaleDistort) {
      findings.push({
        kind: "text-scale-distort",
        target: label,
        detail: `transform scale(${m.a.toFixed(3)},${m.d.toFixed(3)})`,
      });
    }
    return { el, r, role, label };
  };

  const must = Array.from(document.querySelectorAll("[data-lcv='must-show']"));
  const boxes = must.map((el) => inspect(el, "must-show"));

  if (doc.scrollWidth > doc.clientWidth + 1) {
    findings.push({
      kind: "document-overflow-x",
      target: "html",
      detail: `scrollWidth ${doc.scrollWidth} > clientWidth ${doc.clientWidth}`,
    });
  }

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i].r;
      const b = boxes[j].r;
      const overlapW = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const overlapH = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (overlapW > 2 && overlapH > 2) {
        const area = overlapW * overlapH;
        const minArea = Math.min(a.width * a.height, b.width * b.height);
        if (minArea > 0 && area / minArea > 0.08) {
          findings.push({
            kind: "overlap",
            target: `${boxes[i].label} × ${boxes[j].label}`,
            detail: `${Math.round(area)} px² shared`,
          });
        }
      }
    }
  }

  const hero = document.querySelector("#home, [data-section='home'], .hire-phi__hero");
  if (hero) {
    const kids = Array.from(
      hero.querySelectorAll(
        "h1, .hire-phi__name, .hire-phi__thesis, .hire-phi__role, .hire-phi__actions"
      )
    ).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    for (let i = 0; i < kids.length; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const earlier = kids[i].getBoundingClientRect();
        const later = kids[j].getBoundingClientRect();
        if (
          later.bottom < earlier.top - 8 &&
          later.left < earlier.right &&
          later.right > earlier.left
        ) {
          findings.push({
            kind: "reading-order",
            target: "hero",
            detail: `visual ${kids.map(cls).join(" → ")}`,
          });
        }
      }
    }
    hero.querySelectorAll("img").forEach((img) => {
      const image = img as HTMLImageElement;
      if (!image.naturalWidth || !image.naturalHeight) return;
      const r = image.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const nat = image.naturalWidth / image.naturalHeight;
      const drawn = r.width / r.height;
      if (Math.abs(nat - drawn) / nat > 0.04) {
        findings.push({
          kind: "media-aspect",
          target: cls(image),
          detail: `natural ${nat.toFixed(3)} vs drawn ${drawn.toFixed(3)}`,
        });
      }
    });
  }

  const brand = document.querySelector(
    "header[data-lcv-machine='site-nav'] nav[aria-label='Primary'] > a"
  );
  if (brand) {
    const cs = getComputedStyle(brand);
    const ellipse =
      String(cs.textOverflow).includes("ellipsis") &&
      (cs.overflowX === "hidden" || cs.overflow === "hidden" || cs.overflowY === "hidden");
    const overflowing = (brand as HTMLElement).scrollWidth > (brand as HTMLElement).clientWidth + 1;
    const box = brand.getBoundingClientRect();
    const snippet = (brand.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
    if (ellipse && overflowing) {
      findings.push({
        kind: "header-brand-truncate",
        target: cls(brand),
        detail: snippet,
      });
    }
    if (box.right > vw + 1 || overflowing) {
      findings.push({
        kind: "header-brand-overflow",
        target: cls(brand),
        detail: snippet || "brand extends past its box or the viewport",
      });
    }
  }

  document.querySelectorAll(".hire-phi__channel").forEach((channel) => {
    const value = channel.querySelector(".hire-phi__channel-value") ?? channel;
    const text = (value.textContent || "").trim();
    if (!text.includes("@") && !/mailto:/i.test(channel.getAttribute("href") || "")) {
      return;
    }
    const box = value.getBoundingClientRect();
    const overflowing =
      (value as HTMLElement).scrollWidth > (value as HTMLElement).clientWidth + 1 ||
      box.right > vw + 1;
    if (overflowing) {
      findings.push({
        kind: "email-channel-overflow",
        target: cls(value),
        detail: text.replace(/\s+/g, " ").slice(0, 80),
      });
    }
  });

  document
    .querySelectorAll(".building-atlas__viewport, .building-atlas__narrow")
    .forEach((node) => {
      const surface = node as HTMLElement;
      const vis = getComputedStyle(surface);
      if (vis.display === "none" || vis.visibility === "hidden") {
        return;
      }
      if (surface.scrollWidth > surface.clientWidth + 1) {
        findings.push({
          kind: "atlas-pan",
          target: cls(surface),
          detail: `scrollWidth ${surface.scrollWidth} > clientWidth ${surface.clientWidth}`,
        });
      }
    });

  const landmark =
    !!document.querySelector("main, [role='main']") && !!document.querySelector("h1");
  if (!landmark) {
    findings.push({ kind: "landmark-missing", target: "document", detail: "no main or no h1" });
  }

  const seen = new Set<string>();
  const unique: LayoutFinding[] = [];
  for (const f of findings) {
    const k = `${f.kind}|${f.target}|${f.detail}`;
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(f);
  }

  return {
    inner: { w: vw, h: vh },
    mustShow: must.length,
    findings: unique,
  };
}

export function fillMustShowWithUnbroken(text: string): string[] {
  const nodes = Array.from(document.querySelectorAll("[data-lcv='must-show']"));
  const backup = nodes.map((el) => el.textContent ?? "");
  for (const el of nodes) el.textContent = text;
  return backup;
}

export function restoreMustShow(backup: string[]): void {
  const nodes = Array.from(document.querySelectorAll("[data-lcv='must-show']"));
  nodes.forEach((el, i) => {
    if (backup[i] != null) el.textContent = backup[i];
  });
}

export const LOCALE_STRESS: Record<"de" | "fi", string[]> = {
  de: [
    "Wolf-Friedrich Weißkirchen-Großmann",
    "Knapp: Softwareentwicklungszusammenarbeit mit Geschmack, Urteilsvermögen und Verantwortung — kein weiteres React-Demonstrationsbeispiel.",
    "Kontaktaufnahme und Zusammenarbeitsschnittstellen",
  ],
  fi: [
    "Peramanathan Sathyamoorthy",
    "Harvinaista: kokonaisvaltainen ohjelmistokehitysyhteistyömahdollisuus maulla, harkinnalla ja vastuulla — ei jälleen yksi React-esittely.",
    "Yhteydenottolomakevaihtoehdot",
  ],
};

export function fillMustShowWithTexts(texts: string[]): string[] {
  const nodes = Array.from(document.querySelectorAll("[data-lcv='must-show']"));
  const backup = nodes.map((el) => el.textContent ?? "");
  nodes.forEach((el, i) => {
    if (texts[i] != null) {
      el.textContent = texts[i];
    }
  });
  return backup;
}
