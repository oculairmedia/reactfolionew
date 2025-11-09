module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: [
        './src/**/*.{js,jsx,ts,tsx}',
        './public/index.html'
      ],
      defaultExtractor: content => {
        // Capture as many selectors as possible
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
        return broadMatches.concat(innerMatches);
      },
      safelist: {
        standard: [
          'html',
          'body',
          /^modal/,
          /^carousel/,
          /^dropdown/,
          /^collapse/,
          /^accordion/,
          /^nav/,
          /^btn/,
          /^form/,
          /^input/,
          /^fade/,
          /^show/,
          /^active/,
          /^disabled/,
          /^data-/,
        ],
        deep: [
          /^react-/,
          /^Typewriter/,
          /^cursor/,
        ],
        greedy: [
          /rainbow/,
          /skeleton/,
        ]
      },
      // Only run PurgeCSS in production
      rejected: process.env.NODE_ENV === 'production'
    })
  ]
};
