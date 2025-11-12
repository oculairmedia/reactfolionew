/**
 * Video Optimization Wrapper
 * 
 * This wrapper ensures the video optimization code is NEVER bundled
 * in the admin UI, avoiding webpack errors for Node.js modules.
 * 
 * We use eval + require to completely hide the module path from webpack's
 * static analysis, preventing it from trying to bundle the server-only code.
 */

export const videoOptimizationAfterHook = async (args: any) => {
  // Early exit for browser/admin UI - return immediately
  if (typeof (global as any).window !== 'undefined') {
    return args.doc;
  }

  // Only process video files
  if (!args.doc?.mimeType?.startsWith('video/')) {
    return args.doc;
  }

  try {
    // Use eval to completely hide the require() call from webpack
    // Webpack cannot statically analyze what's inside eval()
    const requireFunc = eval('require');
    const pathModule = requireFunc('path');
    const hookPath = pathModule.join(process.cwd(), 'dist', 'payload', 'hooks', 'videoOptimizationAfter.js');
    const hookModule = requireFunc(hookPath);
    return await hookModule.videoOptimizationAfterHook(args);
  } catch (error) {
    console.error('[VideoOptimization] Failed to load hook:', error);
    return args.doc;
  }
};
