/**
 * Very smooth colour blends for CSS gradients. A gradient with a few stops changes slope at each
 * stop, and the eye sees those changes as faint lines. Here the blend follows a smootherstep
 * curve (flat at both ends, no corners anywhere), is mixed in OKLab so the middle stays clean
 * rather than muddy, and is written out as many small stops.
 */
type RGB = [number, number, number];

const hexToRgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as RGB;
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function toOklab([r0, g0, b0]: RGB): RGB {
  const [r, g, b] = [toLinear(r0), toLinear(g0), toLinear(b0)];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: RGB): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb: RGB = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return rgb.map((c) => Math.min(1, Math.max(0, fromLinear(c)))) as RGB;
}

const smootherstep = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

/**
 * A gradient from `from` to `to`, holding each colour flat outside [start%, end%] and blending
 * smoothly between them.
 */
export function smoothFade(direction: string, from: string, to: string, start = 20, end = 80, steps = 32): string {
  const a = toOklab(hexToRgb(from));
  const b = toOklab(hexToRgb(to));
  const stops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const k = smootherstep(u);
    const c = fromOklab([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]);
    const [r, g, bl] = c.map((v) => Math.round(v * 255));
    stops.push(`rgb(${r} ${g} ${bl}) ${(start + (end - start) * u).toFixed(2)}%`);
  }
  return `linear-gradient(${direction}, ${stops.join(', ')})`;
}
