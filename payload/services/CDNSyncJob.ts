import { Payload } from 'payload';
import { getBunnyCDNClient, isCDNAutoUploadEnabled } from './BunnyCDNClient';
import path from 'path';
import fs from 'fs';

export interface SyncStats {
  attempted: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

/**
 * Retry failed CDN uploads
 * This job should run periodically (e.g., every hour) to retry uploads that failed
 */
export async function retrySyncFailedUploads(payload: Payload): Promise<SyncStats> {
  const stats: SyncStats = {
    attempted: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  if (!isCDNAutoUploadEnabled()) {
    console.log('[CDNSyncJob] Auto-upload disabled, skipping retry job');
    return stats;
  }

  const cdnClient = getBunnyCDNClient();
  if (!cdnClient) {
    console.log('[CDNSyncJob] CDN client not available');
    return stats;
  }

  try {
    console.log('[CDNSyncJob] Starting retry job for failed uploads...');

    // Find all media that failed to sync or haven't synced yet
    const failedMedia = await payload.find({
      collection: 'media',
      where: {
        and: [
          {
            source: {
              equals: 'upload',
            },
          },
          {
            cdn_synced: {
              not_equals: true,
            },
          },
          {
            filename: {
              exists: true,
            },
          },
        ],
      },
      limit: 100, // Process in batches
    });

    console.log(`[CDNSyncJob] Found ${failedMedia.docs.length} media items to retry`);

    for (const doc of failedMedia.docs) {
      stats.attempted++;

      try {
        const localPath = path.join(process.cwd(), 'media', doc.filename);

        // Verify file still exists
        if (!fs.existsSync(localPath)) {
          const error = `Local file not found: ${localPath}`;
          stats.failed++;
          stats.errors.push(`${doc.filename}: ${error}`);

          await payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              cdn_sync_error: error,
            },
          });

          continue;
        }

        // Generate remote path
        const remotePath = `media/${doc.filename}`;

        console.log(`[CDNSyncJob] Retrying upload for ${doc.filename}...`);

        // Upload to CDN
        const result = await cdnClient.uploadFile(localPath, remotePath);

        if (result.success && result.cdnUrl) {
          // Update document
          await payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              cdn_url: result.cdnUrl,
              cdn_synced: true,
              cdn_uploaded_at: new Date().toISOString(),
              cdn_remote_path: remotePath,
              cdn_sync_error: null,
            },
          });

          stats.succeeded++;
          console.log(`[CDNSyncJob] Successfully uploaded: ${result.cdnUrl}`);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error: any) {
        stats.failed++;
        const errorMsg = error.message || 'Unknown error';
        stats.errors.push(`${doc.filename}: ${errorMsg}`);

        console.error(`[CDNSyncJob] Failed to upload ${doc.filename}:`, errorMsg);

        // Update error in database
        await payload.update({
          collection: 'media',
          id: doc.id,
          data: {
            cdn_sync_error: `Retry failed: ${errorMsg}`,
          },
        });
      }
    }

    console.log(
      `[CDNSyncJob] Retry job complete. Attempted: ${stats.attempted}, Succeeded: ${stats.succeeded}, Failed: ${stats.failed}`
    );
  } catch (error: any) {
    console.error('[CDNSyncJob] Job failed:', error);
    stats.errors.push(`Job error: ${error.message}`);
  }

  return stats;
}

/**
 * Clean up old local files that have been successfully synced to CDN
 * This helps free up disk space on the server
 */
export async function cleanupOldLocalFiles(payload: Payload, olderThanDays: number = 30): Promise<number> {
  if (!isCDNAutoUploadEnabled()) {
    return 0;
  }

  const keepLocalBackup = process.env.KEEP_LOCAL_BACKUP !== 'false';
  if (keepLocalBackup) {
    console.log('[CDNSyncJob] KEEP_LOCAL_BACKUP is enabled, skipping cleanup');
    return 0;
  }

  let deletedCount = 0;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    console.log(`[CDNSyncJob] Starting cleanup of files synced before ${cutoffDate.toISOString()}...`);

    // Find synced media older than cutoff date
    const oldSyncedMedia = await payload.find({
      collection: 'media',
      where: {
        and: [
          {
            cdn_synced: {
              equals: true,
            },
          },
          {
            cdn_uploaded_at: {
              less_than: cutoffDate.toISOString(),
            },
          },
          {
            filename: {
              exists: true,
            },
          },
        ],
      },
      limit: 100, // Process in batches
    });

    console.log(`[CDNSyncJob] Found ${oldSyncedMedia.docs.length} files to clean up`);

    for (const doc of oldSyncedMedia.docs) {
      try {
        const localPath = path.join(process.cwd(), 'media', doc.filename);

        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          deletedCount++;
          console.log(`[CDNSyncJob] Deleted local file: ${doc.filename}`);
        }
      } catch (error: any) {
        console.error(`[CDNSyncJob] Failed to delete ${doc.filename}:`, error.message);
      }
    }

    console.log(`[CDNSyncJob] Cleanup complete. Deleted ${deletedCount} local files`);
  } catch (error: any) {
    console.error('[CDNSyncJob] Cleanup job failed:', error);
  }

  return deletedCount;
}

/**
 * Start periodic jobs
 * Call this from your server initialization
 */
export function startCDNSyncJobs(payload: Payload): void {
  if (!isCDNAutoUploadEnabled()) {
    console.log('[CDNSyncJob] Auto-upload disabled, jobs not started');
    return;
  }

  const retryIntervalMinutes = parseInt(process.env.CDN_RETRY_INTERVAL_MINUTES || '60', 10);
  const cleanupIntervalDays = parseInt(process.env.CDN_CLEANUP_INTERVAL_DAYS || '1', 10);
  const deleteLocalAfterDays = parseInt(process.env.DELETE_LOCAL_AFTER_DAYS || '30', 10);

  console.log('[CDNSyncJob] Starting periodic jobs...');
  console.log(`[CDNSyncJob] - Retry interval: ${retryIntervalMinutes} minutes`);
  console.log(`[CDNSyncJob] - Cleanup interval: ${cleanupIntervalDays} days`);
  console.log(`[CDNSyncJob] - Delete local files after: ${deleteLocalAfterDays} days`);

  // Retry failed uploads periodically
  setInterval(
    async () => {
      try {
        await retrySyncFailedUploads(payload);
      } catch (error) {
        console.error('[CDNSyncJob] Retry job error:', error);
      }
    },
    retryIntervalMinutes * 60 * 1000
  );

  // Clean up old files periodically
  setInterval(
    async () => {
      try {
        await cleanupOldLocalFiles(payload, deleteLocalAfterDays);
      } catch (error) {
        console.error('[CDNSyncJob] Cleanup job error:', error);
      }
    },
    cleanupIntervalDays * 24 * 60 * 60 * 1000
  );

  console.log('[CDNSyncJob] Jobs started successfully');
}
