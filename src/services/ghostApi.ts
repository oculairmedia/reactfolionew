import GhostContentAPI from '@tryghost/content-api';

export const GHOST_URL = import.meta.env.VITE_GHOST_URL as string | undefined;
export const GHOST_KEY = import.meta.env.VITE_GHOST_KEY as string | undefined;

export const isGhostConfigured = Boolean(GHOST_URL && GHOST_KEY);

const api = new GhostContentAPI({
  url: GHOST_URL || 'https://placeholder.invalid',
  key: GHOST_KEY || '00000000000000000000000000',
  version: 'v5.0'
});

interface GhostBrowseOptions {
  limit?: number;
  include?: string;
  filter?: string;
  page?: number;
  order?: string;
  fields?: string;
  [key: string]: unknown;
}

const LISTING_FIELDS = 'id,title,slug,feature_image,excerpt,custom_excerpt,published_at,reading_time';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000;
const STALE_TTL = 30 * 60 * 1000;

function getCached<T>(key: string): { data: T; stale: boolean } | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  const age = Date.now() - entry.timestamp;
  if (age > STALE_TTL) {
    cache.delete(key);
    return null;
  }
  return { data: entry.data, stale: age > CACHE_TTL };
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export const getPosts = async (options: GhostBrowseOptions = {}) => {
  const opts = {
    limit: 15,
    include: 'tags',
    fields: LISTING_FIELDS,
    ...options
  };

  const cacheKey = `posts:${JSON.stringify(opts)}`;
  const cached = getCached<Awaited<ReturnType<typeof api.posts.browse>>>(cacheKey);

  if (cached && !cached.stale) return cached.data;

  const fetchPromise = api.posts.browse(opts).then((posts) => {
    setCache(cacheKey, posts);
    return posts;
  });

  if (cached?.stale) return cached.data;

  return fetchPromise;
};

export const getPostBySlug = async (slug: string) => {
  const cacheKey = `post:${slug}`;
  const cached = getCached<Awaited<ReturnType<typeof api.posts.read>>>(cacheKey);

  if (cached && !cached.stale) return cached.data;

  const fetchPromise = api.posts.read(
    { slug },
    { include: 'tags,authors' }
  ).then((post) => {
    setCache(cacheKey, post);
    return post;
  });

  if (cached?.stale) return cached.data;

  return fetchPromise;
};

export const getPostsByTag = async (tagSlug: string, options: GhostBrowseOptions = {}) => {
  const defaultOptions = {
    limit: 15,
    include: 'tags',
    fields: LISTING_FIELDS,
    filter: `tag:${tagSlug}`,
    ...options
  };

  const posts = await api.posts.browse(defaultOptions);
  return posts;
};

export const getTags = async () => {
  const tags = await api.tags.browse({ limit: 'all' });
  return tags;
};

export const searchPosts = async (query: string, options: GhostBrowseOptions = {}) => {
  const defaultOptions = {
    limit: 15,
    include: 'tags',
    fields: LISTING_FIELDS,
    filter: `title:~'${query}'+excerpt:~'${query}'`,
    ...options
  };

  const posts = await api.posts.browse(defaultOptions);
  return posts;
};

export const prefetchBlogPosts = (): void => {
  if (!isGhostConfigured) return;
  getPosts({ limit: 12 }).catch(() => {});
};

export default api;
