<script>
import Router from 'svelte-spa-router';
import Index from './routes/+page.svelte';
import Create from './routes/create/+page.svelte';
import ViewCode from './routes/view_code/+page.svelte';
import View from './routes/view/+page.svelte';
import ViewBacklog from './routes/view_backlog/+page.svelte';
// Define your routes mapping
const routes = {
  '/': Index,
  '/create': Create,
  '/view_code': ViewCode,
  '/view': View,
  '/view_backlog': ViewBacklog
};
</script>

<!-- The router component automatically uses hash-based routing -->
<Router {routes} />