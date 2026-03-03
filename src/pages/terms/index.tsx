import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link } from "@tanstack/react-router";
import { meta } from "../../content_option";

export const Terms: React.FC = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Terms of Service | {meta.title}</title>
        <meta name="description" content="Terms of service for Emmanuel Umukoro's personal applications and services." />
      </Helmet>

      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="animate-[fadeIn_0.3s_ease_forwards]">
            <div className="mb-10 mt-6 md:pt-6">
              <div className="lg:w-2/3">
                <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight text-base-content mb-4">
                  Terms of Service
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
                      Agreement
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      By accessing emmanuelu.com or any associated applications, you agree to these terms.
                      If you do not agree, please do not use the site.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Personal Use
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      This website and its connected applications are personal projects maintained by
                      Emmanuel Umukoro. They are not offered as commercial products or services. Google
                      Workspace integrations are authorized for personal account use only.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Intellectual Property
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      All content on this site — including text, images, designs, and code — is owned by
                      Emmanuel Umukoro unless otherwise noted. You may not reproduce, distribute, or
                      create derivative works without written permission.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Disclaimer
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      This site and all associated applications are provided "as is" without warranties
                      of any kind, express or implied. I make no guarantees regarding availability,
                      accuracy, or fitness for any particular purpose.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Limitation of Liability
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      To the fullest extent permitted by law, Emmanuel Umukoro shall not be liable for
                      any damages arising from the use of this site or its applications.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Changes
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      These terms may be updated at any time. Continued use of the site after changes
                      constitutes acceptance of the revised terms.
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Privacy
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      Your use of this site is also governed by the{" "}
                      <Link to="/privacy" className="link link-primary">
                        Privacy Policy
                      </Link>
                      .
                    </p>

                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-base-content mt-8">
                      Contact
                    </h2>
                    <p className="font-body text-base leading-relaxed">
                      Questions about these terms? Reach me at{" "}
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
