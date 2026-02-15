import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Image } from "react-bootstrap";
import { meta } from "../content_option";

export const ProjectDetail = ({ title, overview, services, testimonial, image }) => {
  return (
    <HelmetProvider>
      <Container className="About-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title> {title} | {meta.title} </title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4">{title}</h1>
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>
        <Row className="sec_sp">
          <Col lg="5">
            <h3 className="color_sec py-4">Overview</h3>
          </Col>
          <Col lg="7">
            <p>{overview}</p>
          </Col>
        </Row>
        <Row className="sec_sp">
          <Col lg="5">
            <h3 className="color_sec py-4">Services</h3>
          </Col>
          <Col lg="7">
            <ul>
              {services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </Col>
        </Row>
        {testimonial && (
          <Row className="sec_sp">
            <Col lg="5">
              <h3 className="color_sec py-4">Client Testimonial</h3>
            </Col>
            <Col lg="7">
              <blockquote>
                "{testimonial.quote}"
              </blockquote>
              <p>- {testimonial.author}, {testimonial.company}</p>
            </Col>
          </Row>
        )}
        <Row className="sec_sp">
          <Col lg="5">
            <h3 className="color_sec py-4">Project Image</h3>
          </Col>
          <Col lg="7">
            <Image src={image} alt={title} fluid />
          </Col>
        </Row>
      </Container>
    </HelmetProvider>
  );
};