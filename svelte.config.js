import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build', // Ensures pages are generated
      assets: 'build',
      fallback: 'index.html', // Serves index.html for missing routes
    }),
    paths: {
      base: '/that1guywhosucks.github.io', // Change to your repo name
    },
    prerender: {
      entries: ['*'], // Ensures all pages are generated
    },
  }
};
