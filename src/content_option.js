import { optimizeImage } from './utils/cdnHelper';

// Import content from CMS-managed JSON files
import siteSettings from './content/settings/site-settings.json';
import homeData from './content/intro/home.json';
import aboutData from './content/about/about.json';
import navigationData from './content/settings/navigation.json';
import footerData from './content/settings/footer.json';
import portfolioPageData from './content/pages/portfolio.json';
import contactPageData from './content/pages/contact.json';
import uiTextData from './content/pages/ui-text.json';

// Import all portfolio items
import coupleIsh from './content/portfolio/couple-ish.json';
import vhbTapes from './content/portfolio/3m-vhb-tapes.json';
import binmetrics from './content/portfolio/binmetrics.json';
import branton from './content/portfolio/branton.json';
import aquaticResonance from './content/portfolio/aquatic-resonance.json';
import voicesUnheard from './content/portfolio/voices-unheard.json';
import superBurgers from './content/portfolio/super-burgers.json';
import merchantAle from './content/portfolio/merchant-ale-house.json';
import lieblingWines from './content/portfolio/liebling-wines.json';
import gardenCity from './content/portfolio/garden-city-essentials.json';
import coffeeAltitude from './content/portfolio/coffee-by-altitude.json';

// Extract data from imported JSON
const logotext = siteSettings.logotext;
const meta = siteSettings.meta;

// Transform animated phrases array to the expected format
const animatedPhrases = homeData.animated.reduce((acc, item, index) => {
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
}, {});

const introdata = {
    title: homeData.title,
    animated: animatedPhrases,
    description: homeData.description,
    your_img_url: homeData.image_url,
};

const dataabout = {
    title: aboutData.title,
    aboutme: aboutData.aboutme,
};

const worktimeline = aboutData.timeline;
const skills = aboutData.skills;
const services = aboutData.services;

// Process portfolio items and apply image optimization where needed
const processPortfolioItem = (item) => {
    // Create a copy of the item
    const processed = { ...item };

    // If the image URL is from CDN and doesn't have optimization params, apply optimization
    if (processed.img && processed.img.includes('oculair.b-cdn.net') && !processed.img.includes('width=')) {
        processed.img = optimizeImage(processed.img, { width: 800, quality: 85 });
    } else if (processed.img && processed.img.includes('oculair.b-cdn.net') && processed.img.includes('width=')) {
        processed.img = optimizeImage(processed.img, { width: 800, quality: 80 });
    }

    return processed;
};

// Combine all portfolio items into a single array and apply image optimization
const dataportfolio = [
    processPortfolioItem(coupleIsh),
    processPortfolioItem(vhbTapes),
    processPortfolioItem(binmetrics),
    processPortfolioItem(branton),
    processPortfolioItem(aquaticResonance),
    processPortfolioItem(voicesUnheard),
    processPortfolioItem(superBurgers),
    processPortfolioItem(merchantAle),
    processPortfolioItem(lieblingWines),
    processPortfolioItem(gardenCity),
    processPortfolioItem(coffeeAltitude)
];

const contactConfig = {
    YOUR_EMAIL: siteSettings.contact.email,
    description: siteSettings.contact.description,
    YOUR_SERVICE_ID: siteSettings.contact.serviceId,
    YOUR_TEMPLATE_ID: siteSettings.contact.templateId,
    YOUR_USER_ID: "user_id",
    YOUR_PUBLIC_KEY: siteSettings.contact.publicKey,
};

const socialprofils = siteSettings.social;

// Navigation and footer
const navigation = navigationData;
const footer = footerData;

// Page content
const portfolioPage = portfolioPageData;
const contactPage = contactPageData;
const uiText = uiTextData;

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
};
