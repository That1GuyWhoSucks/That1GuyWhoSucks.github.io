<script lang="ts">
import * as Plotly from "plotly.js";
import RawResults from '../../results.json';
import RawConfigs from '../../configs.json';
import * as LZString from "lz-string"
import { type Config, IndividualGraphTypes, GroupGraphTypes, type Results, ShipData, process_fleet, ImageLoader } from "$lib/index";
import { goto } from "$app/navigation";
import { mount } from "svelte";
import Accordian from "../../Accordian.svelte";
let Configs: Config[] = RawConfigs as Config[];
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
                pre.style = "word-wrap: anywhere; white-space: pre-wrap;"
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
                div.style = "height: 1060px; overflow-y: scroll;"
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
<div style="text-align: center;">
    <h1>Code: {code}</h1>
    {#if status === 0 && !(code === "NoXQhKEkA")}
        <h1>Loading...</h1>
    {/if}
    {#if status === 2}
        <h1>ERROR!</h1>
        <p>If you know what the console is check that, otherwise just yell @that1nerd on discord.</p>
        <button on:click={function () {
            goto("#/view")
        }}>Go back</button>
    {/if}
    {#if status === 3}
        <h1>Your code is invalid.</h1>
        <p>If you think this is an error yell @that1nerd on discord.</p>
        <button on:click={function () {
            goto("#/view")
        }}>Go back</button>
    {/if}
    {#if code === "NoXQhKEkA" }
        <p>You entered the code that generates nothing.</p>
        <p>Good job.</p>
        <button on:click={function () {
            goto("#/view")
        }}>Go back</button>
    {/if}
</div>
<Accordian>
    <h2 slot="head">Tips and extra info</h2>
    <div slot="details" style="">
        <p>You can click on elements in legends to disable them in the graph. The graph will automatically scale to the new data.</p>
        <p>Hover over elements to see their exact value/s. Hovering over annotations will show the time the event occured.</p>
        <p>Selected Configs: {SelectedConfigs.join(", ")}</p>
        <p>Selected Individual Graphs: {SelectedIndividualGraphTypes.map((graph) => IndividualGraphTypes[graph as keyof typeof IndividualGraphTypes][0]).join(", ")}</p>
        <p>Selected Group Graphs: {SelectedGroupGraphs.map((graph) => GroupGraphTypes[graph as keyof typeof GroupGraphTypes][0]).join(", ")}</p>
    </div>
</Accordian>
<div>
    
    
</div>
<div bind:this={Container} style="display: flex; 
        flex-direction: row; 
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden; 
        min-width: fit-content;"></div>
<br>
<div bind:this={GroupContainer} style="width: 1060px; min-width: 1060px;"></div>