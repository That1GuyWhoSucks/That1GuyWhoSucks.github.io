
<script lang="ts">
import RawResults from '../../results.json';
import RawConfigs from '../../configs.json';
import { goto } from '$app/navigation';
import { TAB_SIZE, GroupGraphTypes, IndividualGraphTypes, ImageLoader, process_fleet } from "$lib/index";
import type { Config } from '$lib/index';
import * as LZString from "lz-string";
import Accordian from '../../Accordian.svelte';
let Configs: Config[] = RawConfigs;
Configs = Configs.filter((config: Config) => {
    return config.outputName in RawResults
});
let ConfigNames: string[] = Configs.map((config: Config) => config.outputName)
let code: string = "";
let SelectedConfigs: Record<string, boolean> = {};
let SelectedIndivdualGraphs: Record<string, boolean> = {};
let SelectedGroupGraphs: Record<string, boolean> = {};
let ConfigImages: Record<string, [HTMLElement | null, boolean]> = {};
Configs.forEach(config => {
    ConfigImages[config.outputName] = [null, false];
});
let imageLoader: ImageLoader = new ImageLoader();
function GotoCode() {
    goto(`#/view_code?code=${code}`);
}
function GenerateCode() {
    console.log(SelectedConfigs, SelectedIndivdualGraphs, SelectedGroupGraphs)
    code = LZString.compressToEncodedURIComponent(`${
        JSON.stringify(Object.entries(SelectedConfigs).filter(([name, wanted]) => wanted).map(([name, wanted]) => name))
    }!${
        JSON.stringify(Object.entries(SelectedIndivdualGraphs).filter(([name, wanted]) => wanted).map(([name, wanted]) => name))
    }!${
        JSON.stringify(Object.entries(SelectedGroupGraphs).filter(([name, wanted]) => wanted).map(([name, wanted]) => name))
    }`);
    GotoCode()
}
</script>
<p>Select what configs to analyze and what graphs to create</p>
<p>OR you may enter a code here <input type="text" bind:value={code}> <button on:click={GotoCode}>submit code</button></p>
<div>
    <p>Configs:</p>
    <p><button on:click={function () {
        Object.keys(SelectedConfigs).forEach((key) => {
            SelectedConfigs[key] = !SelectedConfigs[key];
        })
    }}>Invert</button><button on:click={function () {
        Object.keys(SelectedConfigs).forEach((key) => {
            SelectedConfigs[key] = true;
        })
    }}>All</button><button on:click={function () {
        Object.keys(SelectedConfigs).forEach((key) => {
            SelectedConfigs[key] = false;
        })
    }}>None</button></p>
    {#each ConfigNames as Name}
        
        <Accordian>
            <div slot="head">
                <p style="padding-left: {TAB_SIZE}px">{Name} <input type="checkbox" bind:checked={SelectedConfigs[Name]}></p>
            </div>
            <div slot="details">
                <pre>{JSON.stringify(Configs.find(c => c.outputName == Name), null, 2)}</pre>
                
                <div bind:this={ConfigImages[Name][0]}></div>
                {#if !ConfigImages[Name][1]}
                    <button on:click={async function() {
                        if (imageLoader.rarity.length == 0) {
                            await imageLoader.init();
                        }
                        ConfigImages[Name][0]?.replaceChildren(await process_fleet(Configs.find(c => c.outputName == Name) as Config, imageLoader))
                        ConfigImages[Name][1] = true;
                    }}>Generate fleet image</button>
                {/if}
            </div>
            
        </Accordian>
        
    {/each}
    <p>Individual Graphs:</p>
    <p><button on:click={function () {
        Object.keys(SelectedIndivdualGraphs).forEach((key) => {
            SelectedIndivdualGraphs[key] = !SelectedIndivdualGraphs[key];
        })
    }}>Invert</button><button on:click={function () {
        Object.keys(SelectedIndivdualGraphs).forEach((key) => {
            SelectedIndivdualGraphs[key] = true;
        })
    }}>All</button><button on:click={function () {
        Object.keys(SelectedIndivdualGraphs).forEach((key) => {
            SelectedIndivdualGraphs[key] = false;
        })
    }}>None</button></p>
    {#each (Object.entries(IndividualGraphTypes)) as [key, type]}
        <p style="padding-left: {TAB_SIZE}px">{type[0]} <input type="checkbox" bind:checked={SelectedIndivdualGraphs[key]}></p>
    {/each}
    <p>Group Graphs:</p>
    <p><button on:click={function () {
        Object.keys(SelectedGroupGraphs).forEach((key) => {
            SelectedGroupGraphs[key] = !SelectedGroupGraphs[key];
        })
    }}>Invert</button><button on:click={function () {
        Object.keys(SelectedGroupGraphs).forEach((key) => {
            SelectedGroupGraphs[key] = true;
        })
    }}>All</button><button on:click={function () {
        Object.keys(SelectedGroupGraphs).forEach((key) => {
            SelectedGroupGraphs[key] = false;
        })
    }}>None</button></p>
    {#each (Object.entries(GroupGraphTypes)) as [key, type]}
        <p style="padding-left: {TAB_SIZE}px">{type[0]} <input type="checkbox" bind:checked={SelectedGroupGraphs[key]}></p>
    {/each}
    <button on:click={GenerateCode}>Generate graphs</button>
</div>
    