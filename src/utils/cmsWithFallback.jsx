/**
 * CMS with Fallback Utility
 * 
 * Provides resilient data fetching with automatic fallback to local JSON files
 * when the CMS is unavailable. Includes monitoring and logging.
 * 
 * Architecture:
 * 1. Try to fetch from Payload CMS (primary source)
 * 2. On failure, fall back to local JSON files
 * 3. Log all fallback usage for monitoring
 */

// Fallback event tracking
const fallbackEvents = [];
const MAX_EVENTS = 100; // Keep last 100 events in memory

/**
 * Log a fallback event
 * @param {string} source - What was being fetched
 * @param {string} reason - Why fallback was used
 * @param {string} status - 'success' or 'failed'
 */
function logFallbackEvent(source, reason, status = 'success') {
  const event = {
    timestamp: new Date().toISOString(),
    source,
    reason,
    status,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
  };
  
  // Add to in-memory log
  fallbackEvents.push(event);
  if (fallbackEvents.length > MAX_EVENTS) {
    fallbackEvents.shift(); // Remove oldest
  }
  
  // Send to analytics if available (Google Analytics, Sentry, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cms_fallback', {
      event_category: 'CMS',
      event_label: source,
      value: status === 'success' ? 1 : 0
    });
  }
  
}

/**
 * Get all fallback events (for monitoring dashboard)
 * @returns {Array} Array of fallback events
 */
export function getFallbackEvents() {
  return [...fallbackEvents];
}

/**
 * Get fallback statistics
 * @returns {Object} Statistics about fallback usage
 */
export function getFallbackStats() {
  const now = Date.now();
  const last24h = fallbackEvents.filter(e => 
    (now - new Date(e.timestamp).getTime()) < 24 * 60 * 60 * 1000
  );
  
  return {
    total_events: fallbackEvents.length,
    last_24h: last24h.length,
    success_rate: fallbackEvents.length > 0 
      ? (fallbackEvents.filter(e => e.status === 'success').length / fallbackEvents.length * 100).toFixed(1)
      : 100,
    most_common_source: getMostCommon(fallbackEvents.map(e => e.source)),
    most_common_reason: getMostCommon(fallbackEvents.map(e => e.reason))
  };
}

function getMostCommon(arr) {
  if (arr.length === 0) return null;
  const counts = {};
  arr.forEach(item => counts[item] = (counts[item] || 0) + 1);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

/**
 * Fetch with automatic fallback
 * @param {Function} cmsFetcher - Async function that fetches from CMS
 * @param {*} fallbackData - Local data to use if CMS fails
 * @param {string} source - Name of the data source (for logging)
 * @returns {Promise<*>} Data from CMS or fallback
 */
export async function fetchWithFallback(cmsFetcher, fallbackData, source) {
  try {
    const data = await cmsFetcher();
    return data;
  } catch (error) {
    const reason = error.message || 'Unknown error';
    logFallbackEvent(source, reason, 'success');
    return fallbackData;
  }
}

/**
 * Fetch with timeout and fallback
 * @param {Function} cmsFetcher - Async function that fetches from CMS
 * @param {*} fallbackData - Local data to use if CMS fails
 * @param {string} source - Name of the data source (for logging)
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<*>} Data from CMS or fallback
 */
export async function fetchWithTimeout(cmsFetcher, fallbackData, source, timeout = 5000) {
  try {
    const data = await Promise.race([
      cmsFetcher(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
    return data;
  } catch (error) {
    const reason = error.message || 'Unknown error';
    logFallbackEvent(source, reason, 'success');
    return fallbackData;
  }
}

/**
 * Health check for CMS availability
 * @param {string} apiUrl - CMS API URL
 * @returns {Promise<boolean>} True if CMS is available
 */
export async function checkCmsHealth(apiUrl = import.meta.env.VITE_API_URL || 'https://cms2.emmanuelu.com/api') {
  try {
    const response = await fetch(`${apiUrl}/health`, { 
      method: 'GET',
      timeout: 3000 
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get CMS status for monitoring
 * @returns {Promise<Object>} CMS status information
 */
export async function getCmsStatus() {
  const isHealthy = await checkCmsHealth();
  const stats = getFallbackStats();
  
  return {
    cms_available: isHealthy,
    fallback_stats: stats,
    last_check: new Date().toISOString()
  };
}

// Export for monitoring dashboard
export default {
  fetchWithFallback,
  fetchWithTimeout,
  getFallbackEvents,
  getFallbackStats,
  checkCmsHealth,
  getCmsStatus
};
