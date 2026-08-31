export function contrastRatio(foregroundCss: string, backgroundCss: string): number {
  const foreground = parseCssRgb(foregroundCss);
  const background = parseCssRgb(backgroundCss);
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

type Srgb = { red: number; green: number; blue: number };

function parseCssRgb(cssColor: string): Srgb {
  const match = cssColor.match(/rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/);
  if (!match) {
    throw new Error(`cannot parse CSS color: ${cssColor}`);
  }
  return {
    red: Number(match[1]),
    green: Number(match[2]),
    blue: Number(match[3]),
  };
}

function relativeLuminance({ red, green, blue }: Srgb): number {
  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
}
