import GhostContentAPI from '@tryghost/content-api';

const GHOST_URL = import.meta.env.VITE_GHOST_URL;
const GHOST_KEY = import.meta.env.VITE_GHOST_KEY;
export const isGhostConfigured = Boolean(GHOST_URL && GHOST_KEY);

if (!isGhostConfigured) {
  console.warn('[Ghost] Not configured. Set VITE_GHOST_URL and VITE_GHOST_KEY in .env');
}

const api = new GhostContentAPI({
  url: GHOST_URL || 'https://placeholder.invalid',
  key: GHOST_KEY || 'placeholder',
  version: 'v5.0'
});

/**
 * Get all published blog posts
 * @param {Object} options - Query options (limit, page, filter, etc.)
 * @returns {Promise<Object>} Posts data with pagination info
 */
export const getPosts = async (options = {}) => {
  try {
    const defaultOptions = {
      limit: 15,
      include: 'tags,authors',
      ...options
    };

    const posts = await api.posts.browse(defaultOptions);
    return posts;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single post by slug
 * @param {string} slug - Post slug
 * @returns {Promise<Object>} Post data
 */
export const getPostBySlug = async (slug) => {
  try {
    const post = await api.posts.read(
      { slug },
      { include: 'tags,authors' }
    );
    return post;
  } catch (error) {
    throw error;
  }
};

/**
 * Get posts by tag
 * @param {string} tagSlug - Tag slug
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Posts data
 */
export const getPostsByTag = async (tagSlug, options = {}) => {
  try {
    const defaultOptions = {
      limit: 15,
      include: 'tags,authors',
      filter: `tag:${tagSlug}`,
      ...options
    };

    const posts = await api.posts.browse(defaultOptions);
    return posts;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all tags
 * @returns {Promise<Array>} Tags array
 */
export const getTags = async () => {
  try {
    const tags = await api.tags.browse({ limit: 'all' });
    return tags;
  } catch (error) {
    throw error;
  }
};

/**
 * Search posts
 * @param {string} query - Search query
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Posts data
 */
export const searchPosts = async (query, options = {}) => {
  try {
    const defaultOptions = {
      limit: 15,
      include: 'tags,authors',
      filter: `title:~'${query}'+excerpt:~'${query}'`,
      ...options
    };

    const posts = await api.posts.browse(defaultOptions);
    return posts;
  } catch (error) {
    throw error;
  }
};

export default api;
