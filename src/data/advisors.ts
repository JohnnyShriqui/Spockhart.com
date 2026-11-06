/**
 * Advisory board, shown on /about/ when site.showAdvisors is true.
 *
 * - `title` is the person's role, written without naming their organization.
 * - `focus` is what they advise Spockhart on.
 * - `photo`: drop a square headshot (at least 600x600) in /public/advisors/
 *   and set the path, e.g. '/advisors/jane-doe.jpg'. Without one, a monogram is shown.
 * - `linkedin`: optional profile URL.
 */
export type Advisor = {
  name: string;
  title: string;
  focus: string;
  photo?: string;
  linkedin?: string;
};

/** Add each advisor once they have agreed to be listed, then set site.showAdvisors to true. */
export const advisors: Advisor[] = [];
