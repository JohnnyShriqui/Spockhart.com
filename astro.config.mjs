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
    '/about/': '/',
    '/privacy/': '/',
    '/terms/': '/',
    '/work/commission-automation/': '/work/#commission-automation',
    '/work/sales-performance-system/': '/work/#sales-performance-system',
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
