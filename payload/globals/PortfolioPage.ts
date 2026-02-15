import { GlobalConfig } from 'payload/types';

const PortfolioPage: GlobalConfig = {
  slug: 'portfolio-page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title',
      defaultValue: 'Portfolio',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Page Description',
      defaultValue: 'Explore my creative work and projects',
    },
    {
      name: 'meta_title',
      type: 'text',
      label: 'SEO Title',
      admin: {
        description: 'Optional: Override page title for SEO',
      },
    },
    {
      name: 'meta_description',
      type: 'textarea',
      label: 'SEO Description',
      admin: {
        description: 'Optional: Override description for SEO',
      },
    },
  ],
};

export default PortfolioPage;
