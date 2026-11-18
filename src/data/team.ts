/**
 * Spockhart's own people, for the Team page.
 *
 * `photo`: drop a portrait (at least 1000x1250, 4:5) in /public/team/ and set the path,
 * e.g. '/team/jonathan-shriqui.jpg'. Until then the page shows a frame with initials.
 */
export type Person = {
  name: string;
  role: string;
  photo?: string;
};

export const founder: Person = {
  name: 'Jonathan Shriqui',
  role: 'Founder',
  photo: '',
};
