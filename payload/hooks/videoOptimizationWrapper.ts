/**
 * Video Optimization Wrapper
 * 
 * This wrapper ensures the video optimization code is NEVER bundled
 * in the admin UI, avoiding webpack errors for Node.js modules.
 */

export const videoOptimizationAfterHook = async (args: any) => {
  // Only run on server (never in browser/admin bundle)
  if (typeof window !== 'undefined') {
    return args.doc;
  }

  try {
    // Dynamic import that webpack will keep as a runtime require()
    // This won't be bundled in the admin UI
    const hookModule = await eval('import("./videoOptimizationAfter")');
    return hookModule.videoOptimizationAfterHook(args);
  } catch (error) {
    console.error('[VideoOptimization] Failed to load hook:', error);
    return args.doc;
  }
};
