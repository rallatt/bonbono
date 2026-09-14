#!/usr/bin/env node
/**
 * Trades the current long-lived Instagram token for a fresh one, good for
 * another 60 days. Run it every ~50 days:
 *
 *   npm run instagram:refresh
 *
 * It reads PRIVATE_INSTAGRAM_ACCESS_TOKEN from .env (or takes the token as an
 * argument) and prints the new one plus its expiry date. Paste the new value
 * into Hydrogen -> Bonbono -> Environments -> Production, and into your local
 * .env, then you're set for another two months.
 *
 * The token must be at least 24 hours old and not yet expired — Instagram
 * refuses to refresh outside that window.
 */

import { readFileSync } from 'node:fs';

function tokenFromEnvFile() {
  try {
    const line = readFileSync(new URL('../.env', import.meta.url), 'utf8')
      .split('\n')
      .find((l) => l.startsWith('PRIVATE_INSTAGRAM_ACCESS_TOKEN='));
    return line?.split('=').slice(1).join('=').trim() || null;
  } catch {
    return null;
  }
}

const token =
  process.argv[2] || process.env.PRIVATE_INSTAGRAM_ACCESS_TOKEN || tokenFromEnvFile();

if (!token) {
  console.error(
    'No token found. Pass it as an argument, or set PRIVATE_INSTAGRAM_ACCESS_TOKEN in .env.',
  );
  process.exit(1);
}

const url = new URL('https://graph.instagram.com/refresh_access_token');
url.searchParams.set('grant_type', 'ig_refresh_token');
url.searchParams.set('access_token', token);

const response = await fetch(url);
const body = await response.json();

if (!response.ok) {
  console.error(`Refresh failed (${response.status}).`);
  console.error(body?.error?.message ?? body);
  console.error(
    '\nIf the token has already expired, no refresh is possible — generate a new one in the Meta app dashboard.',
  );
  process.exit(1);
}

const expiresOn = new Date(Date.now() + body.expires_in * 1000);

console.log('\nNew token (valid until %s):\n', expiresOn.toDateString());
console.log(body.access_token);
console.log('\nUpdate it in two places:');
console.log('  1. Hydrogen -> Bonbono -> Environments -> Production -> PRIVATE_INSTAGRAM_ACCESS_TOKEN');
console.log('  2. your local .env');
console.log('  3. the INSTAGRAM_ACCESS_TOKEN repo secret, so the weekly check keeps working\n');
