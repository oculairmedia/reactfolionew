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
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Helmet>
            <meta charSet="utf-8" />
            <title>About | {meta.title}</title>
            <meta name="description" content={meta.description} />
          </Helmet>
          <AboutPageSkeleton />
        </div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
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

          {/* About Section */}
          {dataabout && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
              {/* Image Column */}
              <div className="lg:col-span-5">
                <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content/80 py-4">
                  {dataabout.title}
                </h3>
                <img
                  src="https://oculair.b-cdn.net/pages%252Fabout-us%252Fclean-2.jpg"
                  alt="Emmanuel Umukoro"
                  className="w-full h-auto mb-4 hover:contrast-[1.1] transition-all duration-200"
                />
              </div>

              {/* Bio Column */}
              <div className="lg:col-span-7 flex items-center">
                <p className="font-body text-base leading-relaxed text-base-content/90">
                  {dataabout.aboutme}
                </p>
              </div>
            </div>
          )}

          {/* Work Timeline */}
          {worktimeline && worktimeline.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
              <div className="lg:col-span-5">
                <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content/80 py-4">
                  Work Timeline
                </h3>
              </div>
              <div className="lg:col-span-7">
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <tbody>
                      {worktimeline.map((data, i) => (
                        <tr key={i} className="border-b border-base-content/10">
                          <th className="font-mono text-sm font-medium text-base-content">
                            {data.jobtitle}
                          </th>
                          <td className="font-mono text-sm text-base-content/70">
                            {data.where}
                          </td>
                          <td className="font-mono text-sm text-base-content/50">
                            {data.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
              <div className="lg:col-span-5">
                <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content/80 py-4">
                  Skills
                </h3>
              </div>
              <div className="lg:col-span-7 space-y-6">
                {skills.map((data, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-base-content">
                        {data.name}
                      </h4>
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

          {/* Services */}
          {services && services.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
              <div className="lg:col-span-5">
                <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content/80 py-4">
                  Services
                </h3>
              </div>
              <div className="lg:col-span-7 space-y-6">
                {services.map((data, i) => (
                  <div
                    key={i}
                    className="py-4 border-b-2 border-base-content/20"
                  >
                    <h5 className="font-heading text-lg font-bold uppercase tracking-tight text-base-content mb-2">
                      {data.title}
                    </h5>
                    <p className="font-body text-sm text-base-content/70 leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </HelmetProvider>
  );
};
