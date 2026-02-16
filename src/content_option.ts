import { optimizeImage } from './utils/cdnHelper';
import type {
  SiteSettings,
  HomeIntro,
  AboutData,
  NavigationItem,
  FooterData,
  PortfolioItem,
  PortfolioPageContent,
  ContactPageContent,
  UiText,
  TransformedIntroData,
  ContactConfig,
  SocialProfiles,
  MetaInfo,
  TimelineEntry,
  Skill,
  Service,
  Project,
} from './types';

import siteSettings from './content/settings/site-settings.json';
import homeData from './content/intro/home.json';
import aboutData from './content/about/about.json';
import navigationData from './content/settings/navigation.json';
import footerData from './content/settings/footer.json';
import portfolioPageData from './content/pages/portfolio.json';
import contactPageData from './content/pages/contact.json';
import uiTextData from './content/pages/ui-text.json';

type GlobModule = Record<string, { default?: PortfolioItem } & Record<string, unknown>>;
type ProjectGlobModule = Record<string, { default?: Project } & Record<string, unknown>>;

const portfolioModules: GlobModule = import.meta.glob('./content/portfolio/*.json', { eager: true });
const portfolioItems: PortfolioItem[] = [];

Object.entries(portfolioModules).forEach(([_path, module]) => {
  portfolioItems.push((module.default || module) as PortfolioItem);
});

const projectsModules: ProjectGlobModule = import.meta.glob('./content/projects/*.json', { eager: true });
const projectPages: Record<string, Project> = {};

Object.entries(projectsModules).forEach(([path, module]) => {
  const projectId = path.replace('./content/projects/', '').replace('.json', '');
  projectPages[projectId] = (module.default || module) as Project;
});

const logotext: string = (siteSettings as SiteSettings).logotext;
const meta: MetaInfo = (siteSettings as SiteSettings).meta;

const animatedPhrases: Record<string, string> = (homeData as HomeIntro).animated.reduce(
  (acc: Record<string, string>, item: { text: string }, index: number) => {
    const keys = [
      'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
      'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth',
      'eighteenth', 'nineteenth', 'twentieth', 'twentyFirst', 'twentySecond', 'twentyThird',
      'twentyFourth', 'twentyFifth', 'twentySixth', 'twentySeventh', 'twentyEighth', 'twentyNinth',
      'thirtieth', 'thirtyFirst', 'thirtySecond', 'thirtyThird', 'thirtyFourth', 'thirtyFifth',
      'thirtySixth', 'thirtySeventh', 'thirtyEighth', 'thirtyNinth', 'fortieth', 'fortyFirst',
      'fortySecond', 'fortyThird', 'fortyFourth', 'fortyFifth', 'fortySixth', 'fortySeventh',
      'fortyEighth', 'fortyNinth', 'fiftieth', 'fiftyFirst', 'fiftySecond', 'fiftyThird'
    ];
    if (index < keys.length) {
      acc[keys[index]] = item.text;
    }
    return acc;
  },
  {}
);

const introdata: TransformedIntroData = {
  title: (homeData as HomeIntro).title,
  animated: animatedPhrases,
  description: (homeData as HomeIntro).description,
  your_img_url: (homeData as HomeIntro).image_url,
};

const dataabout = {
  title: (aboutData as AboutData).title,
  aboutme: (aboutData as AboutData).aboutme,
};

const worktimeline: TimelineEntry[] = (aboutData as AboutData).timeline || [];
const skills: Skill[] = (aboutData as AboutData).skills || [];
const services: Service[] = (aboutData as AboutData).services || [];

const processPortfolioItem = (item: PortfolioItem): PortfolioItem => {
  const processed = { ...item };

  if (processed.img && processed.img.includes('oculair.b-cdn.net') && !processed.img.includes('width=')) {
    processed.img = optimizeImage(processed.img, { width: 800, quality: 85 });
  } else if (processed.img && processed.img.includes('oculair.b-cdn.net') && processed.img.includes('width=')) {
    processed.img = optimizeImage(processed.img, { width: 800, quality: 80 });
  }

  return processed;
};

const dataportfolio: PortfolioItem[] = portfolioItems
  .map(processPortfolioItem)
  .sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 999;
    const orderB = b.order !== undefined ? b.order : 999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (b.date || '').localeCompare(a.date || '');
  });

const contactConfig: ContactConfig = {
  YOUR_EMAIL: (siteSettings as SiteSettings).contact.email,
  description: (siteSettings as SiteSettings).contact.description,
  YOUR_SERVICE_ID: (siteSettings as SiteSettings).contact.serviceId,
  YOUR_TEMPLATE_ID: (siteSettings as SiteSettings).contact.templateId,
  YOUR_USER_ID: "user_id",
  YOUR_PUBLIC_KEY: (siteSettings as SiteSettings).contact.publicKey,
};

const socialprofils: SocialProfiles = (siteSettings as SiteSettings).social;

const navigation = navigationData as NavigationItem[];
const footer = footerData as FooterData;

const portfolioPage = portfolioPageData as PortfolioPageContent;
const contactPage = contactPageData as ContactPageContent;
const uiText = uiTextData as UiText;

export {
  meta,
  dataabout,
  dataportfolio,
  worktimeline,
  skills,
  services,
  introdata,
  contactConfig,
  socialprofils,
  logotext,
  navigation,
  footer,
  portfolioPage,
  contactPage,
  uiText,
  projectPages,
};
