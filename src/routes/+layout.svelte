<script lang="ts">
import { goto } from "$app/navigation";
function ViewData() {
    goto("#/view");
}
function CreateConfig() {
    goto("#/create");
}

function Home() {
    goto("/");
}
</script>
<nav style="text-align: center; background-color: #f0f0f0; padding: 10px;">
    <button onclick="{CreateConfig}">Create config</button>
    <button onclick="{ViewData}">View data</button>
    <button onclick="{Home}">Home</button>
</nav>

<slot/>