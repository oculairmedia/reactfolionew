import React, { useEffect, useState } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { meta, portfolioPage } from "../../content_option";
import { getPortfolioItems } from "../../utils/payloadApi";
import PortfolioItem from "../../components/PortfolioItem";
import { PortfolioPageSkeleton } from "../../components/SkeletonLoader";

export const Portfolio = () => {
  const [dataportfolio, setDataPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch portfolio items from CMS
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const portfolioData = await getPortfolioItems();
        setDataPortfolio(portfolioData);
      } catch {
        // Fallback to static data if CMS fails
        import('../../content_option').then(module => {
          setDataPortfolio(module.dataportfolio);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  return (
    <HelmetProvider>
      <Container className="About-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title> Portfolio | {meta.title} </title>
          <meta name="description" content={meta.description} />
        </Helmet>
        {loading ? (
          <div className="skeleton-container">
            <PortfolioPageSkeleton count={8} />
          </div>
        ) : (
          <div className="content-container">
            <Row className="mb-5 mt-3 pt-md-3">
              <Col lg="8">
                <h1 className="display-4 mb-4">{portfolioPage.title}</h1>
                <hr className="t_border my-4 ml-0 text-left" />
              </Col>
            </Row>
            <div className="mb-5 po_items_ho">
              {dataportfolio && dataportfolio.length > 0 ? (
                dataportfolio.map((data, i) => (
                  <PortfolioItem key={data.id || i} data={data} index={i} />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>No portfolio items available</div>
              )}
            </div>
          </div>
        )}
      </Container>
    </HelmetProvider>
  );
};
