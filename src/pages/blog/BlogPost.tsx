import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { meta } from "../../content_option";
import { getPostBySlug, isGhostConfigured } from "../../services/ghostApi";
import type { GhostPost } from "@tryghost/content-api";
import BlogContent from "../../components/BlogContent";
import "./BlogPost.css";

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

export const BlogPost: React.FC = () => {
  const { slug } = useParams({ strict: false });
  const navigate = useNavigate();
  const [post, setPost] = useState<GhostPost | null>(null);
  const [loading, setLoading] = useState<boolean>(
    !isGhostConfigured ? false : true,
  );
  const [error, setError] = useState<string | null>(null);
  const [activeHeading, setActiveHeading] = useState<string>("");

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

  // Extract headings from HTML content for table of contents
  const tableOfContents = useMemo<TableOfContentsItem[]>(() => {
    if (!post?.html) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(post.html, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3, h4");
    const items: TableOfContentsItem[] = [];

    headings.forEach((heading, index) => {
      const text = heading.textContent || "";
      const level = parseInt(heading.tagName[1], 10);
      const id = `heading-${index}-${text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}`;
      items.push({ id, text, level });
    });

    return items;
  }, [post?.html]);

  // Add IDs to headings in the rendered content
  const processedHtml = useMemo(() => {
    if (!post?.html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(post.html, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3, h4");

    headings.forEach((heading, index) => {
      const text = heading.textContent || "";
      const id = `heading-${index}-${text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}`;
      heading.setAttribute("id", id);
    });

    return doc.body.innerHTML;
  }, [post?.html]);

  // Track active heading on scroll
  useEffect(() => {
    if (tableOfContents.length === 0) return;

    const handleScroll = () => {
      const headingElements = tableOfContents
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];

      const scrollPosition = window.scrollY + 120;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element.offsetTop <= scrollPosition) {
          setActiveHeading(tableOfContents[i].id);
          return;
        }
      }

      if (tableOfContents.length > 0) {
        setActiveHeading(tableOfContents[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [tableOfContents]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderBreadcrumbs = () => (
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
          <Link
            to="/blog"
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            Blog
          </Link>
        </li>
        <li>
          <span className="font-mono text-xs uppercase tracking-wider text-base-content truncate max-w-[200px]">
            {post?.title || "Loading..."}
          </span>
        </li>
      </ul>
    </div>
  );

  const renderMobileTableOfContents = () => {
    if (tableOfContents.length === 0) return null;

    return (
      <div className="xl:hidden mb-8">
        <div className="collapse collapse-arrow bg-base-200 border border-base-content/10">
          <input type="checkbox" />
          <div className="collapse-title font-mono text-[0.7rem] uppercase tracking-[0.15em] text-base-content/70 flex items-center gap-2">
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
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            On This Page
          </div>
          <div className="collapse-content">
            <ul className="menu menu-sm p-0 pt-2">
              {tableOfContents.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    className={`
                      font-mono text-[0.65rem] uppercase tracking-wider text-left
                      ${item.level === 2 ? "pl-0" : ""}
                      ${item.level === 3 ? "pl-4" : ""}
                      ${item.level === 4 ? "pl-8" : ""}
                      ${
                        activeHeading === item.id
                          ? "text-primary font-medium"
                          : "text-base-content/60"
                      }
                    `}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderTableOfContents = () => {
    if (tableOfContents.length === 0) return null;

    return (
      <aside className="hidden xl:block w-64 shrink-0">
        <div className="sticky top-24">
          <nav className="border-l-2 border-base-content/10 pl-4">
            <h4 className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-base-content/50 mb-4">
              On This Page
            </h4>
            <ul className="menu menu-xs p-0 [&_li>*]:rounded-none">
              {tableOfContents.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    className={`
                      font-mono text-[0.7rem] uppercase tracking-wider text-left py-2
                      transition-all duration-200
                      ${item.level === 2 ? "pl-0" : ""}
                      ${item.level === 3 ? "pl-3" : ""}
                      ${item.level === 4 ? "pl-6" : ""}
                      ${
                        activeHeading === item.id
                          ? "text-primary font-medium border-l-2 border-primary -ml-[18px] pl-[14px]"
                          : "text-base-content/60 hover:text-base-content"
                      }
                    `}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Reading progress indicator */}
          {post?.reading_time && (
            <div className="mt-8 pt-4 border-t border-base-content/10">
              <div className="flex items-center gap-2 text-base-content/50">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider">
                  {post.reading_time} min read
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  };

  // Loading State
  if (loading) {
    return (
      <HelmetProvider>
        <div className="min-h-screen bg-base-100">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <Helmet>
              <meta charSet="utf-8" />
              <title>Loading... | {meta.title}</title>
            </Helmet>

            {/* Breadcrumb Skeleton */}
            <div className="breadcrumbs text-sm mb-6 pt-20">
              <ul>
                <li>
                  <div className="skeleton h-4 w-16"></div>
                </li>
                <li>
                  <div className="skeleton h-4 w-12"></div>
                </li>
                <li>
                  <div className="skeleton h-4 w-32"></div>
                </li>
              </ul>
            </div>

            <div className="flex gap-8">
              <div className="flex-1 max-w-4xl">
                <div className="skeleton h-12 w-3/4 mb-4"></div>
                <div className="skeleton h-4 w-48 mb-8"></div>
                <div className="skeleton h-64 w-full mb-8"></div>
                <div className="space-y-4">
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-3/4"></div>
                </div>
              </div>
              <aside className="hidden xl:block w-64 shrink-0">
                <div className="skeleton h-48 w-full"></div>
              </aside>
            </div>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  // Error or Not Found State
  if (!isGhostConfigured || error || !post) {
    return (
      <HelmetProvider>
        <div className="min-h-screen bg-base-100">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <Helmet>
              <meta charSet="utf-8" />
              <title>
                {!isGhostConfigured ? "Under Construction" : "Error"} |{" "}
                {meta.title}
              </title>
            </Helmet>

            {renderBreadcrumbs()}

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
        </div>
      </HelmetProvider>
    );
  }

  // Post Content
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto max-w-7xl px-4 py-8">
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

          {renderBreadcrumbs()}

          <div className="flex gap-8">
            {/* Main Content */}
            <article className="flex-1 max-w-4xl animate-[fadeIn_0.3s_ease_forwards]">
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

              {/* Mobile Table of Contents */}
              {renderMobileTableOfContents()}

              {/* Content */}
              <BlogContent html={processedHtml} />

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
            </article>

            {/* Table of Contents Sidebar */}
            {renderTableOfContents()}
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};
