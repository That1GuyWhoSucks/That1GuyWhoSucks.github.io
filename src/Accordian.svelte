<script>
export let open = false;
export let style = '';
import { slide } from 'svelte/transition';
const handleClick = () => open = !open
</script>

<div class="accordion">
    <div class="header">
        <div class="text" style="display: ruby; {style}">
            <slot name="head"></slot>
            <button on:click={handleClick}>
                +/-
            </button>
        </div>
        
    </div>
    
    <div class="details" transition:slide style="{open ? '' : 'display: none;'}">
        <slot name="details">
        </slot>
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
        background-color: #cecece;
        padding:1rem;
    }
</style>