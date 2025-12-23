
<script lang="ts">
import { goto } from '$app/navigation';
import { GroupGraphTypes, IndividualGraphTypes, ImageLoader, process_fleet, SEARCH_TYPES, ELEMENTS_PER_ROW, ENEMIES } from "$lib/index";
import type { ViewConfig } from '$lib/index';
import * as LZString from "lz-string";
import Accordian from '../../Accordian.svelte';

let configs: ViewConfig[] = [];
let ConfigSearchTerm: string = "";
let ConfigSearchType: keyof typeof SEARCH_TYPES = "Name";
let code: string = "";
let SelectedConfigs: Record<string, boolean> = {};
let SelectedIndivdualGraphs: Record<string, boolean> = {};
let SelectedGroupGraphs: Record<string, boolean> = {};
let imageLoader: ImageLoader = new ImageLoader();


Promise.all(
  Object.entries(import.meta.glob("../../configs/*.json")).map(async ([path, loader]) => {
    const mod = await loader();
    // @ts-ignore
    const data = mod.default ?? mod;
    // @ts-ignore
    const id = path.split("/").pop().replace(/\.json$/, "");
    return { id, ...data, "active": true, "images": [null, false] };
  })
).then((confs: ViewConfig[]) => {
    confs.sort((a, b) => {
        let v = b.createdAt.localeCompare(a.createdAt)
        if (v == 0) {
            v = a.outputName.localeCompare(b.outputName);
        };
        return v;
    });
    configs = confs;
})


function GotoCode() {
    goto(`#/view_code?code=${code}`);
}


function GenerateCode() {
    code = LZString.compressToEncodedURIComponent(`${
        JSON.stringify(Object.entries(SelectedConfigs).filter(([name, wanted]) => wanted).map(([name, wanted]) => name))
    }!${
        JSON.stringify(Object.entries(SelectedIndivdualGraphs).filter(([name, wanted]) => wanted).map(([name, wanted]) => name))
    }!${
        JSON.stringify(Object.entries(SelectedGroupGraphs).filter(([name, wanted]) => wanted).map(([name, wanted]) => name))
    }`);
    GotoCode()
}


function SortConfigs() {
    configs.forEach((conf) => {
        conf.active = SEARCH_TYPES[ConfigSearchType](conf, ConfigSearchTerm);
    });
    configs = configs; // don't question it
}


function Chunk(arr: ViewConfig[]): ViewConfig[][] {
    const result = [];
    for (let i=0; i<arr.length; i+=ELEMENTS_PER_ROW) {
        result.push(arr.slice(i, i + ELEMENTS_PER_ROW));
    }
    return result;
}
</script>
<section class="intro">
    <p>Select configs to analyze and choose which graphs to generate.</p>
    <div class="code-input">
        <label>
            Have a code?
            <input type="text" bind:value={code}>
        </label>
        <button on:click={GotoCode}>Load</button>
    </div>
