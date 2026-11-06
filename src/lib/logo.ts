/**
 * The Spockhart mark: a hexagon cut into two interlocking halves that form an S.
 * Traced from the original logo. ViewBox is -115 -122 230 244, centred on 0,0;
 * the lower half is the upper half rotated 180 degrees.
 */
type Pt = [number, number];

const upper: Pt[] = [
  [0, -118],
  [-111, -58],
  [-111, -16],
  [0, 44],
  [33, 26.2],
  [-79, -34.3],
  [0, -77],
  [111, -17],
  [111, -58],
];
const lower: Pt[] = upper.map(([x, y]) => [-x, -y]);

const toPath = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}Z`;

export const VIEWBOX = '-115 -122 230 244';
export const upperPath = toPath(upper);
export const lowerPath = toPath(lower);
/** Outer hexagon, for construction lines and frames. */
export const hexPath = toPath([
  [0, -118],
  [111, -58],
  [111, 58],
  [0, 118],
  [-111, 58],
  [-111, -58],
]);
