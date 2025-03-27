
<script lang="ts">
import RawResults from '../../results.json';
import RawConfigs from '../../configs.json';
import { goto } from '$app/navigation';
import { TAB_SIZE, GroupGraphTypes, IndividualGraphTypes } from "$lib/index";
import type { Config } from '$lib/index';
import * as LZString from "lz-string";
let Configs: Config[] = RawConfigs;
Configs = Configs.filter((config: Config) => {
    return config.outputName in RawResults
});
let ConfigNames: string[] = Configs.map((config: Config) => config.outputName)
let code: string = "";
let SelectedConfigs: {[key: string]: boolean} = {};
let SelectedIndivdualGraphs: {[key: string]: boolean} = {};
let SelectedGroupGraphs: {[key: string]: boolean} = {};
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
    {#each ConfigNames as Name}
        <p style="padding-left: {TAB_SIZE}px">{Name} <input type="checkbox" bind:checked={SelectedConfigs[Name]}></p>
    {/each}
    <p>Individual Graphs:</p>
    {#each (Object.entries(IndividualGraphTypes)) as [key, type]}
        <p style="padding-left: {TAB_SIZE}px">{type[0]} <input type="checkbox" bind:checked={SelectedIndivdualGraphs[key]}></p>
    {/each}
    <p>Group Graphs:</p>
    {#each (Object.entries(GroupGraphTypes)) as [key, type]}
        <p style="padding-left: {TAB_SIZE}px">{type[0]} <input type="checkbox" bind:checked={SelectedGroupGraphs[key]}></p>
    {/each}
    <button on:click={GenerateCode}>Generate graphs (this will take some time)</button>
</div>
    