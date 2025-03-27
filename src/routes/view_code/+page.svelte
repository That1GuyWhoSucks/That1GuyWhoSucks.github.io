<script lang="ts">
import * as Plotly from "plotly.js";
import RawResults from '../../results.json';
import RawConfigs from '../../configs.json';
import * as LZString from "lz-string"
import { type Config, IndividualGraphTypes, GroupGraphTypes, type IndividualStatistics, type Results, ShipData, loadDataByID } from "$lib/index";
import { goto } from "$app/navigation";
let Configs: Config[] = RawConfigs;
Configs = Configs.filter((config: Config) => {
    return config.outputName in RawResults
});
// @ts-ignore
let data: Record<string, Results[]> = RawResults;

function loadImage(url: string, local=true): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);

        img.src = `${local ? "/" : ""}${url}`;
    });
}

function cloneImage(img: HTMLImageElement): HTMLImageElement {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.drawImage(img, 0, 0);
    }
    const newImg = new Image();
    newImg.src = canvas.toDataURL();
    return newImg;
}

function createSolidCanvas(width: number, height: number, color: string): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    }
    return canvas;
}

let rarity: HTMLImageElement[];
let ship_data: Record<string, any>;
let equip_data: Record<string, any>;
let spweapon_data: Record<string, any>;

async function loadData() {
    rarity = await Promise.all([1, 2, 3, 4, 5].map((num) => loadImage(`bg${num}.png`)));
    let t_ship_data = (await (await fetch("https://raw.githubusercontent.com/Renhex/AzurLaneFleet/master/js/ship_data.js")).text()).slice(18,-1);
    // "painting"
    let t_equip_data = (await (await fetch("https://raw.githubusercontent.com/Renhex/AzurLaneFleet/master/js/equip_data.js")).text()).slice(19,-1);
        // "icon"
    let t_spweapon_data = (await (await fetch("https://raw.githubusercontent.com/Renhex/AzurLaneFleet/master/js/sp_weapon_data.js")).text()).slice(23,-1);
    // icon

    let currentKey = "";
    let spareDic: Record<string, any> = {};
    t_ship_data.split("\n").forEach((line: string) => {
        line = line.trim();
        if (line.includes(": {")) {
            currentKey = line.split(":")[0]
            spareDic[currentKey] = {};
        } else if (currentKey != "" && line.startsWith("painting: ")) {
            spareDic[currentKey]["icon"] = line.split("'")[1];
        } else if (currentKey != "" && line.startsWith("rarity: ")) {
            spareDic[currentKey]["rarity"] = Number(line.slice(-2, -1))
        }
    })
    ship_data = spareDic
    spareDic = {}
    currentKey = ""
    t_equip_data.split("\n").forEach((line: string) => {
        line = line.trim();
        if (line.includes(": {")) {
            currentKey = line.split(":")[0]
            spareDic[currentKey] = {};
        } else if (currentKey != "" && line.startsWith("icon: ")) {
            spareDic[currentKey]["icon"] = line.split("'")[1];
        } else if (currentKey != "" && line.startsWith("rarity: ")) {
            spareDic[currentKey]["rarity"] = Number(line.slice(-2, -1))
        }
    })
    equip_data = spareDic
    spareDic = {}
    currentKey = ""
    t_spweapon_data.split("\n").forEach((line: string) => {
        line = line.trim();
        if (line.includes(": {")) {
            currentKey = line.split(": {")[0]
            spareDic[currentKey] = {};
        } else if (currentKey != "" && line.startsWith("icon: ")) {
            spareDic[currentKey]["icon"] = line.split("'")[1];
        } else if (currentKey != "" && line.startsWith("rarity: ")) {
            spareDic[currentKey]["rarity"] = Number(line.slice(-2, -1))
        }
    })
    spweapon_data = spareDic
}

