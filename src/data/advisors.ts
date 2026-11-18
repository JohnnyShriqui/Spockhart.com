/**
 * Advisory board, shown on the Team page.
 *
 * - `title` is the person's role, written without naming their organization.
 * - `focus` is what they advise Spockhart on.
 * - `confirmed`: true once they have agreed to be listed. Only confirmed advisors show on the
 *   live site; site.previewTeam shows the rest too, marked as awaiting confirmation.
 * - `photo`: drop a portrait (at least 800x1000) in /public/team/ and set the path,
 *   e.g. '/team/jane-doe.jpg'. Without one, a portrait plate with their initials is shown.
 * - `linkedin`: optional profile URL.
 *
 * Every title and focus line here is a draft. Each advisor approves their own line before
 * the page goes live.
 */
export type Advisor = {
  name: string;
  title: string;
  focus: string;
  confirmed: boolean;
  /** Where their experience comes from, shown as tags on their card */
  experience: string[];
  photo?: string;
  linkedin?: string;
};

export const advisors: Advisor[] = [
  {
    name: 'Brandon Milner',
    title: 'Chief Information Officer at one of Canada’s largest construction companies',
    focus: 'Technology, systems and scale',
    confirmed: true,
    experience: ['Technology', 'Construction', 'Real estate'],
  },
  {
    name: 'Howie Kroon',
    title: 'Business leader with deep ties across Canada’s nonprofit and public sectors',
    focus: 'Strategy and relationships',
    confirmed: true,
    experience: ['Business', 'Nonprofit sector'],
  },
  {
    name: 'Rick Ekstein',
    title: 'Former chief executive, and chairman of a hands-on charitable organization',
    focus: 'Growth and philanthropy',
    confirmed: false,
    experience: ['Business', 'Philanthropy'],
  },
  {
    name: 'Steve Merker',
    title: 'Vice President, Corporate and Community Partnerships, at one of Canada’s leading cancer foundations',
    focus: 'Fundraising and partnerships',
    confirmed: false,
    experience: ['Nonprofit sector', 'Fundraising'],
  },
];
