import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link } from "@tanstack/react-router";
import { meta } from "../../content_option";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
} from "react-icons/fa";
import {
  HiOutlineMail,
  HiOutlineCollection,
  HiOutlinePencilAlt,
} from "react-icons/hi";

interface LinkCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  url?: string;
  to?: string;
  className?: string;
  bgImage?: string;
}

const LinkCard: React.FC<LinkCardProps> = ({
  title,
  subtitle,
  icon,
  url,
  to,
  className = "",
}) => {
  const content = (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="flex justify-between items-start">
        {icon && <div className="text-3xl mb-4">{icon}</div>}
      </div>
      <div>
        <h3 className="font-heading text-xl font-bold uppercase tracking-tight mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="font-mono text-xs opacity-70 uppercase tracking-widest">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  const commonClasses = `bento-card bg-base-100 h-full w-full block text-base-content hover:text-primary transition-colors ${className}`;

  if (to) {
    return (
      <Link to={to} className={commonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={commonClasses}
    >
      {content}
    </a>
  );
};

export const Links: React.FC = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Links | {meta.title}</title>
      </Helmet>

      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="animate-[fadeIn_0.3s_ease_forwards]">
            <div className="mb-10 mt-6 md:pt-6">
              <div className="lg:w-2/3">
                <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight text-base-content mb-4">
                  Links
                </h1>
                <div className="divider my-4 before:bg-base-content/20 after:bg-base-content/20"></div>
              </div>
            </div>

            <div className="bento-grid">
              <div className="bento-card col-span-1 md:col-span-2 row-span-2 bg-base-100 flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="avatar">
                  <div className="w-32 border-4 border-base-content">
                    <img
                      src="https://oculair.b-cdn.net/pages%252Fabout-us%252Fclean-2.jpg"
                      alt="Emmanuel Umukoro"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="font-heading text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">
                    Emmanuel Umukoro
                  </h2>
                  <div className="badge badge-outline p-4 font-mono text-xs uppercase tracking-widest">
                    Creative Technologist & Designer
                  </div>
                </div>
              </div>

              <LinkCard
                title="GitHub"
                subtitle="@oculairmedia"
                icon={<FaGithub />}
                url="https://github.com/oculairmedia"
                className="col-span-1"
              />

              <LinkCard
                title="LinkedIn"
                subtitle="Connect with me"
                icon={<FaLinkedin />}
                url="https://www.linkedin.com/in/emmanuel-umukoro-50b45597"
                className="col-span-1"
              />

              <LinkCard
                title="X / Twitter"
                subtitle="@emanuvaderland"
                icon={<FaTwitter />}
                url="https://x.com/emanuvaderland"
                className="col-span-1"
              />

              <LinkCard
                title="Portfolio"
                subtitle="View my work"
                icon={<HiOutlineCollection />}
                to="/portfolio"
                className="col-span-1 md:col-span-2 bg-base-200"
              />

              <LinkCard
                title="Blog"
                subtitle="Read my thoughts"
                icon={<HiOutlinePencilAlt />}
                to="/blog"
                className="col-span-1"
              />

              <LinkCard
                title="Email Me"
                subtitle="me@emmanuelu.com"
                icon={<HiOutlineMail />}
                url="mailto:me@emmanuelu.com"
                className="col-span-1"
              />

              <LinkCard
                title="Facebook"
                subtitle="Follow me"
                icon={<FaFacebook />}
                url="https://www.facebook.com/emmanuel.umukoro"
                className="col-span-1"
              />
            </div>
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};
