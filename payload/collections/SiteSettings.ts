import { GlobalConfig } from 'payload/types';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    description: 'Global site configuration, contact info, and social links',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logotext',
      type: 'text',
      required: true,
      admin: {
        description: 'Text shown in the logo',
      },
    },
    {
      name: 'meta',
      type: 'group',
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
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'serviceId',
          type: 'text',
          admin: {
            description: 'EmailJS Service ID',
          },
        },
        {
          name: 'templateId',
          type: 'text',
          admin: {
            description: 'EmailJS Template ID',
          },
        },
        {
          name: 'publicKey',
          type: 'text',
          admin: {
            description: 'EmailJS Public Key',
          },
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        {
          name: 'github',
          type: 'text',
        },
        {
          name: 'facebook',
          type: 'text',
        },
        {
          name: 'linkedin',
          type: 'text',
        },
        {
          name: 'twitter',
          type: 'text',
        },
      ],
    },
  ],
};
