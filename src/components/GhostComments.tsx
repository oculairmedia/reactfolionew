import { useEffect, useRef } from "react";

const COMMENTS_UI_SRC =
  "https://cdn.jsdelivr.net/ghost/comments-ui@~1.3/umd/comments-ui.min.js";
const PORTAL_SRC =
  "https://cdn.jsdelivr.net/ghost/portal@~2.0/umd/portal.min.js";

interface GhostCommentsProps {
  postId: string;
  siteUrl: string;
  apiKey: string;
}

function injectPortalOnce(siteUrl: string, apiKey: string): void {
  if (document.querySelector('script[data-ghost]')) return;

  const portal = document.createElement("script");
  portal.src = PORTAL_SRC;
  portal.defer = true;
  portal.crossOrigin = "anonymous";
  portal.setAttribute("data-ghost", `${siteUrl}/`);
  portal.setAttribute("data-key", apiKey);
  portal.setAttribute("data-api", `${siteUrl}/ghost/api/content/`);
  document.body.appendChild(portal);
}

export const GhostComments: React.FC<GhostCommentsProps> = ({
  postId,
  siteUrl,
  apiKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!postId || !containerRef.current) return;

    injectPortalOnce(siteUrl, apiKey);

    const script = document.createElement("script");
    script.src = COMMENTS_UI_SRC;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.setAttribute("data-ghost-comments", `${siteUrl}/`);
    script.setAttribute("data-api", `${siteUrl}/ghost/api/content/`);
    script.setAttribute("data-admin", `${siteUrl}/ghost/`);
    script.setAttribute("data-key", apiKey);
    script.setAttribute("data-post-id", postId);
    script.setAttribute("data-color-scheme", "auto");

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [postId, siteUrl, apiKey]);

  return <div ref={containerRef} />;
};
