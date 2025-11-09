import React, { useEffect } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { dataportfolio, meta, portfolioPage } from "../../content_option";
import PortfolioItem from "../../components/PortfolioItem";

export const Portfolio = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <HelmetProvider>
      <Container className="About-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title> Portfolio | {meta.title} </title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4">{portfolioPage.title}</h1>
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>
        <div className="mb-5 po_items_ho">
          {dataportfolio.map((data, i) => (
            <PortfolioItem key={i} data={data} index={i} />
          ))}
        </div>
      </Container>
    </HelmetProvider>
  );
};
