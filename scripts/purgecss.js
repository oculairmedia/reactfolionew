/**
 * Post-build PurgeCSS script
 * Runs after `vite build` to strip unused CSS from the output.
 *
 * Usage: node scripts/purgecss.js
 */
const { PurgeCSS } = require("purgecss");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const BUILD_DIR = path.join(__dirname, "..", "build");

// Normalize path for glob (always use forward slashes)
const normGlob = (p) => p.replace(/\\/g, "/");

async function purge() {
  // Find all CSS files in the Vite build output
  const cssFiles = glob.sync(
    normGlob(path.join(BUILD_DIR, "assets/css/**/*.css")),
  );

  if (cssFiles.length === 0) {
    console.log("No CSS files found in build directory.");
    return;
  }

  // Find all JS/HTML files as content sources
  const contentFiles = [
    ...glob.sync(normGlob(path.join(BUILD_DIR, "assets/js/**/*.js"))),
    ...glob.sync(normGlob(path.join(BUILD_DIR, "**/*.html"))),
  ];

  console.log(`\n🧹 PurgeCSS: Processing ${cssFiles.length} CSS files...`);

  let totalSaved = 0;

  for (const cssFile of cssFiles) {
    const originalSize = fs.statSync(cssFile).size;
    const originalCSS = fs.readFileSync(cssFile, "utf-8");

    const result = await new PurgeCSS().purge({
      content: contentFiles,
      css: [{ raw: originalCSS }],
      // Custom extractor for Tailwind CSS classes
      defaultExtractor: (content) => {
        // Match Tailwind classes including those with colons, slashes, brackets
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
        const innerMatches =
          content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
        return [...new Set([...broadMatches, ...innerMatches])];
      },
      safelist: {
        standard: [
          // State classes
          "active",
          "disabled",
          "open",
          "closed",
          "loading",
          "checked",
          "focus",
          "hover",

          // Animation states
          /^animate-/,
          /^transition-/,

          // Dark mode
          /^dark:/,
          /^dark$/,

          // daisyUI components - keep all component classes
          /^btn/,
          /^card/,
          /^modal/,
          /^drawer/,
          /^menu/,
          /^navbar/,
          /^footer/,
          /^hero/,
          /^alert/,
          /^badge/,
          /^avatar/,
          /^breadcrumbs/,
          /^collapse/,
          /^dropdown/,
          /^indicator/,
          /^kbd/,
          /^link/,
          /^progress/,
          /^radial-progress/,
          /^skeleton/,
          /^spinner/,
          /^stat/,
          /^tab/,
          /^table/,
          /^toast/,
          /^toggle/,
          /^tooltip/,
          /^artboard/,
          /^divider/,
          /^stack/,
          /^countdown/,
          /^diff/,
          /^loading/,
          /^mask/,
          /^mockup/,
          /^swap/,
          /^carousel/,
          /^chat/,
          /^code/,
          /^file-input/,
          /^form-control/,
          /^input/,
          /^join/,
          /^label/,
          /^radio/,
          /^range/,
          /^rating/,
          /^select/,
          /^textarea/,
          /^checkbox/,
          /^steps/,
          /^timeline/,

          // daisyUI theme classes
          /^theme-/,
          /^\[data-theme/,

          // Prose (typography)
          /^prose/,

          // Custom blog/portfolio classes
          /^blog-/,
          /^project-/,
          /^portfolio-/,
          /^code-block/,
          /^gallery-/,
        ],
        deep: [
          // Data attributes used by daisyUI
          /data-theme/,
          /data-tip/,
        ],
        greedy: [
          // Tailwind responsive and state prefixes
          /^sm:/,
          /^md:/,
          /^lg:/,
          /^xl:/,
          /^2xl:/,
          /^hover:/,
          /^focus:/,
          /^active:/,
          /^group-/,
          /^peer-/,
        ],
      },
      // Keep CSS variables
      variables: true,
    });

    if (result.length > 0 && result[0].css) {
      fs.writeFileSync(cssFile, result[0].css);
      const newSize = fs.statSync(cssFile).size;
      const saved = originalSize - newSize;
      totalSaved += saved;
      const pct = ((saved / originalSize) * 100).toFixed(1);
      const basename = path.basename(cssFile);
      console.log(
        `   ${basename}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (saved ${(saved / 1024).toFixed(1)}KB, ${pct}%)`,
      );
    }
  }

  console.log(
    `\n✅ PurgeCSS complete! Total saved: ${(totalSaved / 1024).toFixed(1)}KB\n`,
  );
}

purge().catch((err) => {
  console.error("PurgeCSS error:", err);
  process.exit(1);
});
