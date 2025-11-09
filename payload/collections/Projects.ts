import { CollectionConfig } from 'payload/types';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'id', 'updatedAt'],
    description: 'Detailed project case studies and portfolio pieces',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for the project (URL slug)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'client',
          type: 'text',
        },
        {
          name: 'date',
          type: 'text',
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'technologies',
          type: 'text',
        },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
          defaultValue: 'image',
        },
        {
          name: 'image',
          type: 'text',
          admin: {
            condition: (data) => data?.hero?.type === 'image',
          },
        },
        {
          name: 'video',
          type: 'text',
          admin: {
            condition: (data) => data?.hero?.type === 'video',
          },
        },
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'content',
          type: 'textarea',
        },
        {
          name: 'layout',
          type: 'select',
          options: [
            { label: 'Full Width', value: 'full-width' },
            { label: 'Two Column', value: 'two-column' },
          ],
          defaultValue: 'full-width',
        },
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
          defaultValue: 'image',
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
        {
          name: 'width',
          type: 'select',
          options: [
            { label: 'Full Width', value: 'full' },
            { label: 'Half Width', value: 'half' },
          ],
          defaultValue: 'full',
        },
      ],
    },
  ],
};
