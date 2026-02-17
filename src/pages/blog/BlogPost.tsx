import React, { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { meta } from "../../content_option";
import { getPostBySlug, isGhostConfigured } from "../../services/ghostApi";
import type { GhostPost } from "@tryghost/content-api";

export const BlogPost: React.FC = () => {
  const { slug } = useParams({ strict: false });
  const navigate = useNavigate();
  const [post, setPost] = useState<GhostPost | null>(null);
  const [loading, setLoading] = useState<boolean>(
    !isGhostConfigured ? false : true,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGhostConfigured) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostBySlug(slug as string);
        setPost(data as GhostPost);
        setError(null);
      } catch {
        setError("Failed to load blog post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Loading State
  if (loading) {
    return (
      <HelmetProvider>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Loading... | {meta.title}</title>
          </Helmet>
          <div className="flex flex-col items-center justify-center py-16">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 font-mono text-sm uppercase tracking-wider text-base-content/60">
              Loading post...
            </p>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  // Error or Not Found State
  if (!isGhostConfigured || error || !post) {
    return (
      <HelmetProvider>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Helmet>
            <meta charSet="utf-8" />
            <title>
              {!isGhostConfigured ? "Under Construction" : "Error"} |{" "}
              {meta.title}
            </title>
          </Helmet>

          <div className="animate-[fadeIn_0.3s_ease_forwards]">
            {!isGhostConfigured ? (
              <div className="text-center py-16">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-base-content mb-4">
                  Under Construction
                </h2>
                <p className="font-mono text-sm text-base-content/60 mb-8">
                  The blog is being set up. Check back soon.
                </p>
              </div>
            ) : (
              <div role="alert" className="alert alert-error mb-8">
                <span>{error || "Post not found"}</span>
              </div>
            )}

            <button
              className="btn btn-primary font-mono text-[0.7rem] uppercase tracking-[0.15em]"
              onClick={() => navigate({ to: "/blog" })}
            >
              Back to Blog
            </button>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  // Post Content
  return (
    <HelmetProvider>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Helmet>
          <meta charSet="utf-8" />
          <title>
            {post.title} | {meta.title}
          </title>
          <meta
            name="description"
            content={post.custom_excerpt || post.excerpt || post.title}
          />
          {post.og_image && (
            <meta property="og:image" content={post.og_image} />
          )}
          {post.twitter_image && (
            <meta name="twitter:image" content={post.twitter_image} />
          )}
        </Helmet>

        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-base-content/60 hover:text-primary transition-colors duration-200"
          >
            <span>←</span>
            Back to Blog
          </Link>
        </div>

        <article className="animate-[fadeIn_0.3s_ease_forwards]">
          {/* Header */}
          <header className="mb-10">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-base-content mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[0.7rem] uppercase tracking-wider text-base-content/60 mb-6">
              <span>{formatDate(post.published_at)}</span>
              {post.reading_time && (
                <>
                  <span>•</span>
                  <span>{post.reading_time} min read</span>
                </>
              )}
              {post.primary_author && (
                <>
                  <span>•</span>
                  <span>by {post.primary_author.name}</span>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags &&
                post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="badge badge-neutral font-mono text-[0.6rem] uppercase tracking-wider"
                  >
                    {tag.name}
                  </span>
                ))}
            </div>

            {/* Featured Image */}
            {post.feature_image && (
              <figure className="w-full overflow-hidden mb-8">
                <img
                  src={post.feature_image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </figure>
            )}
          </header>

          {/* Content */}
          <div
            className="prose prose-invert max-w-none
                       prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-tight
                       prose-p:font-body prose-p:text-base-content/80 prose-p:leading-relaxed
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-base-content prose-strong:font-semibold
                       prose-code:font-mono prose-code:text-sm
                       prose-pre:bg-base-300 prose-pre:border-2 prose-pre:border-base-content/10
                       prose-img:w-full prose-img:my-8
                       prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* Author Info */}
          {post.primary_author && (
            <div className="mt-16 pt-8 border-t-2 border-base-content/10">
              <div className="flex items-start gap-6">
                {post.primary_author.profile_image && (
                  <div className="avatar">
                    <div className="w-16 h-16">
                      <img
                        src={post.primary_author.profile_image}
                        alt={post.primary_author.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <h5 className="font-heading text-lg font-bold uppercase tracking-tight text-base-content mb-2">
                    {post.primary_author.name}
                  </h5>
                  {post.primary_author.bio && (
                    <p className="font-body text-sm text-base-content/70 leading-relaxed">
                      {post.primary_author.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Back to Blog Link */}
        <div className="mt-16 pt-8 border-t-2 border-base-content/10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-primary font-medium hover:gap-3 transition-all duration-200"
          >
            <span>←</span>
            Back to all posts
          </Link>
        </div>
      </div>
    </HelmetProvider>
  );
};
