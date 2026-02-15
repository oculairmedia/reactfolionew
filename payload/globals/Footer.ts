import { GlobalConfig } from 'payload/types';

const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'copyright',
      type: 'text',
      required: true,
      label: 'Copyright Text',
      defaultValue: '© 2024 Emmanuel Umukoro. All rights reserved.',
    },
    {
      name: 'note',
      type: 'text',
      label: 'Footer Note',
      defaultValue: 'Crafted with passion and precision.',
    },
    {
      name: 'links',
      type: 'array',
      label: 'Footer Links',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label',
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
        },
        {
          name: 'external',
          type: 'checkbox',
          label: 'External Link',
          defaultValue: false,
        },
      ],
    },
  ],
};

export default Footer;
