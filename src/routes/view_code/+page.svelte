<script lang="ts">
import * as Plotly from "plotly.js";
import RawResults from '../../results.json';
import RawConfigs from '../../configs.json';
import * as LZString from "lz-string"
import { type Config, IndividualGraphTypes, GroupGraphTypes, type Results, ShipData, process_fleet, ImageLoader } from "$lib/index";
import { goto } from "$app/navigation";
import { mount } from "svelte";
import Accordian from "../../Accordian.svelte";
let Configs: Config[] = RawConfigs;
Configs = Configs.filter((config: Config) => {
    return config.outputName in RawResults
});
// @ts-ignore
let data: Record<string, Results[]> = RawResults;

const code = window.location.hash.split("code=")[1];


function generate_config_plots(config: Config, index: number, total: number) {
    const key = config.outputName;
    let ship_data: Record<string, ShipData> = {};
    Object.keys(data[key][0].Statistics).forEach((key) => {
        ship_data[key] = new ShipData(key)
    });
    
    data[key].forEach((test) => {
        Object.keys(test.Statistics).forEach((ship) => {
            ship_data[ship].addTest(test.Statistics[ship]);
        })
    });

    ship_data = Object.fromEntries(Object.entries(ship_data).sort(([a, _], [b, __]) => a.localeCompare(b)));
    return SelectedIndividualGraphTypes.map((graph) => {
        // @ts-ignore
        return IndividualGraphTypes[graph][1](data, key, ship_data)
    })
}
function generate_overall_plots(configs: Config[]) {
    return SelectedGroupGraphs.map((graph) => {
        // @ts-ignore
        return GroupGraphTypes[graph][1](configs, data)
    })
}

let PerConfigComponents: Record<string, HTMLElement[]> = {};
let Container: HTMLElement;
let GroupContainer: HTMLElement;
let SelectedConfigs: string[] = [];
let SelectedIndividualGraphTypes: string[] = []; 
let SelectedGroupGraphs: string[] = [];
let status = 0;
try {
    [SelectedConfigs, SelectedIndividualGraphTypes, SelectedGroupGraphs] = LZString.decompressFromEncodedURIComponent(code).split("!").map((str) => JSON.parse(str));
} catch (e) {
    console.log("error decoding code: ", code, e);
    status = 3;
}
Configs = Configs.filter((config) => SelectedConfigs.includes(config.outputName));
if (status === 0) {
    let imageManager = new ImageLoader();
    try {
        imageManager.init().then(async () => {
            await Promise.all(Configs.map(async (config, i) => {
                PerConfigComponents[config.outputName] = [await process_fleet(config, imageManager)];
                const pre = document.createElement("pre");
                pre.textContent = JSON.stringify(config, null, 2);
                PerConfigComponents[config.outputName].push(pre, ...await Promise.all(generate_config_plots(config, i, Configs.length)))
            }));
            Configs.forEach((config) => {
                const div = document.createElement("div");
                const header = document.createElement("h1");
                header.innerText = config.outputName;
                
                mount(Accordian, {
                    target: div,
                    props: {
                        open: true
                    }
                });
                div.children[0].children[1].replaceChildren(...PerConfigComponents[config.outputName])
                div.prepend(header);
                Container.appendChild(div);
            });
            if (SelectedGroupGraphs.length > 0) {
                const header = document.createElement("h1");
                header.innerText = "Group Graphs";
                mount(Accordian, {
                    target: GroupContainer,
                    props: {
                        open: true
                    }
                })
                GroupContainer.children[0].children[1].replaceChildren(...await Promise.all(generate_overall_plots(Configs)));
                GroupContainer.prepend(header); 
                
            }
            status = 1;
        })
    } catch (e) {
        console.log("Error is: ", e);
        status = 2;
    }
}
</script>
<div bind:this={Container}></div>
<div bind:this={GroupContainer}></div>
{#if status === 0 && !(code === "NoXQhKEkA")}
    <h1>Loading...</h1>
{/if}
{#if status === 2}
    <h1>ERROR!</h1>
    <p>If you know what the console is check that, otherwise just yell @That1Nerd on discord</p>
    <button on:click={function () {
        goto("#/view")
    }}>Go back</button>
{/if}
{#if status === 3}
    <h1>Yo dawg, your code is invalid</h1>
    <p>If you think this is an error yell @That1Nerd on discord</p>
    <button on:click={function () {
        goto("#/view")
    }}>Go back</button>
{/if}
{#if code === "NoXQhKEkA" }
    <p>You entered the code that generates nothing.</p>
    <p>good job</p>
    <button on:click={function () {
        goto("#/view")
    }}>Go back</button>
{/if}