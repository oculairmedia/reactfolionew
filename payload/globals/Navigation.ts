import { GlobalConfig } from 'payload/types';

const Navigation: GlobalConfig = {
  slug: 'navigation',
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Navigation Items',
      required: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label',
        },
        {
          name: 'path',
          type: 'text',
          required: true,
          label: 'Path',
        },
        {
          name: 'external',
          type: 'checkbox',
          label: 'External Link',
          defaultValue: false,
        },
        {
          name: 'order',
          type: 'number',
          required: true,
          label: 'Order',
          defaultValue: 1,
        },
      ],
    },
  ],
};

export default Navigation;
