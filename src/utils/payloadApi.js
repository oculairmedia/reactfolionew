/**
 * Payload CMS API Utility Functions
 *
 * This file provides helper functions to fetch data from Payload CMS
 * Updated: 2025-11-11 - Added cache-busting and service worker fix
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Generic fetch function with error handling
 * Includes cache-busting timestamp to prevent stale data from service worker
 */
async function fetchFromPayload(endpoint) {
  try {
    // Add cache-busting timestamp parameter
    const timestamp = Date.now();
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_URL}${endpoint}${separator}_t=${timestamp}`;
    
    console.log(`[PayloadAPI] Fetching: ${url}`);
    const response = await fetch(url);
    console.log(`[PayloadAPI] Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[PayloadAPI] Data received for ${endpoint}:`, Object.keys(data));
    return data;
  } catch (error) {
    console.error(`[PayloadAPI] Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetch all projects
 * @param {Object} options - Query options (limit, page, sort, where)
 * @returns {Promise<Array>} Array of projects
 */
export async function getProjects(options = {}) {
  const params = new URLSearchParams();

  if (options.limit) params.append('limit', options.limit);
  if (options.page) params.append('page', options.page);
  if (options.sort) params.append('sort', options.sort);

  const queryString = params.toString();
  const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;

  const data = await fetchFromPayload(endpoint);
  return data.docs || [];
}

/**
 * Fetch a single project by ID
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Project object
 */
export async function getProjectById(projectId) {
  const endpoint = `/projects?where[id][equals]=${projectId}`;
  const data = await fetchFromPayload(endpoint);
  return data.docs?.[0] || null;
}

/**
 * Fetch all portfolio items
 * @param {Object} options - Query options (limit, page, sort, where)
 * @returns {Promise<Array>} Array of portfolio items
 */
export async function getPortfolioItems(options = {}) {
  const params = new URLSearchParams();

  if (options.limit) params.append('limit', options.limit);
  if (options.page) params.append('page', options.page);
  if (options.sort) params.append('sort', options.sort);

  const queryString = params.toString();
  const endpoint = `/portfolio${queryString ? `?${queryString}` : ''}`;

  const data = await fetchFromPayload(endpoint);
  return data.docs || [];
}

/**
 * Fetch a single portfolio item by ID
 * @param {string} portfolioId - The portfolio item ID
 * @returns {Promise<Object>} Portfolio item object
 */
export async function getPortfolioItemById(portfolioId) {
  const endpoint = `/portfolio?where[id][equals]=${portfolioId}`;
  const data = await fetchFromPayload(endpoint);
  return data.docs?.[0] || null;
}

/**
 * Fetch site settings (global)
 * @returns {Promise<Object>} Site settings object
 */
export async function getSiteSettings() {
  const data = await fetchFromPayload('/globals/site-settings');
  return data;
}

/**
 * Fetch home intro (global)
 * @returns {Promise<Object>} Home intro object
 */
export async function getHomeIntro() {
  const data = await fetchFromPayload('/globals/home-intro');
  return data;
}

/**
 * Fetch about page (global)
 * @returns {Promise<Object>} About page object
 */
export async function getAboutPage() {
  const data = await fetchFromPayload('/globals/about-page');
  return data;
}

/**
 * Search projects by tag
 * @param {string} tag - Tag to search for
 * @returns {Promise<Array>} Array of projects with the tag
 */
export async function searchProjectsByTag(tag) {
  const endpoint = `/projects?where[tags][contains]=${encodeURIComponent(tag)}`;
  const data = await fetchFromPayload(endpoint);
  return data.docs || [];
}

/**
 * Search portfolio items by tag
 * @param {string} tag - Tag to search for
 * @returns {Promise<Array>} Array of portfolio items with the tag
 */
export async function searchPortfolioByTag(tag) {
  const endpoint = `/portfolio?where[tags][contains]=${encodeURIComponent(tag)}`;
  const data = await fetchFromPayload(endpoint);
  return data.docs || [];
}

/**
 * Get all unique tags from projects
 * @returns {Promise<Array>} Array of unique tags
 */
export async function getAllProjectTags() {
  const projects = await getProjects();
  const tagsSet = new Set();

  projects.forEach(project => {
    if (project.tags && Array.isArray(project.tags)) {
      project.tags.forEach(tagObj => {
        if (tagObj.tag) {
          tagsSet.add(tagObj.tag);
        }
      });
    }
  });

  return Array.from(tagsSet);
}

/**
 * Get all unique tags from portfolio items
 * @returns {Promise<Array>} Array of unique tags
 */
export async function getAllPortfolioTags() {
  const items = await getPortfolioItems();
  const tagsSet = new Set();

  items.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tagObj => {
        if (tagObj.tag) {
          tagsSet.add(tagObj.tag);
        }
      });
    }
  });

  return Array.from(tagsSet);
}
