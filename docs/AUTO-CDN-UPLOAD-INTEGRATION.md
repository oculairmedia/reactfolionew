# Automated CDN Upload Integration Plan

## Overview

This document outlines a complete implementation plan for automated CDN upload integration with Payload CMS. When users upload media through Payload admin, files are automatically uploaded to BunnyCDN and the CDN URL is stored in the Media collection.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [BunnyCDN API Integration](#bunnycdn-api-integration)
3. [Payload Hooks Implementation](#payload-hooks-implementation)
4. [Configuration & Environment](#configuration--environment)
5. [Implementation Steps](#implementation-steps)
6. [Testing Strategy](#testing-strategy)
7. [Error Handling & Retry Logic](#error-handling--retry-logic)
8. [Migration Strategy](#migration-strategy)
9. [Monitoring & Logging](#monitoring--logging)
10. [Security Considerations](#security-considerations)

---

## Architecture Overview

### Current Flow (Manual)
```
User uploads to Payload → File saved to /media → Manual CDN upload → Manual URL entry
```

### Proposed Flow (Automated)
```
User uploads to Payload
    ↓
Payload receives file
    ↓
beforeChange hook triggered
    ↓
Upload to BunnyCDN (primary)
    ↓ (on success)
Store CDN URL in Media document
    ↓ (optional)
Keep local copy as backup
    ↓
Return success to user
```

### Hybrid Mode (Recommended)
```
User uploads to Payload
    ↓
Save file locally first (fast, reliable)
    ↓
afterChange hook triggered (async)
    ↓
Upload to BunnyCDN in background
    ↓ (on success)
Update Media document with CDN URL
    ↓
Mark as 'cdn_synced'
    ↓ (optional)
Delete local file after X days
```

### Component Diagram

```
┌─────────────────────────────────────────────────────┐
│              Payload CMS Admin UI                   │
│  (User uploads image via Media collection)          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         Payload Upload Handler                      │
│  • Validates file (type, size)                      │
│  • Saves to /media directory (local)                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│      beforeChange/afterChange Hook                  │
│  • Triggers CDN upload service                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          CDN Upload Service                         │
│  • BunnyCDN API client                              │
│  • Upload file buffer/stream                        │
│  • Generate optimized filename                      │
│  • Handle retries & errors                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│            BunnyCDN Storage                         │
│  https://oculair.b-cdn.net/cache/images/...        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼ (CDN URL returned)
┌─────────────────────────────────────────────────────┐
│      Update Media Document                          │
│  • Set cdn_url field                                │
│  • Set source = 'cdn'                               │
│  • Set cdn_synced = true                            │
│  • Keep local file as backup (optional)             │
└─────────────────────────────────────────────────────┘
```

---

## BunnyCDN API Integration

### BunnyCDN Storage API

**Documentation:** https://docs.bunny.net/docs/storage-api

#### Authentication
```bash
# BunnyCDN uses Access Key authentication
AccessKey: YOUR_STORAGE_API_KEY
```

#### Upload Endpoint
```
PUT https://storage.bunnycdn.com/{storage_zone}/{path}/{filename}
```

#### API Client Implementation

**File:** `payload/services/BunnyCDNClient.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { createReadStream, statSync } from 'fs';
import { Readable } from 'stream';
import crypto from 'crypto';

export interface BunnyCDNConfig {
  storageZone: string;
  accessKey: string;
  baseUrl?: string;
  pullZoneUrl: string; // e.g., https://oculair.b-cdn.net
  uploadPath?: string; // e.g., 'cache/images' or 'uploads'
}

export interface UploadOptions {
  filename?: string; // Override filename
  generateHash?: boolean; // Generate SHA hash filename
  preserveExtension?: boolean;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  cdnUrl: string;
  filename: string;
  size: number;
  uploadedAt: Date;
  error?: string;
}

export class BunnyCDNClient {
  private client: AxiosInstance;
  private config: BunnyCDNConfig;

  constructor(config: BunnyCDNConfig) {
    this.config = {
      baseUrl: 'https://storage.bunnycdn.com',
      uploadPath: 'cache/images',
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        AccessKey: this.config.accessKey,
      },
      timeout: 60000, // 60 seconds
    });
  }

  /**
   * Upload file from local filesystem
   */
  async uploadFile(
    localPath: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const fileStats = statSync(localPath);
      const fileStream = createReadStream(localPath);

      return await this.uploadStream(fileStream, fileStats.size, {
        filename: options.filename || path.basename(localPath),
        ...options,
      });
    } catch (error) {
      console.error('[BunnyCDN] Upload file error:', error);
      return {
        success: false,
        cdnUrl: '',
        filename: '',
        size: 0,
        uploadedAt: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * Upload file from buffer
   */
  async uploadBuffer(
    buffer: Buffer,
    originalFilename: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const stream = Readable.from(buffer);
    return await this.uploadStream(stream, buffer.length, {
      filename: originalFilename,
      ...options,
    });
  }

  /**
   * Upload file from stream (core method)
   */
  async uploadStream(
    stream: Readable,
    size: number,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Generate filename
      const filename = await this.generateFilename(
        options.filename || 'upload',
        options
      );

      // Build upload path
      const uploadPath = this.buildUploadPath(filename);

      console.log(`[BunnyCDN] Uploading to: ${uploadPath}`);

      // Upload to BunnyCDN
      const response = await this.client.put(uploadPath, stream, {
        headers: {
          'Content-Type': options.contentType || 'application/octet-stream',
          'Content-Length': size,
          ...(options.metadata && this.buildMetadataHeaders(options.metadata)),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.status === 201 || response.status === 200) {
        const cdnUrl = this.buildCDNUrl(filename);

        console.log(`[BunnyCDN] Upload successful: ${cdnUrl}`);

        return {
          success: true,
          cdnUrl,
          filename,
          size,
          uploadedAt: new Date(),
        };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('[BunnyCDN] Upload stream error:', error);
      return {
        success: false,
        cdnUrl: '',
        filename: options.filename || '',
        size: 0,
        uploadedAt: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * Delete file from CDN
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      const uploadPath = this.buildUploadPath(filename);
      
      console.log(`[BunnyCDN] Deleting: ${uploadPath}`);

      const response = await this.client.delete(uploadPath);

      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('[BunnyCDN] Delete error:', error);
      return false;
    }
  }

  /**
   * Check if file exists on CDN
   */
  async fileExists(filename: string): Promise<boolean> {
    try {
      const uploadPath = this.buildUploadPath(filename);
      const response = await this.client.head(uploadPath);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate filename based on options
   */
  private async generateFilename(
    originalFilename: string,
    options: UploadOptions
  ): Promise<string> {
    if (options.filename) {
      return options.filename;
    }

    const ext = originalFilename.split('.').pop();

    if (options.generateHash) {
      // Generate SHA-256 hash + timestamp for uniqueness
      const timestamp = Date.now();
      const randomBytes = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .createHash('sha256')
        .update(`${originalFilename}-${timestamp}-${randomBytes}`)
        .digest('hex')
        .substring(0, 40); // Use first 40 chars (matches existing pattern)

      return options.preserveExtension ? `${hash}.${ext}` : hash;
    }

    // Sanitize filename
    const sanitized = originalFilename
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();

    // Add timestamp to avoid collisions
    const timestamp = Date.now();
    const name = sanitized.replace(`.${ext}`, '');

    return `${name}-${timestamp}.${ext}`;
  }

  /**
   * Build upload path for BunnyCDN storage
   */
  private buildUploadPath(filename: string): string {
    return `/${this.config.storageZone}/${this.config.uploadPath}/${filename}`;
  }

  /**
   * Build CDN URL for accessing uploaded file
   */
  private buildCDNUrl(filename: string): string {
    return `${this.config.pullZoneUrl}/${this.config.uploadPath}/${filename}`;
  }

  /**
   * Build metadata headers for BunnyCDN
   */
  private buildMetadataHeaders(metadata: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      headers[`x-metadata-${key}`] = value;
    }

    return headers;
  }

  /**
   * Upload with retry logic
   */
  async uploadWithRetry(
    stream: Readable | Buffer | string,
    filename: string,
    options: UploadOptions = {},
    maxRetries: number = 3
  ): Promise<UploadResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[BunnyCDN] Upload attempt ${attempt}/${maxRetries}`);

        let result: UploadResult;

        if (Buffer.isBuffer(stream)) {
          result = await this.uploadBuffer(stream, filename, options);
        } else if (typeof stream === 'string') {
          result = await this.uploadFile(stream, options);
        } else {
          result = await this.uploadStream(
            stream,
            0, // Size unknown for stream
            { ...options, filename }
          );
        }

        if (result.success) {
          return result;
        }

        lastError = new Error(result.error || 'Upload failed');
      } catch (error) {
        lastError = error;
        console.error(`[BunnyCDN] Attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[BunnyCDN] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      cdnUrl: '',
      filename,
      size: 0,
      uploadedAt: new Date(),
      error: lastError?.message || 'Upload failed after retries',
    };
  }
}
```

---

## Payload Hooks Implementation

### Media Collection with CDN Upload Hooks

**File:** `payload/collections/MediaWithCDN.ts`

```typescript
import { CollectionConfig } from 'payload/types';
import { BunnyCDNClient } from '../services/BunnyCDNClient';
import path from 'path';

// Initialize BunnyCDN client
const cdnClient = new BunnyCDNClient({
  storageZone: process.env.BUNNY_STORAGE_ZONE || '',
  accessKey: process.env.BUNNY_ACCESS_KEY || '',
  pullZoneUrl: process.env.BUNNY_PULL_ZONE_URL || 'https://oculair.b-cdn.net',
  uploadPath: 'cache/images',
});

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/*'],
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
        height: undefined,
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
    ],
    formatOptions: {
      format: 'jpeg',
      options: { quality: 90 },
    },
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    crop: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'cdn_url',
      type: 'text',
      admin: {
        description: 'CDN URL (auto-populated on upload)',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'upload',
      options: [
        { label: 'Uploaded to CMS', value: 'upload' },
        { label: 'CDN (Auto-synced)', value: 'cdn' },
        { label: 'CDN (Manual)', value: 'cdn_manual' },
      ],
      admin: {
        description: 'How is this media stored?',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'cdn_synced',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether file has been uploaded to CDN',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'cdn_sync_error',
      type: 'textarea',
      admin: {
        description: 'Error message if CDN sync failed',
        position: 'sidebar',
        readOnly: true,
        condition: (data) => !data.cdn_synced && data.cdn_sync_error,
      },
    },
    {
      name: 'cdn_uploaded_at',
      type: 'date',
      admin: {
        description: 'When file was uploaded to CDN',
        position: 'sidebar',
        readOnly: true,
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
    defaultColumns: ['alt', 'source', 'cdn_synced', 'media_type', 'updatedAt'],
    description: 'Upload media - automatically synced to CDN. Images are optimized.',
  },
  hooks: {
    /**
     * AFTER CHANGE HOOK - Upload to CDN after file saved locally
     * This runs asynchronously after the document is created/updated
     */
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only process uploads (not manual CDN entries)
        if (operation === 'create' && doc.filename && !doc.cdn_synced) {
          console.log(`[Media Hook] Processing CDN upload for: ${doc.filename}`);

          try {
            // Build local file path
            const localFilePath = path.join(
              process.cwd(),
              'media',
              doc.filename
            );

            // Upload to CDN with retry logic
            const uploadResult = await cdnClient.uploadWithRetry(
              localFilePath,
              doc.filename,
              {
                generateHash: true,
                preserveExtension: true,
                contentType: doc.mimeType,
                metadata: {
                  'original-name': doc.filename,
                  'uploaded-by': req.user?.email || 'unknown',
                },
              },
              3 // Max retries
            );

            if (uploadResult.success) {
              // Update document with CDN URL
              await req.payload.update({
                collection: 'media',
                id: doc.id,
                data: {
                  cdn_url: uploadResult.cdnUrl,
                  source: 'cdn',
                  cdn_synced: true,
                  cdn_uploaded_at: uploadResult.uploadedAt,
                  cdn_sync_error: null,
                },
              });

              console.log(`[Media Hook] CDN upload successful: ${uploadResult.cdnUrl}`);
            } else {
              // Log error but don't fail the upload
              console.error(`[Media Hook] CDN upload failed: ${uploadResult.error}`);

              await req.payload.update({
                collection: 'media',
                id: doc.id,
                data: {
                  cdn_synced: false,
                  cdn_sync_error: uploadResult.error,
                },
              });
            }
          } catch (error) {
            console.error('[Media Hook] Unexpected error:', error);

            await req.payload.update({
              collection: 'media',
              id: doc.id,
              data: {
                cdn_synced: false,
                cdn_sync_error: error.message,
              },
            });
          }
        }
      },
    ],

    /**
     * BEFORE DELETE HOOK - Delete from CDN when media deleted
     */
    beforeDelete: [
      async ({ req, id }) => {
        try {
          // Get media document
          const media = await req.payload.findByID({
            collection: 'media',
            id,
          });

          // If has CDN URL, delete from CDN
          if (media.cdn_url && media.cdn_synced) {
            // Extract filename from CDN URL
            const filename = media.cdn_url.split('/').pop();

            if (filename) {
              console.log(`[Media Hook] Deleting from CDN: ${filename}`);

              const deleted = await cdnClient.deleteFile(filename);

              if (deleted) {
                console.log(`[Media Hook] CDN file deleted: ${filename}`);
              } else {
                console.warn(`[Media Hook] Failed to delete from CDN: ${filename}`);
              }
            }
          }
        } catch (error) {
          console.error('[Media Hook] Delete error:', error);
          // Don't fail the delete operation
        }
      },
    ],
  },
};
```

---

## Configuration & Environment

### Environment Variables

**File:** `.env.production`

```bash
# BunnyCDN Configuration
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_ACCESS_KEY=your-storage-api-key-here
BUNNY_PULL_ZONE_URL=https://oculair.b-cdn.net

# CDN Upload Settings
BUNNY_UPLOAD_PATH=cache/images
BUNNY_GENERATE_HASH=true
BUNNY_PRESERVE_EXTENSION=true
BUNNY_MAX_RETRIES=3
BUNNY_TIMEOUT=60000

# Local Storage Settings
KEEP_LOCAL_BACKUP=true
DELETE_LOCAL_AFTER_DAYS=30

# Feature Flags
ENABLE_CDN_AUTO_UPLOAD=true
ENABLE_CDN_AUTO_DELETE=true
```

### Docker Configuration

**File:** `docker-compose.yml` (update)

```yaml
services:
  payload:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: portfolio-payload
    restart: unless-stopped
    depends_on:
      mongodb:
        condition: service_healthy
    environment:
      # Existing vars...
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      MONGODB_URI: mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/portfolio?authSource=admin
      
      # BunnyCDN Configuration
      BUNNY_STORAGE_ZONE: ${BUNNY_STORAGE_ZONE}
      BUNNY_ACCESS_KEY: ${BUNNY_ACCESS_KEY}
      BUNNY_PULL_ZONE_URL: ${BUNNY_PULL_ZONE_URL}
      BUNNY_UPLOAD_PATH: ${BUNNY_UPLOAD_PATH:-cache/images}
      BUNNY_GENERATE_HASH: ${BUNNY_GENERATE_HASH:-true}
      BUNNY_PRESERVE_EXTENSION: ${BUNNY_PRESERVE_EXTENSION:-true}
      BUNNY_MAX_RETRIES: ${BUNNY_MAX_RETRIES:-3}
      BUNNY_TIMEOUT: ${BUNNY_TIMEOUT:-60000}
      
      # Feature flags
      ENABLE_CDN_AUTO_UPLOAD: ${ENABLE_CDN_AUTO_UPLOAD:-true}
      ENABLE_CDN_AUTO_DELETE: ${ENABLE_CDN_AUTO_DELETE:-true}
      KEEP_LOCAL_BACKUP: ${KEEP_LOCAL_BACKUP:-true}
      DELETE_LOCAL_AFTER_DAYS: ${DELETE_LOCAL_AFTER_DAYS:-30}
    ports:
      - "3001:3001"
    volumes:
      - payload_media:/app/media
    networks:
      - portfolio-network
```

---

## Implementation Steps

### Phase 1: Setup & Configuration (Week 1)

#### Step 1: Install Dependencies

```bash
cd /opt/stacks/implement-payload-cms-011CUxhkCJAiefDu2xtFQKcp

# Install BunnyCDN SDK (if available) or axios for API calls
npm install axios
npm install @types/node --save-dev

# Install crypto (built-in, just type definitions)
npm install --save-dev @types/crypto
```

#### Step 2: Create BunnyCDN Client

```bash
# Create services directory
mkdir -p payload/services

# Create BunnyCDN client
touch payload/services/BunnyCDNClient.ts

# Copy implementation from above section
```

#### Step 3: Get BunnyCDN Credentials

1. **Log into BunnyCDN Dashboard**: https://dash.bunny.net/
2. **Navigate to Storage**:
   - Go to "Storage" → Your storage zone (e.g., "oculair-storage")
   - Note the **Storage Zone Name** (e.g., `oculair-storage`)
3. **Get API Access Key**:
   - Click "FTP & API Access"
   - Copy the **Password (API Key)**
4. **Get Pull Zone URL**:
   - Go to "Pull Zones" → Your pull zone
   - Note the **Pull Zone URL** (e.g., `https://oculair.b-cdn.net`)

#### Step 4: Configure Environment

```bash
# Add to .env.production
cat >> .env.production << EOF

# BunnyCDN Configuration
BUNNY_STORAGE_ZONE=oculair-storage
BUNNY_ACCESS_KEY=your-api-key-here
BUNNY_PULL_ZONE_URL=https://oculair.b-cdn.net
BUNNY_UPLOAD_PATH=cache/images
