/**
 * Payload CMS API Utility Functions (TypeScript)
 *
 * Features:
 * - Type-safe API calls with proper TypeScript interfaces
 * - Automatic retry with exponential backoff
 * - Request deduplication to prevent duplicate calls
 * - Structured error logging
 * - Comprehensive error handling
 */

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface TagObject {
  tag: string;
  id?: string;
}

export interface Metadata {
  client?: string;
  date?: string;
  role?: string;
  technologies?: string;
}

export interface Hero {
  type: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  altText?: string;
}

export interface ContentSection {
  title: string;
  content: string;
  layout?: 'full' | 'left' | 'right';
  id?: string;
}

export interface GalleryItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  width?: 'full' | 'half';
  id?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  metadata?: Metadata;
  hero?: Hero;
  tags?: TagObject[];
  sections?: ContentSection[];
  gallery?: GalleryItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  isVideo?: boolean;
  video?: string;
  img?: string;
  link?: string;
  date?: string;
  tags?: TagObject[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialLinks {
  github?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
}

export interface ContactInfo {
  email: string;
  description?: string;
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
}

export interface SiteSettings {
  logotext: {
    text: string;
  };
  meta: {
    title: string;
    description: string;
  };
  contact: ContactInfo;
  social: SocialLinks;
  updatedAt?: string;
}

export interface AnimatedItem {
  item: string;
  id?: string;
}

export interface HomeIntro {
  title: string;
  description: string;
  image_url?: string;
  animated: AnimatedItem[];
  updatedAt?: string;
}

export interface TimelineItem {
  jobtitle: string;
  where: string;
  date: string;
  id?: string;
}

export interface Skill {
  name: string;
  value: number;
  id?: string;
}

export interface Service {
  title: string;
  description: string;
  id?: string;
}

export interface AboutPage {
  title: string;
  aboutme: string;
  timeline?: TimelineItem[];
  skills?: Skill[];
  services?: Service[];
  updatedAt?: string;
}

export interface QueryOptions {
  limit?: number;
  page?: number;
  sort?: string;
  where?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface ApiError extends Error {
  status?: number;
  endpoint?: string;
  timestamp?: string;
}

// ==========================================
// CONFIGURATION
// ==========================================

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 16000, // 16 seconds
};

const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: true,
  prefix: 'payload_cache_',
};

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// ==========================================
// LOGGING UTILITIES
// ==========================================

interface LogContext {
  endpoint?: string;
  status?: number;
  duration?: number;
  attempt?: number;
  error?: string;
}

function logInfo(message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ℹ️  ${message}`, context || '');
}

function logError(message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${message}`, context || '');
}

