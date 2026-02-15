import React, { useEffect, useState } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Badge, Spinner, Alert, Button } from "react-bootstrap";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { meta } from "../../content_option";
import { getPostBySlug, isGhostConfigured } from "../../services/ghostApi";

export const BlogPost = () => {
  const { slug } = useParams({ strict: false });
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(!isGhostConfigured ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isGhostConfigured) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostBySlug(slug);
        setPost(data);
        setError(null);
      } catch {
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <HelmetProvider>
        <Container className="Blog-header">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Loading... | {meta.title}</title>
          </Helmet>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading post...</p>
          </div>
        </Container>
      </HelmetProvider>
    );
  }

  if (!isGhostConfigured || error || !post) {
    return (
      <HelmetProvider>
        <Container className="Blog-header">
          <Helmet>
            <meta charSet="utf-8" />
            <title>{!isGhostConfigured ? 'Under Construction' : 'Error'} | {meta.title}</title>
          </Helmet>
          <div className="content-container">
            {!isGhostConfigured ? (
              <div className="text-center py-5">
                <h2>Under Construction</h2>
                <p className="text-muted mt-3">The blog is being set up. Check back soon.</p>
              </div>
            ) : (
              <Alert variant="danger">
                {error || 'Post not found'}
              </Alert>
            )}
            <Button variant="primary" onClick={() => navigate('/blog')}>
              Back to Blog
            </Button>
          </div>
        </Container>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <Container className="Blog-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title>{post.title} | {meta.title}</title>
          <meta name="description" content={post.custom_excerpt || post.excerpt || post.title} />
          {post.og_image && <meta property="og:image" content={post.og_image} />}
          {post.twitter_image && <meta name="twitter:image" content={post.twitter_image} />}
        </Helmet>

        <div className="blog-back-button">
          <Link to="/blog" className="blog-back-btn">
            ← Back to Blog
          </Link>
        </div>

        <div className="content-container">
          <Row>
            <Col lg="10" className="mx-auto">
              <article className="blog-post">
                <header className="blog-post-header">
                  <h1 className="blog-post-title">{post.title}</h1>

                  <div className="blog-post-meta mb-3">
                    <span>{formatDate(post.published_at)}</span>
                    {post.reading_time && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{post.reading_time} min read</span>
                      </>
                    )}
                    {post.primary_author && (
                      <>
                        <span className="mx-2">•</span>
                        <span>by {post.primary_author.name}</span>
                      </>
                    )}
                  </div>

                  <div className="mb-3">
                    {post.tags && post.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        bg="secondary"
                        className="me-1 mb-1"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>

                  {post.feature_image && (
                    <img
                      src={post.feature_image}
                      alt={post.title}
                      className="blog-post-featured-image"
                    />
                  )}
                </header>

                <div
                  className="blog-post-content"
                  dangerouslySetInnerHTML={{ __html: post.html }}
                />

                {post.primary_author && (
                  <div className="blog-author-info">
                    {post.primary_author.profile_image && (
                      <img
                        src={post.primary_author.profile_image}
                        alt={post.primary_author.name}
                        className="blog-author-avatar"
                      />
                    )}
                    <div className="blog-author-details">
                      <h5>{post.primary_author.name}</h5>
                      {post.primary_author.bio && (
                        <p>{post.primary_author.bio}</p>
                      )}
                    </div>
                  </div>
                )}
              </article>
            </Col>
          </Row>
        </div>
      </Container>
    </HelmetProvider>
  );
};