class Ship {
    shipId: string = "";
    gear1: string = "";
    gear2: string = "";
    gear3: string = "";
    gear4: string = "";
    gear5: string = "";
    // aug: string = "";
    fuckaug: string = "";
    constructor(data: any[]) {
        function affToAff(aff: number) {
            if (aff == 1) { // stranger
                return 0
            } else if (aff == 2) { // friendly
                return 6100
            } else if (aff == 3) { // crush
                return 8100
            } else if (aff == 4) { // love
                return 10000
            } else if (aff == 5) { // oath and 100 <= x < 200
                return 10100
            } else if (aff == 6) {
                return 20000
            }
        }
        if (data && data.length > 1) {
            this.shipId = `${data[0]}|${parseInt(data[7].slice(0,2), 16)}|${affToAff(data[8])}`
            this.gear1 = `${data[1]}|${parseInt(data[7][2],16)}`;
            this.gear2 = `${data[2]}|${parseInt(data[7][3],16)}`;
            this.gear3 = `${data[3]}|${parseInt(data[7][4],16)}`;
            this.gear4 = `${data[4]}|${parseInt(data[7][5],16)}`;
            this.gear5 = `${data[5]}|${parseInt(data[7][6],16)}`;
            // this.aug = `${data[6] if str(data[6])[0:2] != '99' else str(data[6])[2::]}|${parseInt(data[7][7],16)}`;
            this.fuckaug = `${data[6]}|${parseInt(data[7][7],16)}`;
        }
    }

    async fetch_or_black(img_type: string, img_id: string) {
        function clamp(v: number) {
            if (v < 0) {
                v = 0;
            } else if (v > 4) {
                v = 4;
            }
            return v;
        }
        if (img_id == "0") {
            return createSolidCanvas(71, 71, "black");
        }
        let bg;
        if (img_type == "equips") {
            bg = cloneImage(rarity[clamp(equip_data[img_id]["rarity"] - 2)]);
            img_id = equip_data[img_id]["icon"];
        } else if (img_type == "shipicon") {
            bg = cloneImage(rarity[clamp(ship_data[img_id]["rarity"] - 2)]);
            img_id = ship_data[img_id]["icon"];
        } else {
            bg = cloneImage(rarity[clamp(spweapon_data[img_id]["rarity"] - 1)]);
            img_id = spweapon_data[img_id]["icon"];
        }
        const url = `https://raw.githubusercontent.com/Renhex/AzurLaneFleet/master/${img_type}/${img_id}.png`;
        try {
            const img = await loadImage(url, false);
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = 71;
            tempCanvas.height = 71;
            const ctx = tempCanvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(bg, 0, 0, 71, 71);
                ctx.drawImage(img, 0, 0, 71, 71);
            }
            return tempCanvas;
        } catch (e) {
            console.log(`Error fetching ${url}: ${e}`)
            return createSolidCanvas(71, 71, "black");
        }
    }

    async getImages() {
        if (this.shipId == "") {
            return createSolidCanvas(71 * 7, 71 + 20 + 20, "black");
        }
        
        let images: HTMLCanvasElement[] = await Promise.all([this.fetch_or_black("shipicon", this.shipId.split("|")[0])])

        const gear_list = [this.gear1, this.gear2, this.gear3, this.gear4, this.gear5, this.fuckaug];
        images.push(...await Promise.all(
            gear_list.map((gear) =>
                this.fetch_or_black(
                    gear === this.fuckaug ? "spweapon" : "equips",
                    gear.split("|")[0]
                )
            )
        ))


        let texts_top = [`aff ${Number(this.shipId.split("|")[2]) / 100}`]
        let texts_bottom  = [this.shipId.split('|')[1]]

        gear_list.forEach((gear) => {
            let gear_id: string = gear.split("|")[0]
            let gear_level = gear.split("|")[1]
            texts_top.push(gear_id != "0" ? `+${gear_level}` : "");
            texts_bottom.push("");
        })

        let text_height = 20;
        let total_width = 71 * images.length;
        let total_height = 71 + text_height * 2;
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = total_width;
        finalCanvas.height = total_height;
        const ctx = finalCanvas.getContext("2d");
        if (!ctx) return finalCanvas;

        // Fill background white.
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, total_width, total_height);
        // Set font for text
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";

        for (let i = 0; i < images.length; i++) {
            // Draw the image first.
            ctx.drawImage(images[i], i * 71, 20, 71, 71);

            // Draw top text over the image.
            let metrics = ctx.measureText(texts_top[i]);
            let textWidth = metrics.width;
            ctx.fillText(texts_top[i], i * 71 + (71 - textWidth) / 2, 14);

            // Draw bottom text below the image.
            metrics = ctx.measureText(texts_bottom[i]);
            textWidth = metrics.width;
            ctx.fillText(texts_bottom[i], i * 71 + (71 - textWidth) / 2, 71 + text_height + 14);
        }
        return finalCanvas;
    }
}

