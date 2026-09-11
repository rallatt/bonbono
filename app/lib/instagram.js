import { CacheLong } from '@shopify/hydrogen';

/**
 * Recent posts from the shop's own Instagram account, for the homepage feed.
 *
 * Uses the Instagram API with Instagram Login (graph.instagram.com). The old
 * Basic Display API this replaces was shut down in December 2024, so any
 * tutorial mentioning it is out of date. Requirements:
 *
 *   - the account must be Business or Creator, not personal
 *   - a Meta app with the `instagram_business_basic` permission
 *   - a long-lived user token, set as PRIVATE_INSTAGRAM_ACCESS_TOKEN
 *
 * The token expires after 60 days and has to be refreshed (see
 * refreshInstagramToken below). If it lapses or is missing, every function
 * here returns an empty list and the homepage simply drops the section —
 * a broken feed must never take the page down with it.
 */

const IG_GRAPH_VERSION = 'v25.0';
const IG_MEDIA_FIELDS = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
const IG_TIMEOUT_MS = 5000;

/**
 * @param {{
 *   env: Env,
 *   withCache: {run: Function},
 *   limit?: number,
 * }} options
 * @returns {Promise<Array<{id: string, permalink: string, imageUrl: string, caption: string, timestamp: string}>>}
 */
export async function fetchInstagramPosts({ env, withCache, limit = 3 }) {
  const accessToken = env?.PRIVATE_INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken || !withCache) return [];

  try {
    return await withCache.run(
      {
        // Deliberately excludes the token: rotating it every 60 days
        // shouldn't invalidate the cache, and secrets don't belong in a
        // cache key.
        cacheKey: ['instagram', 'recent-media', limit],
        cacheStrategy: CacheLong(),
        // Never cache an empty result — that would hide the feed for an hour
        // after a single blip.
        shouldCacheResult: (result) => Array.isArray(result) && result.length > 0,
      },
      async () => {
        const url = new URL(
          `https://graph.instagram.com/${IG_GRAPH_VERSION}/me/media`,
        );
        url.searchParams.set('fields', IG_MEDIA_FIELDS);
        url.searchParams.set('limit', String(limit));
        url.searchParams.set('access_token', accessToken);

        const response = await fetch(url.toString(), {
          signal: AbortSignal.timeout(IG_TIMEOUT_MS),
        });

        if (!response.ok) {
          console.error(
            `Instagram feed: ${response.status} ${response.statusText}`,
          );
          return [];
        }

        const body = await response.json();
        return (body?.data ?? []).map(toPost).filter(Boolean).slice(0, limit);
      },
    );
  } catch (error) {
    console.error('Instagram feed unavailable', error);
    return [];
  }
}

/**
 * Videos and reels have no still image of their own — `media_url` is the MP4,
 * so the thumbnail is the only thing safe to put in an <img>.
 * @param {Record<string, string>} media
 */
function toPost(media) {
  const imageUrl =
    media.media_type === 'VIDEO' ? media.thumbnail_url : media.media_url;
  if (!imageUrl || !media.permalink) return null;

  return {
    id: media.id,
    permalink: media.permalink,
    imageUrl,
    caption: (media.caption ?? '').trim().slice(0, 140),
    timestamp: media.timestamp ?? '',
  };
}

/**
 * Trades a long-lived token that is at least 24 hours old for a fresh one,
 * good for another 60 days. Meant to be run from a scheduled job well before
 * expiry — the new value still has to be written back to the Oxygen
 * environment variable by hand or by that job.
 * @param {string} accessToken
 * @returns {Promise<{access_token: string, expires_in: number} | null>}
 */
export async function refreshInstagramToken(accessToken) {
  const url = new URL('https://graph.instagram.com/refresh_access_token');
  url.searchParams.set('grant_type', 'ig_refresh_token');
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(IG_TIMEOUT_MS),
  });
  if (!response.ok) return null;
  return response.json();
}
