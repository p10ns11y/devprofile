#!/usr/bin/env node
/**
 * Dense viewport sweep of the hire page. Read-only measurement.
 * Same 691-point grid as the production baseline, plus German and Finnish
 * compound stress. Writes a summary JSON for docs/unbreakable-layout/SWEEP.md.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { chromium } from "@playwright/test";

const ORIGIN = process.env.SWEEP_ORIGIN ?? "http://localhost:3000/";
const OUT = process.env.SWEEP_OUT ?? "docs/unbreakable-layout/sweep-latest.json";
const CHROME = process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable";

const LOCALE_STRESS = {
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

function measureHireLayout() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const doc = document.documentElement;
  const findings = [];

  const cls = (el) => {
    if (!el) return "";
    if (el.id) return `#${el.id}`;
    const raw = typeof el.className === "string" ? el.className.trim() : "";
    const c = raw.split(/\s+/).slice(0, 3).join(".");
    return `${(el.tagName || "?").toLowerCase()}${c ? `.${c}` : ""}`;
  };

  const matrix = (cs) => {
    try {
      return new DOMMatrixReadOnly(cs.transform);
    } catch {
      return { a: 1, d: 1, b: 0, c: 0 };
    }
  };

  const inspect = (el, role) => {
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
    let ancestorClip = null;
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
    const selfOverflowX = el.scrollWidth > el.clientWidth + 1;
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
  }

  const brand = document.querySelector(
    "header[data-lcv-machine='site-nav'] nav[aria-label='Primary'] > a"
  );
  if (brand) {
    const cs = getComputedStyle(brand);
    const ellipse =
      String(cs.textOverflow).includes("ellipsis") &&
      (cs.overflowX === "hidden" || cs.overflow === "hidden" || cs.overflowY === "hidden");
    const overflowing = brand.scrollWidth > brand.clientWidth + 1;
    const box = brand.getBoundingClientRect();
    const snippet = (brand.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
    if (ellipse && overflowing) {
      findings.push({ kind: "header-brand-truncate", target: cls(brand), detail: snippet });
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
    const overflowing = value.scrollWidth > value.clientWidth + 1 || box.right > vw + 1;
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
    .forEach((surface) => {
      const vis = getComputedStyle(surface);
      if (vis.display === "none" || vis.visibility === "hidden") return;
      if (surface.scrollWidth > surface.clientWidth + 1) {
        findings.push({
          kind: "atlas-pan",
          target: cls(surface),
          detail: `scrollWidth ${surface.scrollWidth} > clientWidth ${surface.clientWidth}`,
        });
      }
    });

  const landmark = Boolean(
    document.querySelector("main, [role='main']") && document.querySelector("h1")
  );
  if (!landmark) {
    findings.push({ kind: "landmark-missing", target: "document", detail: "no main or no h1" });
  }

  const seen = new Set();
  const unique = [];
  for (const finding of findings) {
    const key = `${finding.kind}|${finding.target}|${finding.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(finding);
  }

  return {
    inner: { w: vw, h: vh },
    mustShow: must.length,
    mustLabels: must.map((el) => (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40)),
    overflowX: doc.scrollWidth > doc.clientWidth + 1,
    findings: unique,
  };
}

function fillMustShowWithUnbroken(text) {
  const nodes = Array.from(document.querySelectorAll("[data-lcv='must-show']"));
  const backup = nodes.map((el) => el.textContent ?? "");
  for (const el of nodes) el.textContent = text;
  return backup;
}

function fillMustShowWithTexts(texts) {
  const nodes = Array.from(document.querySelectorAll("[data-lcv='must-show']"));
  const backup = nodes.map((el) => el.textContent ?? "");
  nodes.forEach((el, i) => {
    if (texts[i] != null) el.textContent = texts[i];
  });
  return backup;
}

function restoreMustShow(backup) {
  const nodes = Array.from(document.querySelectorAll("[data-lcv='must-show']"));
  nodes.forEach((el, i) => {
    if (backup[i] != null) el.textContent = backup[i];
  });
}

function devicePairs() {
  const pairs = [
    [280, 653, "small-android"],
    [320, 568, "iphone-se"],
    [360, 780, "android-nav"],
    [375, 667, "iphone-8"],
    [375, 812, "iphone-x"],
    [390, 844, "iphone-14"],
    [393, 852, "pixel-7"],
    [412, 915, "pixel-wide"],
    [428, 926, "iphone-14-max"],
    [440, 956, "android-large"],
    [540, 720, "surface-duo-pane"],
    [653, 841, "fold-cover"],
    [768, 1024, "ipad"],
    [820, 1180, "ipad-air"],
    [834, 1194, "ipad-pro-11"],
    [884, 1104, "fold-inner"],
    [1024, 1366, "ipad-pro-12"],
    [1280, 720, "laptop"],
    [1366, 768, "laptop-hd"],
    [1440, 900, "laptop-wxga"],
    [1512, 982, "macbook"],
    [1680, 1050, "display"],
    [1920, 1080, "fhd"],
    [2560, 1440, "qhd"],
    [3440, 1440, "ultrawide"],
    [3840, 2160, "uhd"],
  ];
  const out = [];
  const seen = new Set();
  for (const [w, h, name] of pairs) {
    for (const [ww, hh, tag] of [
      [w, h, h >= w ? `${name}/portrait` : `${name}/landscape`],
      [h, w, h >= w ? `${name}/landscape` : `${name}/portrait`],
    ]) {
      const key = `${ww}x${hh}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const ori = hh > ww ? "portrait" : hh < ww ? "landscape" : "square";
      out.push({ w: ww, h: hh, name: tag, ori, bucket: "device" });
    }
  }
  return out;
}

function namedLcv() {
  const named = [
    [375, 812],
    [768, 1024],
    [1280, 720],
  ];
  const out = [];
  for (const [w, h] of named) {
    out.push({
      w,
      h,
      name: `lcv-named/${w}x${h}`,
      ori: h >= w ? "portrait" : "landscape",
      bucket: "lcv-named",
    });
    out.push({
      w: h,
      h: w,
      name: `lcv-named-flipped/${h}x${w}`,
      ori: w >= h ? "portrait" : "landscape",
      bucket: "lcv-named-flipped",
    });
  }
  return out;
}

function denseGrid() {
  const widths = [];
  for (let w = 280; w <= 3840; w += 40) widths.push(w);
  const heights = [320, 375, 430, 568, 720, 812, 1080];
  const out = [];
  for (const h of heights) {
    for (const w of widths) {
      out.push({
        w,
        h,
        name: `grid/${w}x${h}`,
        ori: h >= w ? "portrait" : "landscape",
        bucket: "grid",
      });
    }
  }
  return out;
}

function uniqueViewports() {
  const items = [...namedLcv(), ...devicePairs(), ...denseGrid()];
  const seen = new Map();
  const out = [];
  for (const item of items) {
    const key = `${item.w}x${item.h}`;
    if (seen.has(key)) {
      const prev = seen.get(key);
      if (item.bucket.startsWith("lcv") && !prev.bucket.startsWith("lcv")) {
        Object.assign(prev, item);
      }
      continue;
    }
    seen.set(key, item);
    out.push(item);
  }
  return out;
}

async function main() {
  const viewports = uniqueViewports();
  const results = [];
  const started = Date.now();
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(ORIGIN, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForSelector("h1, [data-lcv='must-show']", { timeout: 20_000 });

  const sample = async (vp, extra = {}) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    );
    const measured = await page.evaluate(measureHireLayout);
    const rec = {
      ...vp,
      ...extra,
      findings: measured.findings,
      mustShow: measured.mustShow,
      mustLabels: measured.mustLabels,
      overflowX: measured.overflowX,
      fail: measured.findings.length > 0,
    };
    results.push(rec);
    return rec;
  };

  for (const vp of viewports) {
    await sample(vp);
  }

  const zoomTargets = [
    { w: 375, h: 812, name: "zoom200/375x812", ori: "portrait", bucket: "zoom200" },
    { w: 812, h: 375, name: "zoom200/812x375", ori: "landscape", bucket: "zoom200" },
    { w: 1280, h: 720, name: "zoom200/1280x720", ori: "landscape", bucket: "zoom200" },
    { w: 720, h: 1280, name: "zoom200/720x1280", ori: "portrait", bucket: "zoom200" },
    { w: 280, h: 653, name: "zoom200/280x653", ori: "portrait", bucket: "zoom200" },
    { w: 3840, h: 2160, name: "zoom200/3840x2160", ori: "landscape", bucket: "zoom200" },
  ];
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  for (const vp of zoomTargets) {
    await sample(vp, { zoom: 2 });
  }
  await page.evaluate(() => {
    document.documentElement.style.zoom = "";
  });

  const stressTargets = [
    { w: 280, h: 653, name: "stress/280x653", ori: "portrait", bucket: "long-text" },
    { w: 375, h: 812, name: "stress/375x812", ori: "portrait", bucket: "long-text" },
    { w: 812, h: 375, name: "stress/812x375", ori: "landscape", bucket: "long-text" },
    { w: 1280, h: 720, name: "stress/1280x720", ori: "landscape", bucket: "long-text" },
    { w: 653, h: 280, name: "stress/653x280", ori: "landscape", bucket: "long-text" },
    { w: 3840, h: 2160, name: "stress/3840x2160", ori: "landscape", bucket: "long-text" },
  ];
  const backup = await page.evaluate(fillMustShowWithUnbroken, "W".repeat(400));
  for (const vp of stressTargets) {
    await sample(vp, { stress: "400xW" });
  }
  await page.evaluate(restoreMustShow, backup);

  for (const [locale, texts] of Object.entries(LOCALE_STRESS)) {
    const localeBackup = await page.evaluate(fillMustShowWithTexts, texts);
    for (const vp of stressTargets) {
      await sample(
        { ...vp, name: `${locale}/${vp.name}`, bucket: `locale-${locale}` },
        { stress: locale }
      );
    }
    await page.evaluate(restoreMustShow, localeBackup);
  }

  await browser.close();

  const elapsed = Math.round(((Date.now() - started) / 1000) * 10) / 10;
  const fails = results.filter((r) => r.fail);
  const byKind = {};
  const examples = {};
  const byBucket = {};
  const bucketFail = {};
  for (const rec of results) {
    byBucket[rec.bucket] = (byBucket[rec.bucket] ?? 0) + 1;
    if (rec.fail) bucketFail[rec.bucket] = (bucketFail[rec.bucket] ?? 0) + 1;
    const kinds = new Set(rec.findings.map((finding) => finding.kind));
    for (const kind of kinds) {
      byKind[kind] = (byKind[kind] ?? 0) + 1;
      examples[kind] = examples[kind] ?? [];
      if (examples[kind].length < 8) {
        examples[kind].push({
          name: rec.name,
          w: rec.w,
          h: rec.h,
          ori: rec.ori,
          bucket: rec.bucket,
          zoom: rec.zoom,
          stress: rec.stress,
          detail: rec.findings.filter((finding) => finding.kind === kind).slice(0, 3),
        });
      }
    }
  }

  const named = results.filter((r) => r.bucket === "lcv-named" || r.bucket === "lcv-named-flipped");
  const core = results.filter((r) =>
    ["lcv-named", "lcv-named-flipped", "device", "grid", "zoom200", "long-text"].includes(r.bucket)
  );
  const summary = {
    origin: ORIGIN,
    elapsed_s: elapsed,
    samples: results.length,
    fails: fails.length,
    pass: results.length - fails.length,
    core691: {
      samples: core.length,
      fails: core.filter((r) => r.fail).length,
      pass: core.length - core.filter((r) => r.fail).length,
    },
    must_show_on_first: results[0]?.mustLabels ?? [],
    must_show_count: results[0]?.mustShow ?? 0,
    by_kind: byKind,
    by_bucket: Object.fromEntries(
      Object.keys(byBucket)
        .sort()
        .map((key) => [key, { n: byBucket[key], fail: bucketFail[key] ?? 0 }])
    ),
    examples,
    named_lcv: named.map((r) => ({
      name: r.name,
      w: r.w,
      h: r.h,
      fail: r.fail,
      findings: r.findings,
    })),
    failing_viewports: fails.map((r) => ({
      name: r.name,
      w: r.w,
      h: r.h,
      ori: r.ori,
      bucket: r.bucket,
      kinds: [...new Set(r.findings.map((finding) => finding.kind))].sort(),
    })),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(join(process.cwd(), OUT), `${JSON.stringify(summary, null, 2)}\n`);
  const preview = {
    origin: summary.origin,
    elapsed_s: summary.elapsed_s,
    samples: summary.samples,
    fails: summary.fails,
    pass: summary.pass,
    core691: summary.core691,
    must_show_on_first: summary.must_show_on_first,
    must_show_count: summary.must_show_count,
    by_kind: summary.by_kind,
    by_bucket: summary.by_bucket,
    named_lcv: summary.named_lcv,
  };
  console.log(JSON.stringify(preview, null, 2));
  console.log("wrote", OUT);
}

await main();
