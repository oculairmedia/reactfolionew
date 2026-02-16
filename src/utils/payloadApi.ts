import type {
  PayloadQueryOptions,
  Project,
  PortfolioItem,
  SiteSettings,
  HomeIntro,
  AboutData,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://cms2.emmanuelu.com/api';

interface PayloadResponse {
  docs?: unknown[];
  [key: string]: unknown;
}

async function fetchFromPayload(endpoint: string): Promise<PayloadResponse> {
  const timestamp = Date.now();
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${API_URL}${endpoint}${separator}_t=${timestamp}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<PayloadResponse>;
}

export async function getProjects(options: PayloadQueryOptions = {}): Promise<Project[]> {
  const params = new URLSearchParams();
  const depth = options.depth !== undefined ? options.depth : 1;
  const limit = options.limit !== undefined ? options.limit : 100;

  params.append('limit', String(limit));
  if (options.page) params.append('page', String(options.page));
  if (options.sort) params.append('sort', options.sort);
  params.append('depth', String(depth));

  const queryString = params.toString();
  const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;

  const data = await fetchFromPayload(endpoint);
  return (data.docs || []) as Project[];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const endpoint = `/projects?where[id][equals]=${projectId}`;
  const data = await fetchFromPayload(endpoint);
  const docs = data.docs as Project[] | undefined;
  return docs?.[0] || null;
}

export async function getPortfolioItems(options: PayloadQueryOptions = {}): Promise<PortfolioItem[]> {
  const params = new URLSearchParams();
  const depth = options.depth !== undefined ? options.depth : 1;
  const limit = options.limit !== undefined ? options.limit : 100;

  params.append('limit', String(limit));
  if (options.page) params.append('page', String(options.page));
  if (options.sort) params.append('sort', options.sort);
  params.append('depth', String(depth));

  const queryString = params.toString();
  const endpoint = `/portfolio${queryString ? `?${queryString}` : ''}`;

  const data = await fetchFromPayload(endpoint);
  return (data.docs || []) as PortfolioItem[];
}

export async function getPortfolioItemById(portfolioId: string): Promise<PortfolioItem | null> {
  const endpoint = `/portfolio?where[id][equals]=${portfolioId}`;
  const data = await fetchFromPayload(endpoint);
  const docs = data.docs as PortfolioItem[] | undefined;
  return docs?.[0] || null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await fetchFromPayload('/globals/site-settings');
  return data as unknown as SiteSettings;
}

export async function getHomeIntro(): Promise<HomeIntro> {
  const data = await fetchFromPayload('/globals/home-intro');
  return data as unknown as HomeIntro;
}

export async function getAboutPage(): Promise<AboutData> {
  const data = await fetchFromPayload('/globals/about-page');
  return data as unknown as AboutData;
}

export async function searchProjectsByTag(tag: string): Promise<Project[]> {
  const endpoint = `/projects?where[tags][contains]=${encodeURIComponent(tag)}`;
  const data = await fetchFromPayload(endpoint);
  return (data.docs || []) as Project[];
}

export async function searchPortfolioByTag(tag: string): Promise<PortfolioItem[]> {
  const endpoint = `/portfolio?where[tags][contains]=${encodeURIComponent(tag)}`;
  const data = await fetchFromPayload(endpoint);
  return (data.docs || []) as PortfolioItem[];
}

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

  return Array.from(tagsSet);
}

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

  return Array.from(tagsSet);
}
