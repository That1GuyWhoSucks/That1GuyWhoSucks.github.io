
<script lang="ts">
import RawResults from '../../results.json';
import RawConfigs from '../../configs.json';
import { goto } from '$app/navigation';
import { TAB_SIZE, GroupGraphTypes, IndividualGraphTypes } from "$lib/index";
import type { Config } from '$lib/index';
let Configs: Config[] = RawConfigs;
Configs = Configs.filter((config: Config) => {
    return config.outputName in RawResults
});
let ConfigNames: string[] = Configs.map((config: Config) => config.outputName)
let code = "";
let SelectedConfigs: {[key: string]: boolean} = {};
let SelectedIndivdualGraphs: {[key: string]: boolean} = {};
let SelectedGroupGraphs: {[key: string]: boolean} = {};
function GotoCode() {
    goto(`/view_code?code=${code}`);
}
function GenerateCode() {
    code = "wasd"
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
    {#each (Object.values(IndividualGraphTypes)) as type}
        <p style="padding-left: {TAB_SIZE}px">{type} <input type="checkbox" bind:checked={SelectedIndivdualGraphs[type]}></p>
    {/each}
    <p>Group Graphs:</p>
    {#each (Object.values(GroupGraphTypes)) as type}
        <p style="padding-left: {TAB_SIZE}px">{type} <input type="checkbox" bind:checked={SelectedGroupGraphs[type]}></p>
    {/each}
    <button on:click={GenerateCode}>Generate graphs (this will take some time)</button>
</div>
    