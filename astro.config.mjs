// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.spockhart.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
    assets: 'assets',
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
