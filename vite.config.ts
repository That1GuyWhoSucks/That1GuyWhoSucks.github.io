import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
		  stream: 'stream-browserify'
		}
	  },
	  optimizeDeps: {
		esbuildOptions: {
		  define: {
			global: 'globalThis'
		  }
		}
	  },
	  base: "/That1GuyWhoSucks.github.io/"
});
