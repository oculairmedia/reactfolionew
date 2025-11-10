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
  ],
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'caption', 'updatedAt'],
    description: 'Upload and manage images and videos. Images are automatically optimized.',
  },
};
