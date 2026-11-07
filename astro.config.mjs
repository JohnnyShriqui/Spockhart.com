// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://spockhart.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
    assets: 'assets',
  },
  // Case studies used to have their own pages; they now open in place on /work/.
  redirects: {
    '/work/commission-automation/': '/work/#commission-automation',
    '/work/project-feasibility-platform/': '/work/#project-feasibility-platform',
    '/work/subcontractor-financing-marketplace/': '/work/#subcontractor-financing-marketplace',
    '/work/sales-performance-system/': '/work/#sales-performance-system',
    '/work/digital-practice-growth/': '/work/#digital-practice-growth',
    '/work/momentum-exchange-prototype/': '/work/#momentum-exchange-prototype',
    '/work/supply-chain-assessment/': '/work/#supply-chain-assessment',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/contact/thanks/'),
    }),
  ],
});
