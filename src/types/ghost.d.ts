declare module '@tryghost/content-api' {
  interface GhostContentAPIOptions {
    url: string;
    key: string;
    version: string;
  }

  interface BrowseParams {
    limit?: number | string;
    page?: number;
    include?: string;
    filter?: string;
    order?: string;
    fields?: string;
    formats?: string;
  }

  interface ReadParams {
    id?: string;
    slug?: string;
  }

  interface GhostTag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    visibility?: string;
  }

  interface GhostAuthor {
    id: string;
    name: string;
    slug: string;
    profile_image?: string;
    bio?: string;
    url?: string;
  }

  interface GhostPost {
    id: string;
    uuid: string;
    title: string;
    slug: string;
    html: string;
    excerpt?: string;
    custom_excerpt?: string;
    feature_image?: string;
    featured: boolean;
    published_at: string;
    updated_at: string;
    created_at: string;
    reading_time?: number;
    tags?: GhostTag[];
    authors?: GhostAuthor[];
    primary_author?: GhostAuthor;
    primary_tag?: GhostTag;
    og_image?: string;
    twitter_image?: string;
    url?: string;
  }

  type GhostPostsOrPages = GhostPost[] & {
    meta?: {
      pagination: {
        page: number;
        limit: number;
        pages: number;
        total: number;
        next: number | null;
        prev: number | null;
      };
    };
  };

  interface GhostAPI {
    posts: {
      browse(options?: BrowseParams): Promise<GhostPostsOrPages>;
      read(data: ReadParams, options?: BrowseParams): Promise<GhostPost>;
    };
    pages: {
      browse(options?: BrowseParams): Promise<GhostPostsOrPages>;
      read(data: ReadParams, options?: BrowseParams): Promise<GhostPost>;
    };
    tags: {
      browse(options?: BrowseParams): Promise<GhostTag[]>;
      read(data: ReadParams, options?: BrowseParams): Promise<GhostTag>;
    };
    authors: {
      browse(options?: BrowseParams): Promise<GhostAuthor[]>;
      read(data: ReadParams, options?: BrowseParams): Promise<GhostAuthor>;
    };
  }

  export default class GhostContentAPI implements GhostAPI {
    constructor(options: GhostContentAPIOptions);
    posts: GhostAPI['posts'];
    pages: GhostAPI['pages'];
    tags: GhostAPI['tags'];
    authors: GhostAPI['authors'];
  }
}
