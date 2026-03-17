import type React from "react";

type LazyComponentLoader = () => Promise<{ default: React.ComponentType }>;

export const loadHome: LazyComponentLoader = () =>
  import("../pages/home").then((m) => ({ default: m.Home }));
export const loadPortfolio: LazyComponentLoader = () =>
  import("../pages/portfolio").then((m) => ({ default: m.Portfolio }));
export const loadAbout: LazyComponentLoader = () =>
  import("../pages/about").then((m) => ({ default: m.About }));
export const loadBlog: LazyComponentLoader = () =>
  import("../pages/blog").then((m) => ({ default: m.Blog }));
export const loadBlogPost: LazyComponentLoader = () =>
  import("../pages/blog/BlogPost").then((m) => ({ default: m.BlogPost }));
export const loadProject: LazyComponentLoader = () =>
  import("../components/DynamicProjectPage");
export const loadLinks: LazyComponentLoader = () =>
  import("../pages/links").then((m) => ({ default: m.Links }));
export const loadPrivacy: LazyComponentLoader = () =>
  import("../pages/privacy").then((m) => ({ default: m.Privacy }));
export const loadTerms: LazyComponentLoader = () =>
  import("../pages/terms").then((m) => ({ default: m.Terms }));
