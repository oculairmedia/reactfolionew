import React, { useEffect, useState } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Image } from "react-bootstrap";
import { meta } from "../../content_option";
import { getAboutPage } from "../../utils/payloadApi";
import { AboutPageSkeleton } from "../../components/SkeletonLoader";

export const About = () => {
  const [dataabout, setDataAbout] = useState(null);
  const [worktimeline, setWorkTimeline] = useState([]);
  const [skills, setSkills] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch about page data from CMS
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const aboutData = await getAboutPage();

        setDataAbout({
          title: aboutData.title,
          aboutme: aboutData.aboutme
        });
        setWorkTimeline(aboutData.timeline || []);
        setSkills(aboutData.skills || []);
        setServices(aboutData.services || []);
      } catch (error) {
        console.error('Error fetching about data:', error);
        // Fallback to static data if CMS fails
        import('../../content_option').then(module => {
          setDataAbout(module.dataabout);
          setWorkTimeline(module.worktimeline);
          setSkills(module.skills);
          setServices(module.services);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <HelmetProvider>
        <Container className="About-header">
          <Helmet>
            <meta charSet="utf-8" />
            <title> About | {meta.title}</title>
            <meta name="description" content={meta.description} />
          </Helmet>
          <AboutPageSkeleton />
        </Container>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <Container className="About-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title> About | {meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4">About me</h1>
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>
        {dataabout && (
          <Row className="sec_sp">
            <Col lg="5">
              <h3 className="color_sec py-4">{dataabout.title}</h3>
              <Image src="https://oculair.b-cdn.net/pages%252Fabout-us%252Fclean-2.jpg" alt="Emmanuel Umukoro" fluid className="about-image mb-4" />
            </Col>
            <Col lg="7" className="d-flex align-items-center">
              <div>
                <p>{dataabout.aboutme}</p>
              </div>
            </Col>
          </Row>
        )}
        {worktimeline && worktimeline.length > 0 && (
          <Row className=" sec_sp">
            <Col lg="5">
              <h3 className="color_sec py-4">Work Timeline</h3>
            </Col>
            <Col lg="7">
              <table className="table caption-top">
                <tbody>
                  {worktimeline.map((data, i) => {
                    return (
                      <tr key={i}>
                        <th scope="row">{data.jobtitle}</th>
                        <td>{data.where}</td>
                        <td>{data.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Col>
          </Row>
        )}
        {skills && skills.length > 0 && (
          <Row className="sec_sp">
            <Col lg="5">
              <h3 className="color_sec py-4">Skills</h3>
            </Col>
            <Col lg="7">
              {skills.map((data, i) => {
                return (
                  <div key={i}>
                    <h3 className="progress-title">{data.name}</h3>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${data.value}%`,
                        }}
                      >
                        <div className="progress-value">{data.value}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Col>
          </Row>
        )}
        {services && services.length > 0 && (
          <Row className="sec_sp">
            <Col lang="5">
              <h3 className="color_sec py-4">Services</h3>
            </Col>
            <Col lg="7">
              {services.map((data, i) => {
                return (
                  <div className="service_ py-4" key={i}>
                    <h5 className="service__title">{data.title}</h5>
                    <p className="service_desc">{data.description}</p>
                  </div>
                );
              })}
            </Col>
          </Row>
        )}
      </Container>
    </HelmetProvider>
  );
};
