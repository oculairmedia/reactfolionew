import { GlobalConfig } from 'payload/types';

export const HomeIntro: GlobalConfig = {
  slug: 'home-intro',
  admin: {
    description: 'Home page introduction and animated text',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      name: 'image_url',
      type: 'text',
      admin: {
        description: 'Profile image URL',
      },
    },
    {
      name: 'animated',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
