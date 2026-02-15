import { GlobalConfig } from 'payload/types';

const UIText: GlobalConfig = {
  slug: 'ui-text',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'viewAllProjects',
      type: 'text',
      label: 'View All Projects',
      defaultValue: 'View All Projects',
    },
    {
      name: 'returnToPortfolio',
      type: 'text',
      label: 'Return to Portfolio',
      defaultValue: 'Return to Portfolio',
    },
    {
      name: 'featuredProjects',
      type: 'text',
      label: 'Featured Projects',
      defaultValue: 'Featured Projects',
    },
    {
      name: 'myPortfolio',
      type: 'text',
      label: 'My Portfolio',
      defaultValue: 'My Portfolio',
    },
    {
      name: 'contactMe',
      type: 'text',
      label: 'Contact Me',
      defaultValue: 'Contact Me',
    },
  ],
};

export default UIText;
