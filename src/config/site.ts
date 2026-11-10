/**
 * Site-wide settings. Change copy-level facts here and every page updates.
 */
export const site = {
  name: 'Spockhart',
  /** The three-word line. Used in the hero, footer, metadata and OG image. */
  tagline: 'We optimize operations.',
  description:
    'Spockhart is a Toronto engineering firm. We embed with companies and nonprofits, find where operations lose time and money, and build the systems that fix it.',
  url: 'https://spockhart.com',
  email: 'john@spockhart.com',
  /** Shown on Contact and in the footer; calls go straight to John */
  phone: '(416) 606-7204',
  phoneHref: 'tel:+14166067204',
  city: 'Toronto',
  region: 'Ontario',
  country: 'Canada',
  /** Legal entity shown in the footer. Update once incorporated. */
  legalName: 'Spockhart',
  /** LinkedIn company page URL. Leave empty to hide the link. */
  linkedin: '',
  /**
   * Where the contact form posts. Works with Formspree, Basin, Getform and similar
   * services that accept JSON. Leave empty and the form falls back to composing an email.
   * Example: 'https://formspree.io/f/abcdwxyz'
   */
  formEndpoint: '',
  /** Show the advisory board on the About page. Turn on once every advisor has agreed to be listed. */
  showAdvisors: false,
  /** Engagement facts used across the site. */
  offer: {
    prototypeDays: 30,
    minimumMonths: 4,
    replyWithin: 'one business day',
  },
} as const;

export type NavItem = { label: string; href: string };

export const primaryNav: NavItem[] = [
  { label: 'Approach', href: '/approach/' },
  { label: 'Our work', href: '/work/' },
  { label: 'Nonprofits', href: '/nonprofits/' },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Firm',
    items: [
      { label: 'Approach', href: '/approach/' },
      { label: 'Calculator', href: '/#calculator' },
      { label: 'Our Work', href: '/work/' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'Nonprofits', href: '/nonprofits/' },
      { label: 'Contact', href: '/contact/' },
    ],
  },
  {
    heading: 'Trust',
    items: [
      { label: 'Security and data', href: '/security/' },
    ],
  },
];
