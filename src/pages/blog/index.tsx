import React, { useEffect, useState } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Card, Badge, Spinner, Alert } from "react-bootstrap";
import { Link } from "@tanstack/react-router";
import { meta } from "../../content_option";
import { getPosts, isGhostConfigured } from "../../services/ghostApi";
import type { GhostPost } from "@tryghost/content-api";

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<GhostPost[]>([]);
  const [loading, setLoading] = useState<boolean>(!isGhostConfigured ? false : true);
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
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getExcerpt = (post: GhostPost): string => {
    return post.custom_excerpt || post.excerpt || '';
  };

  return (
    <HelmetProvider>
      <Container className="Blog-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Blog | {meta.title}</title>
          <meta name="description" content="Read the latest articles and insights" />
        </Helmet>
        <div className="content-container">
          <Row className="mb-5 mt-3 pt-md-3">
            <Col lg="8">
              <h1 className="display-4 mb-4">Blog</h1>
              <hr className="t_border my-4 ml-0 text-left" />
            </Col>
          </Row>

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading posts...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          {!isGhostConfigured && (
            <div className="text-center py-5">
              <h2>Under Construction</h2>
              <p className="text-muted mt-3">The blog is being set up. Check back soon.</p>
            </div>
          )}

          {isGhostConfigured && !loading && !error && posts.length === 0 && (
            <Alert variant="info">
              No blog posts available at the moment.
            </Alert>
          )}

          {!loading && !error && posts.length > 0 && (
            <Row className="mb-5">
              {posts.map((post) => (
                <Col lg="4" md="6" className="mb-4" key={post.id}>
                  <Card className="blog-card">
                    {post.feature_image && (
                      <Link to={`/blog/${post.slug}`}>
                        <Card.Img
                          variant="top"
                          src={post.feature_image}
                          alt={post.title}
                          className="blog-card-img"
                        />
                      </Link>
                    )}
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-2">
                        {post.tags && post.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            bg="secondary"
                            className="me-1 mb-1"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {post.tags && post.tags.length > 3 && (
                          <Badge bg="outline-secondary" className="me-1 mb-1 tag-overflow">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <Card.Title>
                        <Link to={`/blog/${post.slug}`} className="blog-title-link">
                          {post.title}
                        </Link>
                      </Card.Title>
                      <Card.Text className="blog-excerpt">
                        {getExcerpt(post)}
                      </Card.Text>
                      <div className="mt-auto">
                        <div className="blog-meta text-muted">
                          <small>{formatDate(post.published_at)}</small>
                          {post.reading_time && (
                            <>
                              <span className="mx-2">•</span>
                              <small>{post.reading_time} min read</small>
                            </>
                          )}
                        </div>
                        <Link to={`/blog/${post.slug}`} className="blog-read-more-link mt-3">
                          Read Article <span className="arrow">→</span>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Container>
    </HelmetProvider>
  );
};
