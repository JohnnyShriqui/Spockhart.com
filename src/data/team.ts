/**
 * The people on the Team page: our founder first, then the advisory board (from advisors.ts,
 * confirmed advisors only).
 *
 * `photo`: a portrait at 4:5, at least 1200x1500, standing, waist up, against a plain light-grey
 * background, so every card matches. Put it in /public/team/ and set the path,
 * e.g. '/team/jonathan-shriqui.jpg'. Until then the card shows initials.
 * `linkedin`: their profile URL. The LinkedIn button only shows when it is set.
 */
import { advisors } from './advisors';
import { site } from '../config/site';

export type Person = {
  name: string;
  /** Their title at Spockhart */
  role: string;
  photo?: string;
  linkedin?: string;
};

export const founder: Person = {
  name: 'Jonathan Shriqui',
  role: 'Principal',
  photo: '',
  linkedin: 'https://www.linkedin.com/in/johnnyshriqui/',
};

export const team: Person[] = [
  founder,
  ...advisors
    .filter((a) => a.confirmed || site.previewTeam)
    .map((a) => ({ name: a.name, role: 'Advisor', photo: a.photo, linkedin: a.linkedin })),
];
