# spockhart.com

The Spockhart website. Static site built with [Astro](https://astro.build), deployed to GitHub Pages at www.spockhart.com.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build in ./dist
npm run preview    # serve ./dist
```

Requires Node 22 or newer.

## Where things live

| To change | Edit |
| --- | --- |
| Tagline, email, city, legal name, form endpoint, LinkedIn | `src/config/site.ts` |
| Navigation and footer links | `src/config/site.ts` |
| Advisory board on the About page (names, titles, photos) | `src/data/advisors.ts`, photos in `public/advisors/` |
| Team experience case studies | `src/content/work/*.md` (one file per project) |
| Calculator inputs, defaults and formula | `src/lib/calc.ts` |
| Engagement phases and timeline | `src/components/Timeline.astro` |
| Common problems on the home page | `src/components/Problems.astro` (list), `src/components/LeakyBucket.astro` (graphic) |
| Case study graphics (live before and after) | `src/components/ResultVisual.astro`, timing engine in `src/scripts/scenes.ts`, `src/components/Honeycomb.astro` |
| Colors, type and spacing | `src/styles/global.css` (tokens at the top) |
| The logo | `src/lib/logo.ts` (geometry), `src/components/Mark.astro`, `src/components/Logo.astro` |

Pages are in `src/pages/`. The URL matches the file path.

### Adding a case study

Copy any file in `src/content/work/`, rename it (the file name becomes the URL), and edit the front matter. Use `kind: spockhart` for Spockhart client work; it gets its own section on the Work page. Never put a client name in a team-experience entry.

## Contact form

The form posts JSON to `site.formEndpoint` in `src/config/site.ts`. Create a free form at [Formspree](https://formspree.io) (or Basin, Getform), paste its endpoint URL there, and submissions arrive by email. Until an endpoint is set, the form composes the message for the visitor to send from their own email.

## Icons and share image

`npm run icons` regenerates `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` and `icon-512.png` from the logo geometry. The share image is `public/og.png` (1200 x 630).

## Deploying

1. Merge this branch into `main`.
2. In the GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions** (once).
3. Every push to `main` builds and deploys through `.github/workflows/deploy.yml`. The custom domain comes from `public/CNAME`.

## Portable preview

`npm run portable` builds a copy in `./portable` with relative links, so the site can be opened from any folder or preview host.

## Standards

- WCAG 2.1 AA: keyboard navigation, visible focus, AA contrast, reduced-motion support.
- One light theme in the original spockhart.com palette.
- Fonts are self-hosted. Headings use Fraunces, with f, j and J taken from Newsreader (`src/styles/fonts/`, OFL). No trackers, no cookies.
- Content is visible without JavaScript. Scripts only add motion, the calculator and form handling.