</section>
<section>
    <h2>Graphs</h2>
    <div class="panel">
        <h3>Individual graphs</h3>
        <div class="bulk-actions">
            <button on:click={function () {
                Object.keys(SelectedIndivdualGraphs).forEach((key) => {
                    SelectedIndivdualGraphs[key] = !SelectedIndivdualGraphs[key];
                })}}>Invert
            </button>
            <button on:click={function () {
                Object.keys(SelectedIndivdualGraphs).forEach((key) => {
                    SelectedIndivdualGraphs[key] = true;
                })}}>All
            </button>
            <button on:click={function () {
                Object.keys(SelectedIndivdualGraphs).forEach((key) => {
                    SelectedIndivdualGraphs[key] = false;
                })}}>None
            </button>
        </div>

        <div class="checkbox-list">
            {#each Object.entries(IndividualGraphTypes) as [key, type]}
                <label>
                    <input type="checkbox" bind:checked={SelectedIndivdualGraphs[key]}>
                    {type[0]}
                </label>
            {/each}
        </div>
        <Accordian>
            <div slot="head">Click here to learn about each individual graph</div>
            <div slot="details">
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
    </div>
    <div class="panel">
        <h3>Group graphs</h3>
        <div class="bulk-actions">
            <button on:click={function () {
                Object.keys(SelectedGroupGraphs).forEach((key) => {
                    SelectedGroupGraphs[key] = !SelectedGroupGraphs[key];
                })}}>Invert
            </button>
            <button on:click={function () {
                Object.keys(SelectedGroupGraphs).forEach((key) => {
                    SelectedGroupGraphs[key] = true;
                })}}>All
            </button>
            <button on:click={function () {
                Object.keys(SelectedGroupGraphs).forEach((key) => {
                    SelectedGroupGraphs[key] = false;
                })}}>None
            </button>
        </div>
        <div class="checkbox-list">
            {#each Object.entries(GroupGraphTypes) as [key, type]}
                <label>
                    <input type="checkbox" bind:checked={SelectedGroupGraphs[key]}>
                    {type[0]}
                </label>
            {/each}
        </div>
        <Accordian>
            <div slot="head">
                <p>Click here to learn about each group graph</p>
            </div>
            <div slot="details">
                <p>Remember to only compare across configs with the same goal in mind. Comparing a config that gave it's target 9,999,999hp and one that reduced it to 1,000,000hp will not provide valuble insight.</p>
                <p>Damage Distribution: This graph compares the sum SURFACE damage of each attempt and plots it in a box plot for each config. Useful to compare the final damage of different configs.</p>
                <p>Standard Deviation: This graph compares the standard deviation of each config in a bar chart. Useful to compare the consistency of damage across configs.</p>
                <p>Kill %: This graph compares the kill ratio of each config in a bar chart. Useful to compare kill rates.</p>
            </div>
        </Accordian>
    </div>
</section>
<section>
    <h2>Configs</h2>
    <div class="bulk-actions">
        <button on:click={function () {
            configs.forEach((conf) => {
                if (conf.active) {
                    SelectedConfigs[conf.id] = !SelectedConfigs[conf.id];
                }
            });
        }}>Invert</button><button on:click={function () {
            configs.forEach((conf) => {
                if (conf.active) {
                    SelectedConfigs[conf.id] = true;
                }
            });
        }}>All</button><button on:click={function () {
            configs.forEach((conf) => {
                if (conf.active) {
                    SelectedConfigs[conf.id] = false;
                }
            });
        }}>None</button>
    </div>
    <div class="bulk-actions">
        {#each Object.keys(SEARCH_TYPES) as type}
            <label style="margin-right: 1rem;">
                <input type="radio" name="searchType" value={type} bind:group={ConfigSearchType} on:change={() => ConfigSearchTerm = ""}> {type}
            </label>
        {/each}
    </div>

    <div class="search">
        <label>Search: <input type="text" bind:value={ConfigSearchTerm} on:input={SortConfigs}></label>
    </div>
</section>
<div class="config-list">
    {#each configs.filter(c => c.active) as conf}
        <div class="config-card">
            
            <label class="config-select">
                <input
                    type="checkbox"
                    bind:checked={SelectedConfigs[conf.id]}
                    title="Include this config in graphs"
                />
            </label>

            <Accordian>
                <div slot="head">
                    <div class="config-head">
                        <span class="config-title" style="padding-left: 20px;">{conf.outputName}</span>
                        <span class="config-meta">
                            {conf.author} | {conf.createdAt}
                        </span>
                    </div>
                </div>

                <div slot="details">
                    <div class="config-details">

                        <pre style="overflow-x: auto;">{JSON.stringify(conf, [
                            "outputName",
                            "author",
                            "description",
                            "fleetBuilderLink",
                            "enemyId",
                            "dungeonId",
                            "ft",
                            "createdAt"
                        ], 2)}</pre>

                        <div class="config-image-area">
                            <div class="image-frame" bind:this={conf.images[0]}>
                                <div class="image-placeholder">
                                    Fleet image not generated
                                </div>
                            </div>

                            {#if !conf.images[1]}
                                <button
                                    class="generate-image"
                                    on:click={async () => {
                                        if (imageLoader.rarity.length === 0) {
                                            await imageLoader.init();
                                        }
                                        conf.images[0]?.replaceChildren(
                                            await process_fleet(conf, imageLoader)
                                        );
                                        conf.images[1] = true;
                                    }}>
                                    Generate fleet image
                                </button>
                            {/if}
                        </div>

                    </div>
                </div>
            </Accordian>

        </div>
    {/each}
</div>

<div class="generate">
    <button class="primary" on:click={GenerateCode}>
        Generate
    </button>
</div>
<style>
.config-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

/* Card shell */
.config-card {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    background: #fafafa;
    border: 1px solid #ccc;
    border-radius: 6px;
    overflow: hidden;
}

/* Checkbox column */
.config-select {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 1rem;
    background: #f0f0f0;
    border-right: 1px solid #ccc;
}

/* Accordion header content */
.config-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.config-title {
    font-weight: 600;
}

.config-meta {
    font-size: 0.85rem;
    color: #666;
    white-space: nowrap;
}

/* Expanded content */
.config-details {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1rem 0.25rem;
}

/* JSON info block */
.config-info pre {
    max-height: 16rem;
    overflow: auto;
    background: #111;
    color: #ddd;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
}

/* Image section */
.config-image-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

/* Ensures exact 994x333 display */
.image-frame {
    width: 994px;
    height: 333px;
    background: #222;
    border: 1px solid #444;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.image-placeholder {
    color: #888;
    font-size: 0.9rem;
}

.generate-image {
    padding: 0.4rem 0.8rem;
}

section {
    max-width: 750px;
    margin: 1.5rem auto;
    padding: 0 1rem;
}
.panel {
    flex: 1;
    min-width: 300px;
    border: 1px solid #ccc;
    padding: 1rem;
}
.bulk-actions {
    margin: 0.5rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.checkbox-list label {
    display: block;
    margin: 0.25rem 0;
}

.generate {
    position: sticky;
    bottom: 0;
    padding: 1rem;
    text-align: center;
}
button {
    padding: 0.4rem 0.8rem;
}
button.primary {
    font-size: 1.5rem; 
    padding: 0.75rem 2rem;
}
</style>