async function process_fleet(config: Config, index: number, total: number) {
    const key: string = config.outputName;
    let fleet: any = loadDataByID(false, decodeURIComponent(config.fleetBuilderLink.split("?AFLD=")[1]))
    if (typeof fleet == "string") {
        return createSolidCanvas(71 * 2 * 7, 71 * 3, "black")
    }
    if (fleet.length == 1) {
        fleet = fleet[0]
    } else {
        fleet = fleet[Number(key.split(" - fleet ")[1]) - 1]
    }

    let vang_ships: Ship[] = fleet[0].map((v: any[]) => new Ship(v));
    while (vang_ships.length < 3) {
        vang_ships.push(new Ship([]));
    }
    let main_ships: Ship[] = fleet[1].map((s: any[]) => new Ship(s));
    while (main_ships.length < 3) {
        main_ships.push(new Ship([]));
    }

    let vang_images: HTMLCanvasElement[] = await Promise.all(vang_ships.map((ship) => ship.getImages()));
    let main_images: HTMLCanvasElement[] = await Promise.all(main_ships.map((ship) => ship.getImages()));

    const width = vang_images[0].width * 2;
    const height = vang_images[0].height * 3;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = width;
    finalCanvas.height = height ;
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return finalCanvas;
    // Fill background white.
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    // Set font for text
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";

    for (let x=0; x<2; x++) {
        for (let y=0; y<3; y++) {
            if (x == 0) {
                ctx.drawImage(main_images[y], 0, y * main_images[y].height);
            } else {
                ctx.drawImage(vang_images[y], vang_images[y].width, y * vang_images[y].height);
            }
        }
    }
    return finalCanvas;
}

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
    [SelectedConfigs, SelectedIndividualGraphTypes, SelectedGroupGraphs] = LZString.decompressFromEncodedURIComponent(window.location.hash.split("code=")[1]).split("!").map((str) => JSON.parse(str)) 
    
} catch (e) {
    console.log("error decoding code: ", window.location.hash.split("code=")[1], e);
    goto("#/view")
}
console.log(SelectedConfigs, SelectedIndividualGraphTypes, SelectedGroupGraphs);
Configs = Configs.filter((config) => SelectedConfigs.includes(config.outputName))
loadData().then(async () => {
    await Promise.all(Configs.map(async (config, i) => {
        PerConfigComponents[config.outputName] = [await process_fleet(config, i, Configs.length)];
        PerConfigComponents[config.outputName].push(...await Promise.all(generate_config_plots(config, i, Configs.length)))
    }));
    Configs.forEach((config) => {
        const div = document.createElement("div");
        const header = document.createElement("h1");
        header.innerText = config.outputName;
        div.replaceChildren(header, ...PerConfigComponents[config.outputName]);
        Container.appendChild(div);
    });
    GroupContainer.replaceChildren(...await Promise.all(generate_overall_plots(Configs)));
})

</script>
<div bind:this={Container}></div>
<div bind:this={GroupContainer}></div>