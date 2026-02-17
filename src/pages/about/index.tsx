import React, { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";
import { getAboutPage } from "../../utils/payloadApi";
import { AboutPageSkeleton } from "../../components/SkeletonLoader";
import type { TimelineEntry, Skill, Service } from "../../types";

export const About = () => {
  const [dataabout, setDataAbout] = useState<{
    title: string;
    aboutme: string;
  } | null>(null);
  const [worktimeline, setWorkTimeline] = useState<TimelineEntry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const aboutData = await getAboutPage();

        setDataAbout({
          title: aboutData.title,
          aboutme: aboutData.aboutme,
        });
        setWorkTimeline(aboutData.timeline || []);
        setSkills(aboutData.skills || []);
        setServices(aboutData.services || []);
      } catch {
        const module = await import("../../content_option");
        setDataAbout(module.dataabout);
        setWorkTimeline(module.worktimeline);
        setSkills(module.skills);
        setServices(module.services);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <HelmetProvider>
        <div className="min-h-screen bg-base-100">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <Helmet>
              <meta charSet="utf-8" />
              <title>About | {meta.title}</title>
              <meta name="description" content={meta.description} />
            </Helmet>
            <AboutPageSkeleton />
          </div>
        </div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Helmet>
            <meta charSet="utf-8" />
            <title>About | {meta.title}</title>
            <meta name="description" content={meta.description} />
          </Helmet>

          <div className="animate-[fadeIn_0.3s_ease_forwards]">
            {/* Header */}
            <div className="mb-10 mt-6 md:pt-6">
              <div className="lg:w-2/3">
                <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight text-base-content mb-4">
                  About me
                </h1>
                <div className="divider my-4 before:bg-base-content/20 after:bg-base-content/20"></div>
              </div>
            </div>

            {/* About Section with Avatar */}
            {dataabout && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                {/* Image Column with Avatar */}
                <div className="lg:col-span-5">
                  <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content/80 py-4">
                    {dataabout.title}
                  </h3>
                  <div className="avatar">
                    <div className="w-full">
                      <img
                        src="https://oculair.b-cdn.net/pages%252Fabout-us%252Fclean-2.jpg"
                        alt="Emmanuel Umukoro"
                        className="w-full h-auto hover:contrast-[1.1] transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio Column */}
                <div className="lg:col-span-7 flex items-center">
                  <div className="card bg-base-200 shadow-none">
                    <div className="card-body">
                      <p className="font-body text-base leading-relaxed text-base-content/90">
                        {dataabout.aboutme}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Work Timeline - Using DaisyUI Timeline */}
            {worktimeline && worktimeline.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                <div className="lg:col-span-5">
                  <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content/80 py-4">
                    Work Timeline
                  </h3>
                </div>
                <div className="lg:col-span-7">
                  <ul className="timeline timeline-vertical timeline-compact">
                    {worktimeline.map((data, i) => (
                      <li key={i}>
                        {i > 0 && <hr className="bg-base-content/20" />}
                        <div className="timeline-start font-mono text-sm text-base-content/50">
                          {data.date}
                        </div>
                        <div className="timeline-middle">
                          <div className="badge badge-primary badge-xs"></div>
                        </div>
                        <div className="timeline-end timeline-box bg-base-200 border-base-content/10">
                          <h4 className="font-heading font-bold text-base-content">
                            {data.jobtitle}
                          </h4>
                          <p className="font-mono text-sm text-base-content/70">
                            {data.where}
                          </p>
                        </div>
                        {i < worktimeline.length - 1 && (
                          <hr className="bg-base-content/20" />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Skills with Progress Bars */}
            {skills && skills.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                <div className="lg:col-span-5">
                  <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content/80 py-4">
                    Skills
                  </h3>
                </div>
                <div className="lg:col-span-7 space-y-6">
                  {skills.map((data, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-base-content">
                            {data.name}
                          </h4>
                          {data.value >= 90 && (
                            <span className="badge badge-success badge-xs">
                              Expert
                            </span>
                          )}
                          {data.value >= 70 && data.value < 90 && (
                            <span className="badge badge-info badge-xs">
                              Advanced
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[0.65rem] font-medium text-base-content/70">
                          {data.value}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary w-full h-[3px]"
                        value={data.value}
                        max="100"
                      ></progress>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services as Cards */}
            {services && services.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                <div className="lg:col-span-5">
                  <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content/80 py-4">
                    Services
                  </h3>
                </div>
                <div className="lg:col-span-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((data, i) => (
                      <div
                        key={i}
                        className="card bg-base-200 border-2 border-base-content/10 hover:border-primary/50 transition-colors duration-200"
                      >
                        <div className="card-body p-5">
                          <div className="flex items-start gap-3">
                            <div className="badge badge-primary badge-lg mt-1">
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
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h5 className="card-title font-heading text-base font-bold uppercase tracking-tight text-base-content">
                                {data.title}
                              </h5>
                              <p className="font-body text-sm text-base-content/70 leading-relaxed mt-2">
                                {data.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Section */}
            <div className="divider my-8"></div>

            <div className="stats stats-vertical lg:stats-horizontal bg-base-200 w-full">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="stat-title font-mono text-xs uppercase tracking-wider">
                  Years Experience
                </div>
                <div className="stat-value font-heading">10+</div>
                <div className="stat-desc font-mono text-xs">
                  In creative technology
                </div>
              </div>

              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="stat-title font-mono text-xs uppercase tracking-wider">
                  Projects Completed
                </div>
                <div className="stat-value font-heading">50+</div>
                <div className="stat-desc font-mono text-xs">
                  Across various industries
                </div>
              </div>

              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="stat-title font-mono text-xs uppercase tracking-wider">
                  Clients Worldwide
                </div>
                <div className="stat-value font-heading">30+</div>
                <div className="stat-desc font-mono text-xs">
                  Happy collaborations
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};
