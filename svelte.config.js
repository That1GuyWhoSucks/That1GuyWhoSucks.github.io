import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
    }),
    paths: {
      base: '',
    },
    prerender: {
      entries: ['*'],
    },
	router: { type: 'hash' }
  }
};
