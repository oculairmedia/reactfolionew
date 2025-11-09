import { GlobalConfig } from 'payload/types';

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  admin: {
    description: 'About page content, timeline, skills, and services',
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
      name: 'aboutme',
      type: 'textarea',
      required: true,
    },
    {
      name: 'timeline',
      type: 'array',
      fields: [
        {
          name: 'jobtitle',
          type: 'text',
          required: true,
        },
        {
          name: 'where',
          type: 'text',
          required: true,
        },
        {
          name: 'date',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'skills',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
          admin: {
            description: 'Skill level from 0-100',
          },
        },
      ],
    },
    {
      name: 'services',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
};
