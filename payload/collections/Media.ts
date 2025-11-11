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
    // CDN Auto-Upload Sync Fields
    {
      name: 'cdn_synced',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this file has been uploaded to CDN',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'cdn_sync_error',
      type: 'textarea',
      admin: {
        description: 'Error message if CDN upload failed',
        position: 'sidebar',
        readOnly: true,
        condition: (data) => !!data.cdn_sync_error,
      },
    },
    {
      name: 'cdn_uploaded_at',
      type: 'date',
      admin: {
        description: 'When this file was uploaded to CDN',
        position: 'sidebar',
        readOnly: true,
        condition: (data) => !!data.cdn_uploaded_at,
      },
    },
    {
      name: 'cdn_remote_path',
      type: 'text',
      admin: {
        description: 'Remote path on CDN storage',
        position: 'sidebar',
        readOnly: true,
        condition: (data) => !!data.cdn_remote_path,
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
    {
      name: 'video_sizes',
      type: 'json',
      admin: {
        description: 'Optimized video variants (low, medium, high, thumbnail)',
        position: 'sidebar',
        readOnly: true,
        condition: (data) => data?.mimeType?.startsWith('video/'),
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
    // Auto-upload to CDN after file is saved locally, and optimize videos
    afterChange: [
      // Video optimization hook (server-side only)
      async (args) => {
        // Only run on server (not in admin bundle)
        if (typeof window === 'undefined') {
          const { videoOptimizationAfterHook } = await import('../hooks/videoOptimizationAfter');
          return videoOptimizationAfterHook(args);
        }
        return args.doc;
      },
      async ({ doc, req, operation }) => {
        // Server-side only - skip in browser
        if (typeof window !== 'undefined') {
          return doc;
        }

        // Dynamic imports for server-side modules
        const pathModule = await import('path');
        const path = pathModule.default || pathModule;
        const fsModule = await import('fs');
        const fs = fsModule.default || fsModule;
        const { getBunnyCDNClient, isCDNAutoUploadEnabled } = await import('../services/BunnyCDNClient');

        // Only process uploads, not CDN-registered media
        if (!isCDNAutoUploadEnabled() || doc.source === 'cdn' || !doc.filename) {
          return doc;
        }

        // Skip if already synced
        if (doc.cdn_synced) {
          return doc;
        }

        const cdnClient = getBunnyCDNClient();
        if (!cdnClient) {
          console.log('[Media] CDN client not available, skipping auto-upload');
          return doc;
        }

        console.log(`[Media] Auto-uploading ${doc.filename} to CDN...`);

        try {
          // Construct local file path for original
          const localPath = path.join(process.cwd(), 'media', doc.filename);

          // Verify file exists
          if (!fs.existsSync(localPath)) {
            throw new Error(`Local file not found: ${localPath}`);
          }

          // Generate remote path (preserve folder structure)
          const remotePath = `media/${doc.filename}`;

          // Upload original to CDN
          const result = await cdnClient.uploadFile(localPath, remotePath);

          if (!result.success) {
            throw new Error(result.error || 'Upload failed');
          }

          console.log(`[Media] Successfully uploaded original to CDN: ${result.cdnUrl}`);

          // Upload all optimized sizes (thumbnail, small, medium, large, og)
          if (doc.sizes && typeof doc.sizes === 'object') {
            console.log(`[Media] Uploading ${Object.keys(doc.sizes).length} optimized sizes...`);
            
            for (const [sizeName, sizeData] of Object.entries(doc.sizes)) {
              const sizeFilename = (sizeData as any).filename;
              if (sizeFilename) {
                const sizeLocalPath = path.join(process.cwd(), 'media', sizeFilename);
                const sizeRemotePath = `media/${sizeFilename}`;
                
                if (fs.existsSync(sizeLocalPath)) {
                  const sizeResult = await cdnClient.uploadFile(sizeLocalPath, sizeRemotePath);
                  if (sizeResult.success) {
                    console.log(`[Media] ✓ Uploaded ${sizeName}: ${sizeFilename}`);
                  } else {
                    console.error(`[Media] ✗ Failed to upload ${sizeName}: ${sizeResult.error}`);
                  }
                }
              }
            }
          }

          // Upload video variants (low, medium, high, thumbnail)
          if (doc.video_sizes && typeof doc.video_sizes === 'object') {
            console.log(`[Media] Uploading ${Object.keys(doc.video_sizes).length} video variants...`);
            
            for (const [variantName, variantData] of Object.entries(doc.video_sizes)) {
              const variantFilename = (variantData as any).filename;
              if (variantFilename) {
                const variantLocalPath = path.join(process.cwd(), 'media', variantFilename);
                const variantRemotePath = `media/${variantFilename}`;
                
                if (fs.existsSync(variantLocalPath)) {
                  const variantResult = await cdnClient.uploadFile(variantLocalPath, variantRemotePath);
                  if (variantResult.success) {
                    console.log(`[Media] ✓ Uploaded video ${variantName}: ${variantFilename}`);
                  } else {
                    console.error(`[Media] ✗ Failed to upload video ${variantName}: ${variantResult.error}`);
                  }
                }
              }
            }
          }

          // Update document with CDN info (use Payload API to avoid infinite loop)
          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              cdn_url: result.cdnUrl,
              cdn_synced: true,
              cdn_uploaded_at: new Date().toISOString(),
              cdn_remote_path: remotePath,
              cdn_sync_error: '',
            },
          });

          console.log(`[Media] Successfully uploaded all versions to CDN`);
        
        } catch (error: any) {
          console.error(`[Media] CDN upload failed for ${doc.filename}:`, error.message);

          // Update document with error info
          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              cdn_synced: false,
              cdn_sync_error: `Upload failed: ${error.message}`,
            },
          });
        }

        return doc;
      },
    ],
    // Delete from CDN when media is deleted
    beforeDelete: [
      async ({ req, id }) => {
        // Server-side only
        if (typeof window !== 'undefined') {
          return;
        }

        const { getBunnyCDNClient, isCDNAutoUploadEnabled } = await import('../services/BunnyCDNClient');

        if (!isCDNAutoUploadEnabled()) {
          return;
        }

        const cdnClient = getBunnyCDNClient();
        if (!cdnClient) {
          return;
        }

        try {
          // Fetch the document to get CDN info
          const doc = await req.payload.findByID({
            collection: 'media',
            id,
          });

          // Only delete from CDN if it was auto-uploaded (not external CDN URLs)
          if (doc.cdn_synced && doc.cdn_remote_path) {
            console.log(`[Media] Deleting from CDN: ${doc.cdn_remote_path}`);

            const result = await cdnClient.deleteFile(doc.cdn_remote_path as string);

            if (result.success) {
              console.log(`[Media] Successfully deleted from CDN`);
            } else {
              console.error(`[Media] CDN delete failed: ${result.error}`);
            }
          }
        } catch (error: any) {
          console.error(`[Media] Error deleting from CDN:`, error.message);
          // Don't block deletion if CDN cleanup fails
        }
      },
    ],
  },
};
