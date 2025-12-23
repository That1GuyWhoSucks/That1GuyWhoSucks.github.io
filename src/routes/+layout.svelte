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
function ViewBacklog() {
    goto("#/view_backlog");
}
console.log(window.location.href.split("/"))
</script>
<nav class="navbar">
    <a href="#/" on:click|preventDefault={Home}>Home</a>
    <a href="#/create" on:click|preventDefault={CreateConfig}>Create Config</a>
    <a href="#/view" on:click|preventDefault={ViewData}>View Data</a>
    <a href="#/view_backlog" on:click|preventDefault={ViewBacklog}>Pending Configs</a>
</nav>
<style>
.navbar {
    display: flex;
    justify-content: center;
    gap: 1rem;

    padding: 0.75rem;
    margin-bottom: 2rem;

    background-color: #f0f0f0;
    border-bottom: 1px solid #ccc;
}

.navbar a {
    text-decoration: none;
    color: black;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
}

.navbar a:hover {
    background-color: #e0e0e0;
}

.navbar a:focus {
    outline: 2px solid #999;
}
.navbar {
    a.active {
        background-color: #ddd;
        font-weight: bold;
    }
}


</style>

<slot/>