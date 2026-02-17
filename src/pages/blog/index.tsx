import React, { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link } from "@tanstack/react-router";
import { meta } from "../../content_option";
import { getPosts, isGhostConfigured } from "../../services/ghostApi";
import type { GhostPost } from "@tryghost/content-api";

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<GhostPost[]>([]);
  const [loading, setLoading] = useState<boolean>(
    !isGhostConfigured ? false : true,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGhostConfigured) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts({ limit: 12 });
        setPosts(data as GhostPost[]);
        setError(null);
      } catch {
        setError("Failed to load blog posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getExcerpt = (post: GhostPost): string => {
    return post.custom_excerpt || post.excerpt || "";
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Blog | {meta.title}</title>
            <meta
              name="description"
              content="Read the latest articles and insights"
            />
          </Helmet>

          {/* Breadcrumbs */}
          <div className="breadcrumbs text-sm mb-6 pt-20">
            <ul>
              <li>
                <Link
                  to="/"
                  className="font-mono text-xs uppercase tracking-wider text-base-content/50 hover:text-base-content transition-colors flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <span className="font-mono text-xs uppercase tracking-wider text-base-content flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  Blog
                </span>
              </li>
            </ul>
          </div>

          <div className="animate-[fadeIn_0.3s_ease_forwards]">
            {/* Header */}
            <div className="mb-10">
              <div className="lg:w-2/3">
                <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight text-base-content mb-4">
                  Blog
                </h1>
                <div className="divider my-4 before:bg-base-content/20 after:bg-base-content/20"></div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="mt-4 font-mono text-sm uppercase tracking-wider text-base-content/60">
                  Loading posts...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div role="alert" className="alert alert-error mb-8">
                <span>{error}</span>
              </div>
            )}

            {/* Ghost Not Configured */}
            {!isGhostConfigured && (
              <div className="text-center py-16">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-base-content mb-4">
                  Under Construction
                </h2>
                <p className="font-mono text-sm text-base-content/60">
                  The blog is being set up. Check back soon.
                </p>
              </div>
            )}

            {/* No Posts */}
            {isGhostConfigured && !loading && !error && posts.length === 0 && (
              <div role="alert" className="alert alert-info mb-8">
                <span>No blog posts available at the moment.</span>
              </div>
            )}

            {/* Posts Grid */}
            {!loading && !error && posts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {posts.map((post: GhostPost) => (
                  <div
                    key={post.id}
                    className="card card-border bg-base-200 group hover:border-primary/30 transition-all duration-300"
                  >
                    {/* Card Image */}
                    {post.feature_image && (
                      <Link to={`/blog/${post.slug}`}>
                        <figure className="relative overflow-hidden aspect-video">
                          <img
                            src={post.feature_image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </figure>
                      </Link>
                    )}

                    {/* Card Body */}
                    <div className="card-body flex flex-col">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags &&
                          post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="badge badge-neutral badge-sm font-mono text-[0.6rem] uppercase tracking-wider"
                            >
                              {tag.name}
                            </span>
                          ))}
                        {post.tags && post.tags.length > 3 && (
                          <span className="badge badge-outline badge-sm font-mono text-[0.6rem]">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="card-title font-heading text-lg uppercase tracking-tight">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="hover:text-primary transition-colors duration-200"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="font-body text-sm text-base-content/70 line-clamp-3 flex-grow">
                        {getExcerpt(post)}
                      </p>

                      {/* Meta & Read More */}
                      <div className="mt-auto pt-4">
                        <div className="font-mono text-[0.65rem] uppercase tracking-wider text-base-content/50 mb-3">
                          <span>{formatDate(post.published_at)}</span>
                          {post.reading_time && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{post.reading_time} min read</span>
                            </>
                          )}
                        </div>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-primary font-medium hover:gap-3 transition-all duration-200"
                        >
                          Read Article
                          <span className="text-sm">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};
