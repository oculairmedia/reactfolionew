import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Video Optimization Hook (AfterChange)
 * 
 * Creates multiple optimized versions of uploaded videos:
 * - low: 480p, lower bitrate (mobile)
 * - medium: 720p, medium bitrate (tablet)
 * - high: 1080p, optimized bitrate (desktop)
 * - thumbnail: First frame as JPEG
 * 
 * Uses FFmpeg with H.264 codec and optimized settings
 */

interface VideoVariant {
  name: string;
  width: number;
  height: number;
  bitrate: string;
  filename?: string;
  url?: string;
  filesize?: number;
}

export const videoOptimizationAfterHook = async ({
  doc,
  req,
  operation,
}: any) => {
  console.log('[VIDEO-OPT] Hook triggered');
  console.log('[VIDEO-OPT] Operation:', operation);
  console.log('[VIDEO-OPT] Filename:', doc?.filename);
  console.log('[VIDEO-OPT] MimeType:', doc?.mimeType);

  // Only process on create
  if (operation !== 'create') {
    console.log('[VIDEO-OPT] Skipping - not a create operation');
    return doc;
  }

  // Only process video files
  if (!doc?.mimeType?.startsWith('video/')) {
    console.log('[VIDEO-OPT] Skipping - not a video file');
    return doc;
  }

  // Skip if already processed
  if (doc.video_sizes) {
    console.log('[VIDEO-OPT] Skipping - already has video_sizes');
    return doc;
  }

  const mediaDir = path.join(process.cwd(), 'media');
  const originalPath = path.join(mediaDir, doc.filename);

  console.log('[VIDEO-OPT] Media dir:', mediaDir);
  console.log('[VIDEO-OPT] Original path:', originalPath);

  // Check if file exists
  if (!fs.existsSync(originalPath)) {
    console.log('[VIDEO-OPT] ERROR: File not found:', originalPath);
    return doc;
  }

  const fileStats = fs.statSync(originalPath);
  console.log('[VIDEO-OPT] File size:', (fileStats.size / 1024 / 1024).toFixed(2), 'MB');

  console.log(`\n🎬 Starting video optimization for: ${doc.filename}`);

  // Define video variants (sorted from smallest to largest)
  const variants: VideoVariant[] = [
    { name: 'low', width: 480, height: 480, bitrate: '400k' },      // Mobile low-res
    { name: 'medium', width: 854, height: 480, bitrate: '800k' },   // Mobile/Tablet
    { name: 'high', width: 1280, height: 720, bitrate: '1500k' },   // Desktop 720p
    { name: 'full', width: 1920, height: 1080, bitrate: '3000k' },  // Desktop 1080p
  ];

  const videoSizes: Record<string, any> = {};

  try {
    // Get video metadata
    console.log('[VIDEO-OPT] Getting video metadata...');
    const probeCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${originalPath}"`;
    const { stdout } = await execAsync(probeCmd);
    const metadata = JSON.parse(stdout);
    const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video');
    
    const originalWidth = videoStream?.width || 1920;
    const originalHeight = videoStream?.height || 1080;

    console.log(`   📊 Original: ${originalWidth}x${originalHeight}`);

    // Process each variant
    for (const variant of variants) {
      // Skip if variant is larger than original
      if (variant.width > originalWidth) {
        console.log(`   ⏭️  Skipping ${variant.name} (${variant.width}px > original ${originalWidth}px)`);
        continue;
      }

      const outputFilename = doc.filename.replace(/\.(mp4|mov|avi|webm)$/i, `-${variant.name}.mp4`);
      const outputPath = path.join(mediaDir, outputFilename);

      console.log(`   🔄 Processing ${variant.name} (${variant.width}x${variant.height})...`);

      // FFmpeg command with optimized settings
      const ffmpegCmd = `ffmpeg -i "${originalPath}" \
        -c:v libx264 \
        -preset fast \
        -crf 23 \
        -maxrate ${variant.bitrate} \
        -bufsize ${parseInt(variant.bitrate) * 2}k \
        -vf "scale=${variant.width}:${variant.height}:force_original_aspect_ratio=decrease,pad=${variant.width}:${variant.height}:(ow-iw)/2:(oh-ih)/2" \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y \
        "${outputPath}" 2>&1`;

      try {
        console.log(`[VIDEO-OPT] Executing FFmpeg for ${variant.name}...`);
        const { stdout: ffmpegOutput } = await execAsync(ffmpegCmd, { maxBuffer: 50 * 1024 * 1024 });
        
        // Check if output file was created
        if (!fs.existsSync(outputPath)) {
          console.error(`[VIDEO-OPT] ERROR: Output file not created: ${outputPath}`);
          continue;
        }

        // Get output file stats
        const stats = fs.statSync(outputPath);
        const sizeReduction = ((1 - stats.size / doc.filesize) * 100).toFixed(1);

        videoSizes[variant.name] = {
          filename: outputFilename,
          url: `/media/${outputFilename}`,
          width: variant.width,
          height: variant.height,
          bitrate: variant.bitrate,
          filesize: stats.size,
          mimeType: 'video/mp4',
        };

        console.log(`   ✅ ${variant.name}: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${sizeReduction}% reduction)`);
      } catch (error: any) {
        console.error(`   ❌ Failed to process ${variant.name}:`, error.message);
        console.error('[VIDEO-OPT] FFmpeg error:', error);
      }
    }

    // Generate thumbnail from first frame
    console.log(`   📸 Generating thumbnail...`);
    const thumbnailFilename = doc.filename.replace(/\.(mp4|mov|avi|webm)$/i, '-thumb.jpg');
    const thumbnailPath = path.join(mediaDir, thumbnailFilename);

    const thumbnailCmd = `ffmpeg -i "${originalPath}" -vframes 1 -vf "scale=1280:720:force_original_aspect_ratio=decrease" -q:v 2 -y "${thumbnailPath}" 2>&1`;
    
    try {
      await execAsync(thumbnailCmd);
      
      if (fs.existsSync(thumbnailPath)) {
        const thumbStats = fs.statSync(thumbnailPath);

        videoSizes.thumbnail = {
          filename: thumbnailFilename,
          url: `/media/${thumbnailFilename}`,
          width: 1280,
          height: 720,
          filesize: thumbStats.size,
          mimeType: 'image/jpeg',
        };

        console.log(`   ✅ Thumbnail: ${(thumbStats.size / 1024).toFixed(2)} KB`);
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to generate thumbnail:`, error.message);
    }

    const totalVariants = Object.keys(videoSizes).length;
    console.log(`\n✨ Video optimization complete! Created ${totalVariants} variants\n`);

    // Update the document with video_sizes
    if (totalVariants > 0) {
      console.log('[VIDEO-OPT] Updating document with video_sizes...');
      await req.payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          video_sizes: videoSizes,
        },
      });
      console.log('[VIDEO-OPT] Document updated successfully');
    }

  } catch (error: any) {
    console.error(`❌ Video optimization error:`, error);
    console.error('[VIDEO-OPT] Error stack:', error.stack);
  }

  return doc;
};
