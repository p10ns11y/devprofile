import { readFileSync } from "node:fs";
import { join } from "node:path";

function inlinePublicSvg(src: string): string {
  const relative = src.replace(/^\//, "");
  const file = join(process.cwd(), "public", relative);
  return readFileSync(file, "utf8")
    .replace(/<\?xml[\s\S]*?\?>\s*/u, "")
    .replace(/<title[\s\S]*?<\/title>\s*/u, "")
    .replace(/<desc[\s\S]*?<\/desc>\s*/u, "")
    .replace(/\s+role="img"/u, "")
    .replace(/\s+aria-labelledby="title desc"/u, "");
}

export function FocusFigure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}) {
  if (!src.endsWith(".svg")) {
    return (
      <figure className="focus-figure">
        <div className="focus-figure__frame">
          <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
        </div>
        <figcaption>{caption}</figcaption>
      </figure>
    );
  }

  return (
    <figure className="focus-figure">
      <div
        className="focus-figure__frame"
        role="img"
        aria-label={alt}
        // Trusted static diagrams from /public — inlined so type is hinted at display size.
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static /public SVGs, not user content
        dangerouslySetInnerHTML={{ __html: inlinePublicSvg(src) }}
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
