import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';

export interface BunnyCDNConfig {
  storageZone: string;
  accessKey: string;
  pullZoneUrl: string;
  storageUrl?: string;
}

export interface UploadResult {
  success: boolean;
  cdnUrl?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export class BunnyCDNClient {
  private config: BunnyCDNConfig;
  private client: AxiosInstance;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  constructor(config: BunnyCDNConfig) {
    this.config = {
      ...config,
      storageUrl: config.storageUrl || 'https://la.storage.bunnycdn.com',
    };

    this.client = axios.create({
      baseURL: this.config.storageUrl,
      headers: {
        AccessKey: this.config.accessKey,
        'Content-Type': 'application/octet-stream',
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Upload a file to BunnyCDN with retry logic
   */
  async uploadFile(
    localFilePath: string,
    remotePath: string,
    retryCount = 0
  ): Promise<UploadResult> {
    try {
      // Validate local file exists
      if (!fs.existsSync(localFilePath)) {
        return {
          success: false,
          error: `Local file not found: ${localFilePath}`,
        };
      }

      // Read file
      const fileBuffer = fs.readFileSync(localFilePath);
      const fileSize = fs.statSync(localFilePath).size;

      console.log(`[BunnyCDN] Uploading ${localFilePath} to ${remotePath} (${fileSize} bytes)`);

      // Construct the full path including storage zone
      const fullPath = `/${this.config.storageZone}/${remotePath}`;

      // Upload to BunnyCDN
      const response = await this.client.put(fullPath, fileBuffer, {
        headers: {
          'Content-Length': fileSize.toString(),
        },
      });

      if (response.status === 201 || response.status === 200) {
        const cdnUrl = `${this.config.pullZoneUrl}/${remotePath}`;
        console.log(`[BunnyCDN] Upload successful: ${cdnUrl}`);

        return {
          success: true,
          cdnUrl,
        };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error: any) {
      console.error(`[BunnyCDN] Upload error (attempt ${retryCount + 1}):`, error.message);

      // Retry logic with exponential backoff
      if (retryCount < this.MAX_RETRIES) {
        const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[BunnyCDN] Retrying in ${delay}ms...`);

        await this.sleep(delay);
        return this.uploadFile(localFilePath, remotePath, retryCount + 1);
      }

      return {
        success: false,
        error: error.message || 'Upload failed after retries',
      };
    }
  }

  /**
   * Delete a file from BunnyCDN with retry logic
   */
  async deleteFile(remotePath: string, retryCount = 0): Promise<DeleteResult> {
    try {
      console.log(`[BunnyCDN] Deleting ${remotePath}`);

      // Construct the full path including storage zone
      const fullPath = `/${this.config.storageZone}/${remotePath}`;

      const response = await this.client.delete(fullPath);

      if (response.status === 200 || response.status === 404) {
        console.log(`[BunnyCDN] Delete successful: ${remotePath}`);
        return { success: true };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error: any) {
      // 404 is considered success (file already deleted)
      if (error.response?.status === 404) {
        return { success: true };
      }

      console.error(`[BunnyCDN] Delete error (attempt ${retryCount + 1}):`, error.message);

      // Retry logic
      if (retryCount < this.MAX_RETRIES) {
        const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[BunnyCDN] Retrying in ${delay}ms...`);

        await this.sleep(delay);
        return this.deleteFile(remotePath, retryCount + 1);
      }

      return {
        success: false,
        error: error.message || 'Delete failed after retries',
      };
    }
  }

  /**
   * Check if BunnyCDN connection is valid
   */
  async testConnection(): Promise<boolean> {
    try {
      const testPath = `/${this.config.storageZone}/`;
      const response = await this.client.get(testPath);
      return response.status === 200;
    } catch (error: any) {
      console.error('[BunnyCDN] Connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Get CDN URL for a given remote path
   */
  getCDNUrl(remotePath: string): string {
    return `${this.config.pullZoneUrl}/${remotePath}`;
  }

  /**
   * Extract remote path from CDN URL
   */
  getRemotePathFromUrl(cdnUrl: string): string | null {
    if (!cdnUrl.startsWith(this.config.pullZoneUrl)) {
      return null;
    }
    return cdnUrl.replace(`${this.config.pullZoneUrl}/`, '');
  }

  /**
   * Sleep helper for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let bunnyCDNClient: BunnyCDNClient | null = null;

/**
 * Get or create BunnyCDN client instance
 */
export function getBunnyCDNClient(): BunnyCDNClient | null {
  if (!bunnyCDNClient) {
    const storageZone = process.env.BUNNY_STORAGE_ZONE;
    const accessKey = process.env.BUNNY_ACCESS_KEY;
    const pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL;

    if (!storageZone || !accessKey || !pullZoneUrl) {
      console.warn('[BunnyCDN] Missing configuration. Auto-upload disabled.');
      return null;
    }

    bunnyCDNClient = new BunnyCDNClient({
      storageZone,
      accessKey,
      pullZoneUrl,
    });

    console.log('[BunnyCDN] Client initialized successfully');
  }

  return bunnyCDNClient;
}

/**
 * Check if CDN auto-upload is enabled
 */
export function isCDNAutoUploadEnabled(): boolean {
  return process.env.ENABLE_CDN_AUTO_UPLOAD === 'true';
}
