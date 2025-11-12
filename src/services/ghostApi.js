import GhostContentAPI from '@tryghost/content-api';

// Initialize Ghost Content API
const api = new GhostContentAPI({
  url: process.env.REACT_APP_GHOST_URL,
  key: process.env.REACT_APP_GHOST_KEY,
  version: 'v5.0' // Can also use 'v3' or 'canary' depending on your Ghost version
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
    console.error('Error fetching posts:', error);
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
    console.error('Error fetching post:', error);
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
    console.error('Error fetching posts by tag:', error);
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
    console.error('Error fetching tags:', error);
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
    console.error('Error searching posts:', error);
    throw error;
  }
};

export default api;
