/**
 * Post-build PurgeCSS script
 * Runs after `vite build` to strip unused CSS from the output.
 *
 * Usage: node scripts/purgecss.js
 */
const { PurgeCSS } = require("purgecss");
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");

/** Recursively find files matching an extension under a directory */
function findFiles(dir, ext) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}
async function purge() {
  // Find all CSS files in the Vite build output
  const cssDir = path.join(BUILD_DIR, "assets/css");
  const cssFiles = fs.existsSync(cssDir) ? findFiles(cssDir, ".css") : [];

  if (cssFiles.length === 0) {
    console.log("No CSS files found in build directory.");
    return;
  }

  // Find all JS/HTML files as content sources
  const jsDir = path.join(BUILD_DIR, "assets/js");
  const contentFiles = [
    ...(fs.existsSync(jsDir) ? findFiles(jsDir, ".js") : []),
    ...findFiles(BUILD_DIR, ".html"),
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

          // daisyUI components — enumerated from actual usage in src/.
          // Derived by extracting className tokens from src/**/*.{ts,tsx}.
          // Prefer adding an exact class here over a broad /^prefix/ regex:
          // a bare prefix keeps every variant daisyUI ships, which defeats
          // the purge (e.g. /^btn/ retained all ~40 btn-* variants).
          "btn",
          "btn-accent",
          "btn-dash",
          "btn-ghost",
          "btn-lg",
          "btn-link",
          "btn-md",
          "btn-neutral",
          "btn-outline",
          "btn-primary",
          "btn-secondary",
          "btn-sm",
          "btn-soft",
          "btn-square",
          "btn-xl",
          "btn-xs",
          "modal",
          "modal-action",
          "modal-backdrop",
          "modal-box",
          "modal-open",
          "drawer",
          "drawer-button",
          "drawer-content",
          "drawer-end",
          "drawer-overlay",
          "drawer-side",
          "drawer-toggle",
          "navbar",
          "navbar-center",
          "navbar-end",
          "navbar-start",
          // alert-* variants are produced dynamically by getAlertClass()
          "alert",
          "alert-error",
          "alert-info",
          "alert-success",
          "alert-warning",
          "badge",
          "badge-accent",
          "badge-error",
          "badge-ghost",
          "badge-info",
          "badge-lg",
          "badge-md",
          "badge-neutral",
          "badge-outline",
          "badge-primary",
          "badge-secondary",
          "badge-sm",
          "badge-success",
          "badge-warning",
          "badge-xl",
          "badge-xs",
          "avatar",
          "breadcrumbs",
          "collapse",
          "collapse-arrow",
          "collapse-content",
          "collapse-open",
          "collapse-title",
          "link",
          "link-hover",
          "link-primary",
          "progress",
          "progress-accent",
          "progress-primary",
          "progress-secondary",
          "skeleton",
          "tab",
          "tab-active",
          "tab-content",
          "table",
          "table-cell",
          "toast",
          "toast-bottom",
          "toast-end",
          "tooltip",
          "tooltip-bottom",
          "divider",
          "swap",
          "swap-active",
          "swap-off",
          "swap-on",
          "swap-rotate",
          "input",
          "input-bordered",
          "label",
          "label-text",
          "label-text-alt",
          "select",
          "select-bordered",
          "textarea",
          "textarea-bordered",
          "fieldset",
          "fieldset-legend",
          "loading",
          "loading-bars",
          "loading-dots",
          "loading-infinity",
          "loading-lg",
          "loading-ring",
          "loading-sm",
          "loading-spinner",

          // Project-specific hero-* classes (custom CSS, not daisyUI)
          /^hero-/,

          // daisyUI theme classes.
          // /^theme-/ is required: `theme-transitioning` is applied at
          // runtime via classList.add() in components/themetoggle.
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
