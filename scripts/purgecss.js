/**
 * Post-build PurgeCSS script
 * Runs after `react-scripts build` to strip unused CSS from the output.
 * 
 * Usage: node scripts/purgecss.js
 */
const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const BUILD_DIR = path.join(__dirname, '..', 'build');

// Normalize path for glob (always use forward slashes)
const normGlob = (p) => p.replace(/\\/g, '/');

async function purge() {
    // Find all CSS files in the build output
    const cssFiles = glob.sync(normGlob(path.join(BUILD_DIR, 'static/css/**/*.css')));

    if (cssFiles.length === 0) {
        console.log('No CSS files found in build directory.');
        return;
    }

    // Find all JS/HTML files as content sources
    const contentFiles = [
        ...glob.sync(normGlob(path.join(BUILD_DIR, 'static/js/**/*.js'))),
        ...glob.sync(normGlob(path.join(BUILD_DIR, '**/*.html'))),
    ];

    console.log(`\n🧹 PurgeCSS: Processing ${cssFiles.length} CSS files...`);

    let totalSaved = 0;

    for (const cssFile of cssFiles) {
        const originalSize = fs.statSync(cssFile).size;
        const originalCSS = fs.readFileSync(cssFile, 'utf-8');

        const result = await new PurgeCSS().purge({
            content: contentFiles,
            css: [{ raw: originalCSS }],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: {
                standard: [
                    /^modal/, /^fade/, /^show/, /^collapse/,
                    /^nav/, /^dropdown/, /^btn/,
                    /^spinner/, /^alert/, /^badge/, /^card/,
                    /^visually-hidden/, /^offcanvas/,
                    'active', 'disabled', 'open', 'closed',
                    'h-100', 'w-100',
                ],
                deep: [/data-bs/, /data-rr-ui/],
                greedy: [/col-/, /row/, /container/, /mx-/, /my-/, /mb-/, /mt-/, /me-/, /ms-/, /py-/, /px-/],
            },
        });

        if (result.length > 0 && result[0].css) {
            fs.writeFileSync(cssFile, result[0].css);
            const newSize = fs.statSync(cssFile).size;
            const saved = originalSize - newSize;
            totalSaved += saved;
            const pct = ((saved / originalSize) * 100).toFixed(1);
            const basename = path.basename(cssFile);
            console.log(`   ${basename}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (saved ${(saved / 1024).toFixed(1)}KB, ${pct}%)`);
        }
    }

    console.log(`\n✅ PurgeCSS complete! Total saved: ${(totalSaved / 1024).toFixed(1)}KB\n`);
}

purge().catch(err => {
    console.error('PurgeCSS error:', err);
    process.exit(1);
});
