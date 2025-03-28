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
try {
    [SelectedConfigs, SelectedIndividualGraphTypes, SelectedGroupGraphs] = LZString.decompressFromEncodedURIComponent(code).split("!").map((str) => JSON.parse(str)) 
    
} catch (e) {
    console.log("error decoding code: ", code, e);
    goto("#/view")
}
console.log(SelectedConfigs, SelectedIndividualGraphTypes, SelectedGroupGraphs);
Configs = Configs.filter((config) => SelectedConfigs.includes(config.outputName));
let complete = false;
let imageManager = new ImageLoader();
imageManager.init().then(async () => {
    await Promise.all(Configs.map(async (config, i) => {
        PerConfigComponents[config.outputName] = [await process_fleet(config, imageManager)];
        const pre = document.createElement("pre");
        pre.textContent = JSON.stringify(config, null, 2);
        PerConfigComponents[config.outputName].push(pre);
        PerConfigComponents[config.outputName].push(...await Promise.all(generate_config_plots(config, i, Configs.length)))
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
        })
        div.children[0].children[1].replaceChildren(...PerConfigComponents[config.outputName])
        div.prepend(header);
        Container.appendChild(div);
    });
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
    complete = true;
})

</script>
<div bind:this={Container}></div>
<div bind:this={GroupContainer}></div>
{#if !complete && !(code === "NoXQhKEkA")}
    <p>If you are seeing this there is 3 possibilities</p>
    <p>1. The graphs are loading. This is the most probable. The more graphs you want and the more configs there are the longer this will take.</p>
    <p>2. The tool broke loading. Eventually I'll add catches in the code but I'm a bad dev so it might be a while</p>
    <p>3. You entered a bad code. Again eventually I'll add catches to see that but for now see the previous point</p>
{/if}
{#if code === "NoXQhKEkA" }
    <p>You entered the code that generates nothing.</p>
    <p>good job</p>
{/if}