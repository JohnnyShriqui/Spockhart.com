/**
 * Every photo on the site. Files live in src/assets/photos/ (already cropped and
 * colour-graded to the site palette). To swap one, replace the file or point the
 * import at a new one. Alt text describes what is in the picture.
 *
 * Stock photos are from Pexels (free to use, no attribution required). They show
 * people at work, never anyone presented as a member of our team. Team portraits
 * are real photos only, added under `team` below.
 */
import type { ImageMetadata } from 'astro';

import homeTable from '../assets/photos/home-table.jpg';
import homeTalk from '../assets/photos/home-talk.jpg';
import approachBoard from '../assets/photos/approach-board.jpg';
import approachLaptop from '../assets/photos/approach-laptop.jpg';
import workSession from '../assets/photos/work-session.jpg';
import npMission from '../assets/photos/np-mission.jpg';
import contactCafe from '../assets/photos/contact-cafe.jpg';
import aboutWide from '../assets/photos/about-wide.jpg';
import aboutStory from '../assets/photos/about-story.jpg';
import aboutFloor from '../assets/photos/about-floor.jpg';
import aboutMap from '../assets/photos/about-map.jpg';
import aboutTraining from '../assets/photos/about-training.jpg';

export type PhotoSlot = { src?: ImageMetadata; alt: string; brief?: string; focus?: string };

export const photos = {
  homeTable: {
    src: homeTable,
    alt: 'A team working through a problem around a table, with sticky notes pinned to a board behind them',
    focus: '50% 45%',
  },
  homeTalk: { src: homeTalk, alt: 'Two colleagues in conversation across a desk', focus: '45% 50%' },
  approachBoard: {
    src: approachBoard,
    alt: 'Colleagues talking at a table while two others arrange sticky notes on a board',
  },
  approachLaptop: { src: approachLaptop, alt: 'Two people working through something together on one laptop' },
  workSession: {
    src: workSession,
    alt: 'A working session around a long table, with papers, laptops and coffee',
  },
  npMission: {
    src: npMission,
    alt: 'Volunteers handing out food and water to people in their community',
    focus: '50% 40%',
  },
  contactCafe: { src: contactCafe, alt: 'A relaxed conversation over coffee around a long table' },
} satisfies Record<string, PhotoSlot>;

export const aboutPhotos = {
  wide: { src: aboutWide, alt: 'A team leaning in over papers and laptops around a table' },
  story: { src: aboutStory, alt: 'Someone leading a session in front of a board of sticky notes', focus: '50% 30%' },
  floor: { src: aboutFloor, alt: 'A warehouse worker checking stock on a tablet' },
  map: { src: aboutMap, alt: 'A process sketched by hand in a notebook, next to a tablet' },
  training: { src: aboutTraining, alt: 'A small group gathered around one laptop' },
} satisfies Record<string, PhotoSlot>;

export type TeamMember = { name: string; role: string; line: string; photo: PhotoSlot };

/** The people you'll work with. Real portraits only. Names and lines to be confirmed. */
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
