/*
 * WHAT IS THIS FILE?
 *
 * It's the  entry point for the express server when building for production.
 *
 * Learn more about the cloudflare integration here:
 * - https://qwik.builder.io/integrations/deployments/node/
 *
 */
import { createQwikCity, type PlatformNode } from '@builder.io/qwik-city/middleware/node';
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import { createServer } from 'node:http';
import render from './entry.ssr';

declare global {
  interface QwikCityPlatform extends PlatformNode {}
}

/** The default headers used by helmet */
const DEFAULT_HEADERS = {
  'Content-Security-Policy': [
    `default-src 'self'`,
    `base-uri 'self'`,
    `font-src 'self' https: data:`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `img-src 'self' data:`,
    `object-src 'none'`,
    `script-src 'self'`,
    `script-src-attr 'none'`,
    `style-src 'self' https: 'unsafe-inline'`,
    `upgrade-insecure-requests`,
  ].join(';'),
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-XSS-Protection': '0',
};

// Create the Qwik City router
const { router, notFound, staticFile } = createQwikCity({
  render,
  qwikCityPlan,
  manifest,
  static: {
    cacheControl: 'public, max-age=31557600',
  },
});

const server = createServer();

server.on('request', (req, res) => {
  for (const header of Object.entries(DEFAULT_HEADERS)) {
    res.setHeader(...header);
  }

  staticFile(req, res, () => {
    router(req, res, () => {
      notFound(req, res, () => {});
    });
  });
});

server.listen(process.env.PORT ?? 8080);
