
<script lang="ts">
import RawResults from '../../results.json';
import RawConfigs from '../../configs.json';
import { goto } from '$app/navigation';
import { TAB_SIZE, GroupGraphTypes, IndividualGraphTypes, ImageLoader, process_fleet } from "$lib/index";
import type { Config } from '$lib/index';
import * as LZString from "lz-string";
import Accordian from '../../Accordian.svelte';
let Configs: Config[] = RawConfigs as Config[];
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
const ELEMENTS_PER_ROW = 6; 
function chunkArray<T>(arr: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}
</script>
<div style="text-align: center;">
    <p>Select what configs to analyze and what graphs to create</p>
    <p>OR you may enter a code here <input type="text" bind:value={code}> <button on:click={GotoCode}>submit code</button></p>
    <div>
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
            <p style="width: 100%; margin-left: -49.5%; text-align: right;">{type[0]} <input type="checkbox" bind:checked={SelectedIndivdualGraphs[key]}></p>
        {/each}
        <Accordian>
            <div slot="head">
                <p>Click here to learn about each individual graph</p>
            </div>
            <div slot="details" style="padding: 1rem;">
                <p>Length of Battle: This graph shows the length of each fight in a bar chart. Useful to see if fights are ending early.</p>
                <p>DoT Damage Distribution: This graph shows the DoT damage (only DoT) of each ship in a box plot. NOTE, DoT dmg is still given to the ship who started it. Useful to see who is starting DoT.</p>
                <p>Remaining HP% of Ships: This graph shows the remaining HP% of each ship at the end of the fight in a box plot. Useful to see if any ships are dying or how much damage they are taking.</p>
                <p>PURE Damage Distribution: This graph shows the PURE damage (AA and DoT not included) of each in a box plot. Useful to compare final damage totals.</p>
                <p>AA Damage Distribution: This graph shows the AA damage (only AA) of each ship in a box plot. NOTE, this is the actual AA dmg dealt per ship, not the wierd stuff the game does to AA. Useful to compare final AA values.</p>
                <p>SURFACE Damage Distribution: This graph shows the SURFACE damage (PURE damage and DoT damage) in a box plot. </p>
                <p>Total Dmg: This graph shows the SURFACE (PURE and DoT) damage of the fleet in a stacked bar chart for each attempt. Useful for comparing varience across runs.</p>
                <p>Standardized Total Damage: This graph is the same as "Total Dmg" except the scaling. Each bar is scaled so that the best run is 100%, the worst is 0%, and everything else proportioned accordingly. Can be useful to "zoom" in on the "Total Damage" graph.</p>
                <p>Average Timeline: This graph takes the PURE damage that is dealt in every second and averages it across all runs per ship. Useful to see the damage distribution vs time.</p>
                <p>Timelines: This graph is actually a set of graphs. It generates one graph per attempt which plots: the damage each ship deals in a specific second, torpedo launches/airstrikes/salvos, and the cloak state of airstrikes. NOTE, this is the only graph where selecting a ship in the legend will not update the scaling due to the annotations. Useful for seeing exactly when things launch (hovering over the annotation will show the exact launch time) and the damage that is being dealt at a specific time.</p>
            </div>
        </Accordian>
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
            <p style="width: 100%; margin-left: -49.5%; text-align: right;">{type[0]} <input type="checkbox" bind:checked={SelectedGroupGraphs[key]}></p>
        {/each}
        <Accordian>
            <div slot="head">
                <p>Click here to learn about each group graph</p>
            </div>
            <div slot="details" style="padding: 1rem;">
                <p>Remember to only compare across configs with the same goal in mind. Comparing a config that gave it's target 9,999,999hp and one that reduced it to 1,000,000hp will not provide valuble insight.</p>
                <p>Damage Distribution: This graph compares the sum SURFACE damage of each attempt and plots it in a box plot for each config. Useful to compare the final damage of different configs.</p>
                <p>Standard Deviation: This graph compares the standard deviation of each config in a bar chart. Useful to compare the consistency of damage across configs.</p>
                <p>Kill %: This graph compares the kill ratio of each config in a bar chart. Useful to compare kill rates.</p>
            </div>
        </Accordian>
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

        <table style="width: 100%;">
            <tbody>
                {#each chunkArray(ConfigNames, ELEMENTS_PER_ROW) as row}
                    <tr>
                        {#each row as Name}
                            <td style="vertical-align: top; border: 1px solid black;">
                                <Accordian style='width: 100%;'>
                                    <div slot="head" style="">
                                        <p>{Name} <input type="checkbox" bind:checked={SelectedConfigs[Name]}></p>
                                    </div>
                                    <div slot="details" style="width: 994px; overflow-x: scroll;">
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
                            </td>
                        {/each}
                        {#if row.length < ELEMENTS_PER_ROW}
                            {#each Array(ELEMENTS_PER_ROW - row.length) as _}
                                <td></td>
                            {/each}
                        {/if}
                    </tr>
                {/each}
            </tbody>
        </table>
        
    </div>
    <br>
    <button on:click={GenerateCode} style="font-size: 69px;">Generate graphs</button>
</div>