/**
 * Photos for the About page. Drop the files in src/assets/photos/, import them
 * here, and set `src` on the matching slot. A slot without `src` shows a
 * placeholder describing the shot.
 */
import type { ImageMetadata } from 'astro';

export type PhotoSlot = { src?: ImageMetadata; alt: string; brief: string };

export const aboutPhotos: Record<string, PhotoSlot> = {
  wide: {
    alt: 'The Spockhart team working together around a table',
    brief: 'Wide shot of the team mid-conversation around a table: laptops, notebooks, coffee. Natural light, nobody posing.',
  },
  story: {
    alt: 'Working on a whiteboard',
    brief: 'One of us at a whiteboard sketching a process, caught from the side or from behind.',
  },
  floor: {
    alt: 'On a client floor with their team',
    brief: 'On site with a client team: a warehouse, office floor or production line, talking with the people who do the work.',
  },
  map: {
    alt: 'Mapping a process with sticky notes',
    brief: 'Close-up of hands moving sticky notes or marking up a printed process map.',
  },
  training: {
    alt: 'Walking a client through a new system',
    brief: 'Two people at one screen, one showing the other how something works.',
  },
};

export type TeamMember = { name: string; role: string; line: string; photo: PhotoSlot };

/** The people you'll work with. Names and lines to be confirmed. */
export const team: TeamMember[] = [
  {
    name: 'Name',
    role: 'Role',
    line: 'One line about them, ideally outside work.',
    photo: { alt: 'Portrait', brief: 'Relaxed portrait in natural light, plain background, shoulders up.' },
  },
  {
    name: 'Name',
    role: 'Role',
    line: 'One line about them, ideally outside work.',
    photo: { alt: 'Portrait', brief: 'Relaxed portrait in natural light, plain background, shoulders up.' },
  },
  {
    name: 'Name',
    role: 'Role',
    line: 'One line about them, ideally outside work.',
    photo: { alt: 'Portrait', brief: 'Relaxed portrait in natural light, plain background, shoulders up.' },
  },
];
