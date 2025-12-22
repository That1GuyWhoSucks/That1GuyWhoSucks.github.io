<script lang="ts">
import * as LZString from "lz-string"
import { type Config, IndividualGraphTypes, GroupGraphTypes, type Results, ShipData, process_fleet, ImageLoader, get_fleet_by_url } from "$lib/index";
import { goto } from "$app/navigation";
import { mount } from "svelte";
import Accordian from "../../Accordian.svelte";
import type { PlotlyHTMLElement } from "plotly.js";

const code = window.location.hash.split("code=")[1];

function generate_config_plots(config: Config, res: Results[], imageLoader: ImageLoader): PlotlyHTMLElement[] {
    let ship_data: Record<string, ShipData> = {};
    Object.keys(res[0].Statistics).forEach((key) => {
        ship_data[key] = new ShipData(imageLoader.ship_data[key]["en_name"], key)
    });
    
    res.forEach((test) => {
        Object.keys(test.Statistics).forEach((ship) => {
            ship_data[ship].addTest(test.Statistics[ship]);
        })
    });
    const fleet = get_fleet_by_url(config);
    let con = [fleet[1][1], fleet[1][0], fleet[1][2], fleet[0][2], fleet[0][1], fleet[0][0]].map((s) => {
        return s[0];
    }).filter((s) => s).map((k) => ship_data[k]);
    return SelectedIndividualGraphTypes.map((graph) => {
        // @ts-ignore
        return IndividualGraphTypes[graph][1](res, con)
    })
}

function generate_overall_plots(configs: Config[], res: Record<string, Results[]>) {
    return SelectedGroupGraphs.map((graph) => {
        // @ts-ignore
        return GroupGraphTypes[graph][1](configs, res)
    })
}

let Container: HTMLElement;
let GroupContainer: HTMLElement;
let SelectedConfigs: string[] = [];
let Configs: Config[] = [];
let SelectedIndividualGraphTypes: (keyof typeof IndividualGraphTypes)[] = []; 
let SelectedGroupGraphs: (keyof typeof GroupGraphTypes)[] = [];
let status = 0;
try {
    [SelectedConfigs, SelectedIndividualGraphTypes, SelectedGroupGraphs] = LZString.decompressFromEncodedURIComponent(code).split("!").map((str) => JSON.parse(str));
} catch (e) {
    console.log("error decoding code: ", code, e);
    status = 3;
}
if (status === 0) {
    let imageManager = new ImageLoader();
    try {
        imageManager.init().then(async () => {
            let Res: Record<string, Results[]> = {};
            Promise.all(SelectedConfigs.map(async (id) => {
                const conf: Config = (await import(`../../configs/${id}.json`, { with: { type: "json" } })).default;
                conf.id = id;
                const res: Results[] = (await import(`../../results/${id}.json`, { with: { type: "json" } })).default;
                const div = document.createElement("div");
                const header = document.createElement("h1");
                const pre = document.createElement("pre");
                pre.textContent = JSON.stringify(conf, ["outputName", "author", "description", "fleetBuilderLink", "enemyId", "dungeonId", "ft", "createdAt", "enemyModifications", "dungeonModifications"], 2);
                pre.style = "word-wrap: anywhere; white-space: pre-wrap;"
                header.innerText = conf.outputName;
                mount(Accordian, {
                    target: div,
                    props: {
                        open: true
                    }
                });
                // @ts-ignore
                div.children[0].children[1].replaceChildren(...[
                    await process_fleet(conf, imageManager), 
                    pre, 
                    ...await Promise.all(generate_config_plots(conf, res, imageManager))
                ]);
                div.prepend(header);
                div.style = "height: 1060px; overflow-y: scroll; width: 1080px"
                Container.appendChild(div);
                Configs.push(conf);
                Res[conf.id] = res;
            })).then(async () => {
                Configs = Configs;
                if (SelectedGroupGraphs.length > 0) {
                    const header = document.createElement("h1");
                    header.innerText = "Group Graphs";
                    mount(Accordian, {
                        target: GroupContainer,
                        props: {
                            open: true
                        }
                    })
                    GroupContainer.children[0].children[1].replaceChildren(...await Promise.all(generate_overall_plots(Configs, Res)));
                    GroupContainer.prepend(header); 
                }
                status = 1;
            });
            
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
<Accordian open={true}>
    <h2 slot="head">Tips and extra info</h2>
    <div slot="details" style="width: fit-content">
        <p>You can click on elements in legends to disable them in the graph. The graph will automatically scale to the new data.</p>
        <p>Hover over elements to see their exact value/s. Hovering over annotations will show the time the event occured.</p>
        <p>Selected Configs: {Configs.map((conf) => conf.outputName).join(", ")}</p>
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