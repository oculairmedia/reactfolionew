import GhostContentAPI from '@tryghost/content-api';

const GHOST_URL = import.meta.env.VITE_GHOST_URL as string | undefined;
const GHOST_KEY = import.meta.env.VITE_GHOST_KEY as string | undefined;

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
  [key: string]: unknown;
}

export const getPosts = async (options: GhostBrowseOptions = {}) => {
  const defaultOptions = {
    limit: 15,
    include: 'tags,authors',
    ...options
  };

  const posts = await api.posts.browse(defaultOptions);
  return posts;
};

export const getPostBySlug = async (slug: string) => {
  const post = await api.posts.read(
    { slug },
    { include: 'tags,authors' }
  );
  return post;
};

export const getPostsByTag = async (tagSlug: string, options: GhostBrowseOptions = {}) => {
  const defaultOptions = {
    limit: 15,
    include: 'tags,authors',
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
    include: 'tags,authors',
    filter: `title:~'${query}'+excerpt:~'${query}'`,
    ...options
  };

  const posts = await api.posts.browse(defaultOptions);
  return posts;
};

export default api;
