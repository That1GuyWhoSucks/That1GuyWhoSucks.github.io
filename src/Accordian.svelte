<script>
export let open = false;
export let style = '';
import { slide } from 'svelte/transition';
const handleClick = () => open = !open
</script>

<div class="accordion">
    <div class="header" on:click={handleClick}>
        <div class="text" style="display: ruby; {style}">
            <slot name="head"></slot>
            <button>
                {open ? "Hide" : "Show"}
            </button>
        </div>
        
    </div>
    
    <div class="details"
     transition:slide
     style="{open ? '' : 'display: none;'}">
    <slot name="details" {open}></slot>
</div>

</div>

<style>
    div.accordion {
        margin: 1rem 0;
    }
    
    div.header {
        width:100%;
    }
    
    div.header .text {
        margin-right: 5px;
    }
    
    div.details {
        padding:1rem;
        border: 1px solid black;
    }
    div.header {
        cursor: pointer;
    }

</style>