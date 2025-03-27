import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
    }),
    paths: {
      base: '/That1GuyWhoSucks.github.io', // Set to match GitHub Pages repo name
    },
    prerender: {
      entries: ['*'],
    },
  }
};
