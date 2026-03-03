import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";

export const Privacy: React.FC = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Privacy Policy | {meta.title}</title>
        <meta name="description" content="Privacy policy for Emmanuel Umukoro's personal applications and services." />
      </Helmet>

      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="animate-[fadeIn_0.3s_ease_forwards]">
            <div className="mb-10 mt-6 md:pt-6">
              <div className="lg:w-2/3">
                <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight text-base-content mb-4">
                  Privacy Policy
                </h1>
                <div className="divider my-4 before:bg-base-content/20 after:bg-base-content/20"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
              <div className="lg:col-span-8 lg:col-start-1">
                <div className="card bg-base-200 shadow-none">
                  <div className="card-body prose prose-sm max-w-none text-base-content/90">
                    <p className="font-mono text-xs uppercase tracking-wider text-base-content/50 mb-6">
                      Last updated: March 2, 2026
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content">
                      Overview
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      This privacy policy describes how Emmanuel Umukoro ("I", "me") handles information
                      in connection with personal applications and integrations hosted at emmanuelu.com. These
                      applications are built for personal use and are not offered as commercial services.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Information Collected
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      My applications may access Google Workspace data (Gmail, Calendar, Drive, Contacts,
                      Docs, Sheets) through OAuth 2.0 authorization. This access is limited to my own
                      account and is used solely for personal productivity and automation purposes.
                    </p>
                    <p className="font-body text-base leading-relaxed">
                      This website may collect basic analytics data such as page views and visit
                      duration. No personally identifiable information is collected from visitors.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      How Information Is Used
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      Any data accessed through Google APIs is used exclusively for personal automation,
                      including email management, calendar scheduling, and document organization. Data is
                      processed locally and is not shared with, sold to, or disclosed to any third parties.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Data Storage & Security
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      OAuth tokens and credentials are stored securely on private infrastructure. No
                      Google user data is stored in publicly accessible locations. Access is restricted to
                      authorized devices only.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Third-Party Services
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      This site is hosted on Vercel. Applications may interact with Google APIs under
                      Google's own privacy policies. No additional third-party services have access to
                      your data.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Google API Disclosure
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      My use and transfer of information received from Google APIs adheres to the{" "}
                      <a
                        href="https://developers.google.com/terms/api-services-user-data-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                      >
                        Google API Services User Data Policy
                      </a>
                      , including the Limited Use requirements.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Contact
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      If you have questions about this privacy policy, reach me at{" "}
                      <a href="mailto:me@emmanuelu.com" className="link link-primary">
                        me@emmanuelu.com
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};
