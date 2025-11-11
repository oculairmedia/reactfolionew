import { CollectionConfig } from 'payload/types';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/*'],
    // Image optimization configuration
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'center',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        name: 'small',
        width: 600,
        height: undefined, // Maintain aspect ratio
        position: 'center',
        formatOptions: {
          format: 'webp',
          options: { quality: 85 },
        },
      },
      {
        name: 'medium',
        width: 1024,
        height: undefined,
        position: 'center',
        formatOptions: {
          format: 'webp',
          options: { quality: 85 },
        },
      },
      {
        name: 'large',
        width: 1920,
        height: undefined,
        position: 'center',
        formatOptions: {
          format: 'webp',
          options: { quality: 90 },
        },
      },
      {
        name: 'og', // Open Graph / social media
        width: 1200,
        height: 630,
        position: 'center',
        formatOptions: {
          format: 'jpeg',
          options: { quality: 85 },
        },
      },
    ],
    // Fallback formats for browsers that don't support WebP
    formatOptions: {
      format: 'jpeg',
      options: {
        quality: 90,
      },
    },
    adminThumbnail: 'thumbnail',
    focalPoint: true, // Enable focal point selection in admin
    crop: true, // Enable image cropping in admin
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'cdn_url',
      type: 'text',
      admin: {
        description: 'CDN URL for existing images (e.g., https://oculair.b-cdn.net/cache/images/...)',
        position: 'sidebar',
        condition: (data, siblingData) => {
          // Show this field if no file is uploaded
          return !siblingData.filename;
        },
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'upload',
      options: [
        { label: 'Uploaded to CMS', value: 'upload' },
        { label: 'CDN (External)', value: 'cdn' },
      ],
      admin: {
        description: 'How is this media stored?',
        position: 'sidebar',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: false,
      admin: {
        description: 'Alt text for accessibility and SEO',
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: false,
      admin: {
        description: 'Optional caption displayed with the image',
      },
    },
    {
      name: 'credit',
      type: 'text',
      localized: false,
      admin: {
        description: 'Photo credit or attribution',
      },
    },
    {
      name: 'media_type',
      type: 'select',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
      ],
      admin: {
        description: 'Type of media',
        position: 'sidebar',
      },
    },
  ],
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'source', 'media_type', 'updatedAt'],
    description: 'Upload new media or register existing CDN images. Uploaded images are automatically optimized.',
  },
  hooks: {
    // Auto-set source based on whether file is uploaded or CDN URL provided
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          // If CDN URL is provided, set source to 'cdn'
          if (data.cdn_url && !data.filename) {
            data.source = 'cdn';
          } else if (data.filename) {
            data.source = 'upload';
          }
        }
        return data;
      },
    ],
  },
};
