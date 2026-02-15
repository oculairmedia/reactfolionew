import React, { useState } from "react";
import * as emailjs from "emailjs-com";
import "./ContactFooter.css";
import { contactConfig, contactPage } from "../../content_option";
import { Container, Row, Col, Alert } from "react-bootstrap";

export const ContactFooter = () => {
  const [formData, setFormdata] = useState({
    email: "",
    name: "",
    message: "",
    loading: false,
    show: false,
    alertmessage: "",
    variant: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormdata({ ...formData, loading: true });

    const templateParams = {
      from_name: formData.email,
      user_name: formData.name,
      to_name: contactConfig.YOUR_EMAIL,
      message: formData.message,
    };

    emailjs
      .send(
        contactConfig.YOUR_SERVICE_ID,
        contactConfig.YOUR_TEMPLATE_ID,
        templateParams,
        contactConfig.YOUR_PUBLIC_KEY
      )
      .then(
        (result) => {
          console.log(result.text);
          setFormdata({
            email: "",
            name: "",
            message: "",
            loading: false,
            alertmessage: contactPage.successMessage,
            variant: "success",
            show: true,
          });
        },
        (error) => {
          console.log(error.text);
          setFormdata({
            ...formData,
            alertmessage: `Failed to send! ${error.text}`,
            variant: "danger",
            show: true,
            loading: false,
          });
        }
      );
  };

  const handleChange = (e) => {
    setFormdata({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <footer id="contact-footer" className="contact-footer">
      <Container>
        <Row className="sec_sp">
          <Col lg="12">
            {formData.show && (
              <Alert
                variant={formData.variant}
                className="rounded-0 co_alert"
                onClose={() => setFormdata({ ...formData, show: false })}
                dismissible
              >
                <p className="my-0">{formData.alertmessage}</p>
              </Alert>
            )}
          </Col>
          <Col lg="5" className="mb-5">
            <h3 className="color_sec py-4">{contactPage.sectionTitle || "Get In Touch"}</h3>
            <address>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${contactConfig.YOUR_EMAIL}`}>
                {contactConfig.YOUR_EMAIL}
              </a>
              <br />
              <br />
              {contactConfig.hasOwnProperty("YOUR_FONE") && (
                <p>
                  <strong>Phone:</strong> {contactConfig.YOUR_FONE}
                </p>
              )}
            </address>
            <p>{contactConfig.description}</p>
          </Col>
          <Col lg="7" className="d-flex align-items-center">
            <form onSubmit={handleSubmit} className="contact__form w-100">
              <Row>
                <Col lg="6" className="form-group">
                  <input
                    className="form-control"
                    id="footer-name"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    type="text"
                    required
                    onChange={handleChange}
                  />
                </Col>
                <Col lg="6" className="form-group">
                  <input
                    className="form-control rounded-0"
                    id="footer-email"
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    required
                    onChange={handleChange}
                  />
                </Col>
              </Row>
              <textarea
                className="form-control rounded-0"
                id="footer-message"
                name="message"
                placeholder="Message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <br />
              <Row>
                <Col lg="12" className="form-group">
                  <button className="btn ac_btn" type="submit" disabled={formData.loading}>
                    {formData.loading ? (contactPage.sendingText || "Sending...") : (contactPage.submitButton || "Send Message")}
                  </button>
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </Container>
      {formData.loading && <div className="loading-bar"></div>}
    </footer>
  );
};
