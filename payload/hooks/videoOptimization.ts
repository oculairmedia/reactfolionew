import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Video Optimization Hook
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

export const videoOptimizationHook = async ({
  req,
  data,
  originalDoc,
  operation,
}: any) => {
  // Only process on create/update when a new file is uploaded
  if (operation !== 'create' && operation !== 'update') {
    return data;
  }

  // Only process video files
  if (!data?.mimeType?.startsWith('video/')) {
    return data;
  }

  const mediaDir = path.join(process.cwd(), 'media');
  const originalPath = path.join(mediaDir, data.filename);

  // Check if file exists
  if (!fs.existsSync(originalPath)) {
    console.log(`Video file not found: ${originalPath}`);
    return data;
  }

  console.log(`\n🎬 Starting video optimization for: ${data.filename}`);

  // Define video variants
  const variants: VideoVariant[] = [
    { name: 'low', width: 854, height: 480, bitrate: '500k' },      // Mobile
    { name: 'medium', width: 1280, height: 720, bitrate: '1500k' }, // Tablet
    { name: 'high', width: 1920, height: 1080, bitrate: '3000k' },  // Desktop
  ];

  const videoSizes: Record<string, any> = {};

  try {
    // Get video metadata
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

      const outputFilename = data.filename.replace(/\.(mp4|mov|avi|webm)$/i, `-${variant.name}.mp4`);
      const outputPath = path.join(mediaDir, outputFilename);

      console.log(`   🔄 Processing ${variant.name} (${variant.width}x${variant.height})...`);

      // FFmpeg command with optimized settings
      // -c:v libx264: H.264 codec
      // -preset fast: Good compression/speed balance
      // -crf 23: Constant quality (18-28, lower = better quality)
      // -maxrate: Max bitrate
      // -bufsize: Buffer size (2x bitrate)
      // -vf scale: Resize video
      // -c:a aac: AAC audio codec
      // -b:a 128k: Audio bitrate
      // -movflags +faststart: Enable streaming
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
        "${outputPath}"`;

      try {
        await execAsync(ffmpegCmd, { maxBuffer: 50 * 1024 * 1024 }); // 50MB buffer

        // Get output file stats
        const stats = fs.statSync(outputPath);
        const sizeReduction = ((1 - stats.size / data.filesize) * 100).toFixed(1);

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
      } catch (error) {
        console.error(`   ❌ Failed to process ${variant.name}:`, error);
      }
    }

    // Generate thumbnail from first frame
    console.log(`   📸 Generating thumbnail...`);
    const thumbnailFilename = data.filename.replace(/\.(mp4|mov|avi|webm)$/i, '-thumb.jpg');
    const thumbnailPath = path.join(mediaDir, thumbnailFilename);

    const thumbnailCmd = `ffmpeg -i "${originalPath}" -vframes 1 -vf "scale=1280:720:force_original_aspect_ratio=decrease" -q:v 2 -y "${thumbnailPath}"`;
    
    try {
      await execAsync(thumbnailCmd);
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
    } catch (error) {
      console.error(`   ❌ Failed to generate thumbnail:`, error);
    }

    // Add video_sizes to the document
    data.video_sizes = videoSizes;

    const totalVariants = Object.keys(videoSizes).length;
    console.log(`\n✨ Video optimization complete! Created ${totalVariants} variants\n`);

  } catch (error) {
    console.error(`❌ Video optimization error:`, error);
    // Don't fail the upload if optimization fails
  }

  return data;
};