function logWarning(message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] ⚠️  ${message}`, context || '');
}

// ==========================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ==========================================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

async function fetchWithRetry<T>(
  endpoint: string,
  options?: RequestInit,
  attempt: number = 0
): Promise<T> {
  const startTime = performance.now();

  try {
    const url = `${API_URL}${endpoint}`;
    logInfo(`Fetching: ${endpoint}`, { attempt: attempt + 1 });

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const duration = Math.round(performance.now() - startTime);

    if (!response.ok) {
      throw {
        name: 'ApiError',
        message: `HTTP error! status: ${response.status}`,
        status: response.status,
        endpoint,
        timestamp: new Date().toISOString(),
      } as ApiError;
    }

    const data = await response.json();
    logInfo(`✅ Success: ${endpoint}`, { status: response.status, duration });

    return data;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    const isNetworkError = error instanceof TypeError;
    const isServerError = (error as ApiError).status && (error as ApiError).status! >= 500;
    const shouldRetry = (isNetworkError || isServerError) && attempt < RETRY_CONFIG.maxRetries;

    if (shouldRetry) {
      const backoffDelay = calculateBackoff(attempt);
      logWarning(
        `Retrying ${endpoint} after ${backoffDelay}ms`,
        {
          attempt: attempt + 1,
          duration,
          error: (error as Error).message,
        }
      );

      await sleep(backoffDelay);
      return fetchWithRetry<T>(endpoint, options, attempt + 1);
    }

    // Max retries exceeded or non-retryable error
    logError(`Failed: ${endpoint}`, {
      endpoint,
      duration,
      attempt: attempt + 1,
      error: (error as Error).message,
    });

    throw error;
  }
}

// ==========================================
// LOCALSTORAGE CACHE UTILITIES
// ==========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  endpoint: string;
}

function getCacheKey(endpoint: string, options?: RequestInit): string {
  return `${CACHE_CONFIG.prefix}${endpoint}:${JSON.stringify(options || {})}`;
}

function getCachedData<T>(endpoint: string, options?: RequestInit): T | null {
  try {
    const cacheKey = getCacheKey(endpoint, options);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    // Return cached data if still fresh
    if (age < CACHE_CONFIG.ttl) {
      logInfo(`Cache hit (fresh): ${endpoint}`, { duration: age });
      return entry.data;
    }

    // Return stale data if stale-while-revalidate is enabled
    if (CACHE_CONFIG.staleWhileRevalidate && age < CACHE_CONFIG.ttl * 2) {
      logInfo(`Cache hit (stale): ${endpoint}`, { duration: age });
      return entry.data;
    }

    // Cache expired
    return null;
  } catch (error) {
    logWarning('Cache read error', { error: (error as Error).message });
    return null;
  }
}

function setCachedData<T>(endpoint: string, data: T, options?: RequestInit): void {
  try {
    const cacheKey = getCacheKey(endpoint, options);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      endpoint,
    };

    localStorage.setItem(cacheKey, JSON.stringify(entry));
    logInfo(`Cache set: ${endpoint}`);
  } catch (error) {
    // Fail silently if localStorage is full or disabled
    logWarning('Cache write error', { error: (error as Error).message });
  }
}

function isCacheStale(endpoint: string, options?: RequestInit): boolean {
  try {
    const cacheKey = getCacheKey(endpoint, options);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return true;

    const entry: CacheEntry<any> = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    return age >= CACHE_CONFIG.ttl;
  } catch (error) {
    return true;
  }
}

// ==========================================
// REQUEST DEDUPLICATION
// ==========================================

async function fetchWithDeduplication<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `${endpoint}:${JSON.stringify(options || {})}`;

  // Check if request is already in flight
  if (pendingRequests.has(cacheKey)) {
    logInfo(`Deduplicating request: ${endpoint}`);
    return pendingRequests.get(cacheKey) as Promise<T>;
  }

  // Create new request
  const requestPromise = fetchWithRetry<T>(endpoint, options)
    .finally(() => {
      // Clean up after request completes
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

// ==========================================
// GENERIC FETCH FUNCTION WITH CACHING
// ==========================================

async function fetchFromPayload<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Try to get cached data first
  const cachedData = getCachedData<T>(endpoint, options);

  // If we have fresh cached data, return it immediately
  if (cachedData && !isCacheStale(endpoint, options)) {
    return cachedData;
  }

  // If we have stale cached data and stale-while-revalidate is enabled
  if (cachedData && CACHE_CONFIG.staleWhileRevalidate) {
    // Return stale data immediately
    // Revalidate in background (don't await)
    fetchWithDeduplication<T>(endpoint, options)
      .then(freshData => {
        setCachedData(endpoint, freshData, options);
      })
      .catch(error => {
        logWarning(`Background revalidation failed for ${endpoint}`, {
          error: (error as Error).message,
        });
      });

    return cachedData;
  }

  // No cache or cache expired, fetch fresh data
  const freshData = await fetchWithDeduplication<T>(endpoint, options);

  // Cache the fresh data
  setCachedData(endpoint, freshData, options);

  return freshData;
}

// ==========================================
// PROJECT API FUNCTIONS
// ==========================================

/**
 * Fetch all projects with optional filtering and pagination
 */
export async function getProjects(
  options: QueryOptions = {}
): Promise<Project[]> {
  const params = new URLSearchParams();

  if (options.limit) params.append('limit', options.limit.toString());
  if (options.page) params.append('page', options.page.toString());
  if (options.sort) params.append('sort', options.sort);

  const queryString = params.toString();
  const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;

  const data = await fetchFromPayload<PaginatedResponse<Project>>(endpoint);
  return data.docs || [];
}

/**
 * Fetch a single project by ID
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  const endpoint = `/projects?where[id][equals]=${encodeURIComponent(projectId)}`;
  const data = await fetchFromPayload<PaginatedResponse<Project>>(endpoint);
  return data.docs?.[0] || null;
}

/**
 * Search projects by tag
 */
export async function searchProjectsByTag(tag: string): Promise<Project[]> {
  const endpoint = `/projects?where[tags.tag][contains]=${encodeURIComponent(tag)}`;
  const data = await fetchFromPayload<PaginatedResponse<Project>>(endpoint);
  return data.docs || [];
}

/**
 * Get all unique tags from projects
 */
export async function getAllProjectTags(): Promise<string[]> {
  const projects = await getProjects();
  const tagsSet = new Set<string>();

  projects.forEach(project => {
    if (project.tags && Array.isArray(project.tags)) {
      project.tags.forEach(tagObj => {
        if (tagObj.tag) {
          tagsSet.add(tagObj.tag);
        }
      });
    }
  });

  return Array.from(tagsSet).sort();
}

// ==========================================
// PORTFOLIO API FUNCTIONS
// ==========================================

/**
 * Fetch all portfolio items with optional filtering and pagination
 */
export async function getPortfolioItems(
  options: QueryOptions = {}
): Promise<PortfolioItem[]> {
  const params = new URLSearchParams();

  if (options.limit) params.append('limit', options.limit.toString());
  if (options.page) params.append('page', options.page.toString());
  if (options.sort) params.append('sort', options.sort);

  const queryString = params.toString();
  const endpoint = `/portfolio${queryString ? `?${queryString}` : ''}`;

  const data = await fetchFromPayload<PaginatedResponse<PortfolioItem>>(endpoint);
  return data.docs || [];
}

/**
 * Fetch a single portfolio item by ID
 */
export async function getPortfolioItemById(
  portfolioId: string
): Promise<PortfolioItem | null> {
  const endpoint = `/portfolio?where[id][equals]=${encodeURIComponent(portfolioId)}`;
  const data = await fetchFromPayload<PaginatedResponse<PortfolioItem>>(endpoint);
  return data.docs?.[0] || null;
}

/**
 * Search portfolio items by tag
 */
export async function searchPortfolioByTag(tag: string): Promise<PortfolioItem[]> {
  const endpoint = `/portfolio?where[tags.tag][contains]=${encodeURIComponent(tag)}`;
  const data = await fetchFromPayload<PaginatedResponse<PortfolioItem>>(endpoint);
  return data.docs || [];
}

/**
 * Get all unique tags from portfolio items
 */
export async function getAllPortfolioTags(): Promise<string[]> {
  const items = await getPortfolioItems();
  const tagsSet = new Set<string>();

  items.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tagObj => {
        if (tagObj.tag) {
          tagsSet.add(tagObj.tag);
        }
      });
    }
  });

  return Array.from(tagsSet).sort();
}

// ==========================================
// GLOBAL API FUNCTIONS
// ==========================================

/**
 * Fetch site settings (global singleton)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  return fetchFromPayload<SiteSettings>('/globals/site-settings');
}

/**
 * Fetch home intro (global singleton)
 */
export async function getHomeIntro(): Promise<HomeIntro> {
  return fetchFromPayload<HomeIntro>('/globals/home-intro');
}

/**
 * Fetch about page (global singleton)
 */
export async function getAboutPage(): Promise<AboutPage> {
  return fetchFromPayload<AboutPage>('/globals/about-page');
}

// ==========================================
// HEALTH CHECK
// ==========================================

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  database?: string;
  uptime?: number;
  error?: string;
}

/**
 * Check API health status
 */
export async function checkHealth(): Promise<HealthStatus> {
  try {
    return await fetchFromPayload<HealthStatus>('/health');
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
    };
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Clear pending request cache (useful for testing or manual invalidation)
 */
export function clearRequestCache(): void {
  pendingRequests.clear();
  logInfo('Request cache cleared');
}

/**
 * Get current request cache size
 */
export function getRequestCacheSize(): number {
  return pendingRequests.size;
}

/**
 * Clear localStorage cache (useful for forcing fresh data)
 */
export function clearLocalStorageCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_CONFIG.prefix));

    cacheKeys.forEach(key => localStorage.removeItem(key));

    logInfo(`Cleared ${cacheKeys.length} cache entries from localStorage`);
  } catch (error) {
    logWarning('Failed to clear localStorage cache', {
      error: (error as Error).message,
    });
  }
}

/**
 * Clear all caches (both in-memory and localStorage)
 */
export function clearAllCaches(): void {
  clearRequestCache();
  clearLocalStorageCache();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  inMemoryRequests: number;
  localStorageEntries: number;
  cacheKeys: string[];
} {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key => key.startsWith(CACHE_CONFIG.prefix));

  return {
    inMemoryRequests: pendingRequests.size,
    localStorageEntries: cacheKeys.length,
    cacheKeys,
  };
}
