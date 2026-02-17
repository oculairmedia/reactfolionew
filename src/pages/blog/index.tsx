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
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Blog | {meta.title}</title>
          <meta
            name="description"
            content="Read the latest articles and insights"
          />
        </Helmet>

        <div className="animate-[fadeIn_0.3s_ease_forwards]">
          {/* Header */}
          <div className="mb-10 mt-6 md:pt-6">
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
              {posts.map((post) => (
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
    </HelmetProvider>
  );
};
