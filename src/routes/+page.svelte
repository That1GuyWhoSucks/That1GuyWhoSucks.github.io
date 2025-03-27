<script lang="ts">
import { goto } from "$app/navigation";
function ViewData() {
    goto("#/view");
}
function CreateConfig() {
    goto("#/create");
}

</script>
<h3>Welceom</h3>
<button onclick="{CreateConfig}">Create config for testing</button>
<button onclick="{ViewData}">View data</button>