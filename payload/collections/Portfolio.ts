import { CollectionConfig } from 'payload/types';

export const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'id', 'date', 'updatedAt'],
    description: 'Portfolio grid items shown on the main portfolio page',
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
        description: 'Unique identifier (matches project ID)',
      },
    },
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
    {
      name: 'isVideo',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this portfolio item a video?',
      },
    },
    {
      name: 'video',
      type: 'text',
      admin: {
        description: 'Video URL (if isVideo is true)',
        condition: (data) => data.isVideo === true,
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Featured image (preferred - links to Media collection)',
      },
    },
    {
      name: 'featuredVideo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Featured video (if isVideo is true)',
        condition: (data) => data.isVideo === true,
      },
    },
    {
      name: 'img',
      type: 'text',
      admin: {
        description: 'Legacy: Image URL or poster image for video (use featuredImage instead)',
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'Link to the full project page',
      },
    },
    {
      name: 'date',
      type: 'text',
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
  ],
};
