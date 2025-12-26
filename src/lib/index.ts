import * as Plotly from "plotly.js";
import LZString from 'lz-string';
import CryptoJS from 'crypto-js';
// enemyID, dungeonID
export const ENEMIES = {
    "Hiryuu META": [295015, 296015],
    "Ark Royal META": [295030, 296030],
    "Helena META": [295045, 296045],
    "Soryuu META": [295060, 296060],
    "Gneisenau META": [295075, 296075],
    "Scharnhorst META": [295090, 296090],
    "Repulse META": [295105, 296105],
    "Renown META": [295120, 296120],
    "Arizona META": [295135, 296135],
    "Queen Elizabeth META": [295150, 296150],
    "Algérie META": [295165, 296165],
    "Jintsuu META": [295180, 296180],
    "Kirov META": [295195, 296195],
    "Rodney META": [295210, 296210],
    "Wichita META": [295225, 296225],
    "Nagato META": [295240, 296240],
    "Taihou META": [295255, 296255],
    "Hornet META": [295270, 296270],
    "Kawakaze META": [295285, 296285],
    "Yuudachi META": [295300, 296300],
    "Yorktown META": [295315, 296315],
};

export interface IndividualFleetTech {
    Health?: number
    Firepower?: number
    Torpedo?: number
    AA?: number
    Aviation?: number
    Reload?: number
    Armor?: number
    Accuracy?: number
    Evasion?: number
    Speed?: number
    Luck?: number
    ASW?: number
}

export interface FleetTech {
    DD?: IndividualFleetTech
    CL?: IndividualFleetTech
    CA?: IndividualFleetTech
    BC?: IndividualFleetTech
    BB?: IndividualFleetTech
    CVL?: IndividualFleetTech
    CV?: IndividualFleetTech
    SS?: IndividualFleetTech
    BBV?: IndividualFleetTech
    AR?: IndividualFleetTech
    BM?: IndividualFleetTech
    SSV?: IndividualFleetTech
    CB?: IndividualFleetTech
    AE?: IndividualFleetTech
    IXS?: IndividualFleetTech
    IXV?: IndividualFleetTech
    IXM?: IndividualFleetTech
}

export interface CreatedConfig {
    outputName: string
    author: string
    description: string
    fleetBuilderLink: string
    enemyId: number
    dungeonId: number
    ft: FleetTech
    createdAt: string
    attempts: number
    enemyModifications: Record<string, any>
    dungeonModifications: Record<string, any>
}

export interface Config {
    outputName: string
    author: string
    description: string
    fleetBuilderLink: string
    enemyId: number
    dungeonId: number
    ft: FleetTech
    createdAt: string
    enemyModifications: Record<string, any>
    dungeonModifications: Record<string, any>
    id: string
}

export interface ViewConfig extends Config {
    active: boolean
    images: [HTMLElement | null, boolean]
}

export interface IndividualStatistics {
    Remaing_HP: number
    AA: number
    DoT: number
    DMG: number
}

export interface History {
    airstrikes: Record<string, Record<string, boolean>>
    torps: Record<string, Record<string, boolean>>
    salvos: Record<string, Record<string, boolean>>
}

export interface Results {
    Battle_Length: number
    Remaining_HP: number
    Statistics: Record<string, IndividualStatistics>
    Timed_Damage: Record<string, Record<string, number>>
    History: History
    DateRun: string
}

export const ELEMENTS_PER_ROW = 6;

export const SEARCH_TYPES = {
    "Name": (config: Config, term: string) => config.outputName.toLowerCase().includes(term.toLowerCase()),
    "Author": (config: Config, term: string) => config.author.toLowerCase().includes(term.toLowerCase()),
    "Description": (config: Config, term: string) => config.description.toLowerCase().includes(term.toLowerCase()),
    "Enemy ID": (config: Config, term: string) => config.enemyId.toString().includes(term),
    "Dungeon ID": (config: Config, term: string) => config.dungeonId.toString().includes(term)
};

export const ENEMY_MODIFIERS = {
    "HP": "durability",
    "AA": "antiaircraft",
    "EVA": "dodge",
    "LUCK": "luck",
    "SPEED": "speed",
    "RLD": "reload",
    "FP": "cannon",
    "AVI": "air",
    "TRP": "torpedo",
    "HIT": "hit",
    "Hull type": "type"
};
export const FT_SHIPS = [
    "DD",
    "CL",
    "CA",
    "BC",
    "BB",
    "CVL",
    "CV",
    "SS",
    "BBV",
    "AR",
    "BM",
    "SSV",
    "CB",
    "AE",
    "IXS",
    "IXV",
    "IXM",
];
export const FT_TECH = [
    "Health",
    "Firepower",
    "Torpedo",
    "AA",
    "Aviation",
    "Reload",
    "Accuracy",
    "Evasion",
    "ASW",
];
export const FT_SHIP_GROUP_TO_INDEX = {
    "DD": 1,
    "CL": 2,
    "CA": 3,
    "BC": 4,
    "BB": 5,
    "CVL": 6,
    "CV": 7,
    "SS": 8,
    "BBV": 10,
    "AR": 12,
    "BM": 13,
    "SSV": 17,
    "CB": 18,
    "AE": 19,
    "IXS": 22,
    "IXV": 23,
    "IXM": 24
}

export class ShipData {
    data: IndividualStatistics[];
    name: string;
    skin_id: string;
    constructor(name: string, skin_id: string) {
        this.data = [];
        this.name = name;
        this.skin_id = skin_id;
    }

    addTest(test: IndividualStatistics) {
        this.data.push(test);
    }

    totalDmg() {
        return this.data.map((test) => test.DMG + test.DoT)
    }

    AADmg() {
        return this.data.map((test) => test.AA)
    }

    pureDmg() {
        return this.data.map((test) => test.DMG)
    }

    DoTDmg() {
        return this.data.map((test) => test.DoT)
    }

    HealthRemaining() {
        return this.data.map((test) => test.Remaing_HP / 100.0)
    }

    length() {
        return this.data.length
    }
}

function PurDmg(data: Results[], ship_data: Record<string, ShipData>) {
    const D: Plotly.Data[] = Object.values(ship_data).map((val) => {
        return {
            y: val.pureDmg(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
            boxmean: true,
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "Pure dmg"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true},
        width: 994,
    })
}
function AADmg(data: Results[], ship_data: Record<string, ShipData>) {
    const D: Plotly.Data[] = Object.values(ship_data).map((val) => {
        return {
            y: val.AADmg(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
            boxmean: true,
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "AA dmg"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true},
        width: 994,
    })
}
function DotDmg(data: Results[], ship_data: ShipData[]) {
    const D: Plotly.Data[] = ship_data.map((val) => {
        return {
            y: val.DoTDmg(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
            boxmean: true,
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "DoT dmg"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true},
        width: 994,
    })
}
function SurfaceDmg(data: Results[], ship_data: ShipData[]) {
    const D: Plotly.Data[] = ship_data.map((val) => {
        return {
            y: val.totalDmg(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
            boxmean: true,
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "Surface dmg"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true},
        width: 994,
    })
}
function HPRemaining(data: Results[], ship_data: ShipData[]) {
    const D: Plotly.Data[] = ship_data.map((val) => {
        return {
            y: val.HealthRemaining(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
            boxmean: true,
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "Remaining hp%"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true},
        width: 994,
    })
}
function AvgTimeline(data: Results[], ship_data: ShipData[]) {
    let min: number;
    let max: number;
    data.forEach((attempt) => {
        Object.values(attempt.Timed_Damage).forEach((k) => {
            Object.keys(k).forEach((time) => {
                let ntime: number = Number(time);
                if (min == null || ntime < min) {
                    min = ntime;
                }
                if (max == null || ntime > max) {
                    max = ntime;
                }
            })
        })
    });
    const D: Plotly.Data[] = ship_data.map((ship) => {
        let record: Record<number, number> = {};
        for (let i=0; i<data.length; i++) {
            for (let time=min; time<=max; time++) {
                if (record[time] == null) {
                    record[time] = 0;
                }
                if (data[i].Timed_Damage[ship.skin_id][String(time)] != null) {
                    record[time] += data[i].Timed_Damage[ship.skin_id][time];
                }
            }
        }
        for (let time=min; time<=max; time++) {
            record[time] = record[time] / data.length;
        }

        return {
            x: Object.keys(record),
            y: Object.values(record),
            name: ship.name,
            type: "bar"
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "Average attempt"
        },
        yaxis: {fixedrange: true},
        xaxis: {
            fixedrange: true,
            dtick: 1,
            rotation: 90
        },
        barmode: "stack",
        width: 994,
    })
}
function AttemptLength(data: Results[], ship_data: ShipData[]): Promise<Plotly.PlotlyHTMLElement> {
    let bucks: Record<number, number> = {}
    data.forEach((res) => {
        if (!(Math.floor(res.Battle_Length) in bucks)) {
            bucks[Math.floor(res.Battle_Length)] = 0
        }
        bucks[Math.floor(res.Battle_Length)] += 1
    })
    return Plotly.newPlot(document.createElement("div"), [{
        x: Object.keys(bucks),
        y: Object.values(bucks),
        type: "bar"
    }], {
        title: {
            text: "Attempt length"
        },
        yaxis: {
            fixedrange: true,
            autorange: true,
            dtick: 1
        },
        xaxis: {
            fixedrange: true,
            dtick: 1,
            autorange: true
        },
        width: 994,
    });
}
function Timelines(data: Results[], ship_data: ShipData[]): Promise<HTMLElement> {
    let min: number;
    let max: number;
    const skinToName: Record<string, string> = {};
    ship_data.forEach((s) => {
        skinToName[s.skin_id] = s.name
    })
    data.forEach((attempt) => {
        Object.values(attempt.Timed_Damage).forEach((k) => {
            Object.keys(k).forEach((time) => {
                let ntime: number = Number(time);
                if (min == null || ntime < min) {
                    min = ntime;
                }
                if (max == null || ntime > max) {
                    max = ntime;
                }
            })
        })
    });

    const records: Plotly.Data[][] = data.map((res) => {
        return Object.entries(res.Timed_Damage).sort(([ship, _], [ship2, __]) => ship.localeCompare(ship2)).map(([ship, vals]) => {
            return {
                x: Object.keys(vals).map(k => Number(k)),
                y: Object.values(vals),
                name: skinToName[ship],
                type: "bar",
            }
        })
    })

    let total_max: number = 0;


    records.forEach((rec) => {
        for (let i = min; i <= max; i++) {
            let sum = 0;
            rec.forEach(element => {
                // @ts-ignore
                const index = element.x.indexOf(i);
                if (index !== -1) {
                    // @ts-ignore
                    sum += element.y[index];
                }
            });
            if (sum > total_max) {
                total_max = sum;
            }
        }
    });
    const div = document.createElement("div");
    return new Promise(async (resolve) => {
        div.replaceChildren(...await Promise.all(records.map((res, i) => {
            let annotations: Plotly.Annotations[] = []
            Object.entries(data[i].History.airstrikes).forEach(([ship, data]) => { 
                // @ts-ignore
                annotations.push(...Object.entries(data).map(([time, hidden]) => {
                    return {
                        x: Number(time),
                        y: total_max,
                        xref: "x",
                        yref: "y",
                        text: `${skinToName[ship]} airstrike ${hidden}`,
                        showarrow: false,
                        yshift: 0,
                        hovertext: time
                    }
                }))
            })
            Object.entries(data[i].History.salvos).forEach(([ship, data]) => { 
                // @ts-ignore
                annotations.push(...Object.entries(data).map(([time, hidden]) => {
                    return {
                        x: Number(time),
                        y: total_max,
                        xref: "x",
                        yref: "y",
                        text: `${skinToName[ship]} salvo`,
                        showarrow: false,
                        yshift: 0,
                        hovertext: time
                    }
                }))
            })
            Object.entries(data[i].History.torps).forEach(([ship, data]) => { 
                // @ts-ignore
                annotations.push(...Object.entries(data).map(([time, hidden]) => {
                    return {
                        x: Number(time),
                        y: total_max,
                        xref: "x",
                        yref: "y",
                        text: `${skinToName[ship]} torp`,
                        showarrow: false,
                        hovertext: time,
                        yshift: 0
                    }
                }))
            })
            // @ts-ignore
            annotations.sort((a, b) => a.x - b.x);
            let lastX = 0;
            let count = 0;
            annotations.forEach((an) => {
                if ((an.x as number) - lastX > 5) {
                    count = 0;
                }
                an.yshift = -15 * count;
                count += 1;
                lastX = an.x as number;
            })
            return Plotly.newPlot(document.createElement("div"), res, {
                title: {
                    text: `attempt ${i + 1} (${(100 - (data[i].Remaining_HP / 100)).toFixed(1)})%`
                },
                yaxis: {
                    fixedrange: true,
                    range: [0, total_max]
                },
                xaxis: {
                    fixedrange: true,
                    dtick: 1,
                    range: [min, max]
                },
                barmode: "stack",
                width: 994,
                annotations: annotations
            })
        })))
        resolve(div);
    })
    
}
function TotalDmg(data: Results[], ship_data: ShipData[]): Promise<Plotly.PlotlyHTMLElement> {
    let D: Plotly.Data[] = ship_data.map(data => {
        return {
            x: [...Array(data.data.length).keys()].map(i => i + 1),
            y: data.data.map(stats => {
                return stats.DMG + stats.DoT
            }),
            name: data.name,
            type: "bar"
        }
    })
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: `Total dmg`
        },
        yaxis: {
            fixedrange: true,
            // range: [0, total_max]
        },
        xaxis: {
            fixedrange: true,
            dtick: 1,
            // range: [min, max]
        },
        barmode: "stack",
        width: 994,
    })
}

function StandTotalDmg(data: Results[], ship_data: ShipData[]): Promise<Plotly.PlotlyHTMLElement> {
    const att = ship_data[0].data.length
    let D: Plotly.Data[] = Object.values(ship_data).map(sdata => {
        return {
            x: [...Array(att).keys()].map(i => i + 1),
            y: sdata.data.map(stats => {
                return stats.DMG + stats.DoT
            }),
            name: sdata.name,
            type: "bar"
        }
    });
    let max = 0;
    let min = Number.MAX_VALUE;
    let sums: number[] = [];
    for (let i=0; i<att; i++) {
        let sum = 0;
        D.forEach(val => {
            // @ts-ignore
            sum += val.y[i]
        })
        if (sum > max) {
            max = sum;
        }
        if (sum < min) {
            min = sum
        }
        sums.push(sum)
    }

    for (let i=0; i<att; i++) {
        const scalar: number = (sums[i] - min) / (max - min)
        D.forEach(val => {
            // @ts-ignore
            val.y[i] = scalar * (val.y[i] / sums[i]) * 100;
        })
    }

    D.push({
        x: [...Array(att).keys()].map(i => i + 1),
        y: data.map(res => res.Remaining_HP / 100),
        type: "scatter",
        name: "Remaining boss HP %"
    })

    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: `Standardized Total dmg (%)`
        },
        yaxis: {
            fixedrange: true,
            range: [0, 100]
        },
        xaxis: {
            fixedrange: true,
            dtick: 1,
            // range: [min, max]
        },
        barmode: "stack",
        width: 994,
    })
}

export const IndividualGraphTypes = {
    LengthOfBattle: ["Length of Battle", AttemptLength],
    DoTDmgDist: ["DoT Damage Distribution", DotDmg],
    RemainingHP: ["Remaining HP% of Ships", HPRemaining],
    PureDmgDist: ["Pure Damage Distribution", PurDmg],
    AADmgDist: ["AA Damage Distribution", AADmg],
    SurfaceDmgDist: ["Surface Damage Distribution", SurfaceDmg],
    TotalDmg: ["Total Dmg", TotalDmg],
    StandardizedDmg: ["Standardized Total Damage", StandTotalDmg],
    AvgTimeline: ["Average Timeline", AvgTimeline],
    Timelines: ["Timelines", Timelines],
}

function GroupDmgDist(configs: Config[], data: Record<string, Results[]>) {
    const D: Plotly.Data[] = configs.map((config) => {
        return {
            y: data[config.id].map((res) => {
                let sum = 0;
                Object.values(res.Statistics).forEach((stats) => {
                    sum += stats.DMG + stats.DoT
                })
                return sum
            }),
            name: config.outputName,
            boxpoints: "outliers",
            type: "box",
            boxmean: true,
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "Comp dmg distr"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true},
        width: 994,
    });
}

function GroupStdDevDistr(configs: Config[], data: Record<string, Results[]>) {
    function getStandardDeviation(array: number[]) {
        const n = array.length
        const mean = array.reduce((a, b) => a + b) / n
        return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
    }
    const D: number[] = configs.map((config) => {
        return getStandardDeviation(data[config.id].map((res) => {
            let sum = 0;
            Object.values(res.Statistics).forEach((stats) => {
                sum += stats.DMG + stats.DoT
            })
            return sum
        }))
    })
    
    return Plotly.newPlot(document.createElement("div"), [{
        x: configs.map(config => config.outputName),
        y: D,
        type: "bar"
    }], {
        title: {
            text: "Std dev"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true},
        width: 994,
    });
}
function GroupKillPerc(configs: Config[], data: Record<string, Results[]>) {
    const D: number[] = configs.map((config) => {
        return (data[config.id].filter((res) => res.Remaining_HP == 0).length / data[config.id].length) * 100;
    });
    return Plotly.newPlot(document.createElement("div"), [{
        x: configs.map(config => config.outputName),
        y: D,
        type: "bar"
    }], {
        title: {
            text: "Kill %"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true},
        width: 994,
    })
}

export const GroupGraphTypes = {
    DmgDist: ["Damage Distribution", GroupDmgDist],
    StdDev: ["Standard Deviation", GroupStdDevDistr],
    KillPerc: ["Kill %", GroupKillPerc],
}


const ERROR_DESC = {
    "no_data": "Fleet data is empty",
    "unzip_failed": "Invalid data",
    "unknown_version": "Unknown version",
    "corrupted_data": "Corrupted data"
}


export function loadDataByID(noDump = false, string: string) {
    let raw_data = string;
    if (!raw_data.length) {
        return ERROR_DESC["no_data"]
    }
    if (raw_data[0] !== "[") {
        raw_data = LZString.decompressFromEncodedURIComponent(raw_data);
    }
    // try decode uri
    if (!raw_data){
        raw_data = LZString.decompressFromEncodedURIComponent(
            decodeURIComponent(string)
        );
    }
        
    if (!raw_data) {
        return ERROR_DESC["unzip_failed"]
    }
    let [data, ver, hash] = raw_data.split("!"), ck;
    switch (ver) {
        case "0.04":
            ck = CryptoJS.SHA3(data, { outputLength: 256 }).toString();
            if (ck !== hash) {
                return loadError(ck);
            }
            data = JSON.parse(data);
            // if (!c_formation.sameAs(formation.v4))
            //     app.fleet.buildFleet(formation.v4, true);
            break;
        case "0.05":
            ck = CryptoJS.MD5(data).toString();
            if (ck !== hash) return loadError(ck);
            data = JSON.parse(data);
            // app.fleet.buildFleet(c_formation, true);
            break;
        case "0.06":
            ck = CryptoJS.MD5(data).toString().slice(0, 7);
            if (ck !== hash) return loadError(ck);
            data = JSON.parse(data);
            // app.fleet.buildFleet(c_formation, true);
            break;
        case "0.07":
            ck = CryptoJS.MD5(data).toString().slice(0, 7);
            if (ck !== hash) return loadError(ck);
            data = JSON.parse(data);
            // app.fleet.buildFleet(c_formation, true);
            break;
        default:
            return ERROR_DESC["unknown_version"]
    }
    return data;

    function loadError(_ck_ = "") {
        return ERROR_DESC["corrupted_data"]
    }
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

function loadImage(url: string, local=true): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);

        img.src = `${local ? "/" : ""}${url}`;
    });
}

export class ImageLoader {
    rarity: HTMLImageElement[];
    ship_data: Record<string, any>;
    equip_data: Record<string, any>;
    spweapon_data: Record<string, any>;
    constructor() {
        this.rarity = [];
        this.ship_data = {};
        this.equip_data = {};
        this.spweapon_data = {};
    }

    async init(): Promise<ImageLoader> {
        this.rarity = await Promise.all([1, 2, 3, 4, 5].map((num) => loadImage(`bg${num}.png`)));
        let t_ship_data = (await (await fetch("https://raw.githubusercontent.com/Renhex/AzurLaneFleet/master/js/ship_data.js")).text()).slice(18, -1);
        // "painting"
        let t_equip_data = (await (await fetch("https://raw.githubusercontent.com/Renhex/AzurLaneFleet/master/js/equip_data.js")).text()).slice(19, -1);
        // "icon"
        let t_spweapon_data = (await (await fetch("https://raw.githubusercontent.com/Renhex/AzurLaneFleet/master/js/sp_weapon_data.js")).text()).slice(23, -1);
        // icon

        let currentKey = "";
        let spareDic: Record<string, any> = {};
        t_ship_data.split("\n").forEach((line: string) => {
            line = line.trim();
            if (line.includes(": {")) {
                currentKey = line.split(":")[0];
                spareDic[currentKey] = {};
            } else if (currentKey != "" && line.startsWith("painting: ")) {
                spareDic[currentKey]["icon"] = line.split("'")[1];
            } else if (currentKey != "" && line.startsWith("rarity: ")) {
                spareDic[currentKey]["rarity"] = Number(line.slice(-2, -1));
            } else if (currentKey != "" && line.startsWith("en_name")) {
                spareDic[currentKey]["en_name"] = line.split("'").at(-2);
            }
        });
        this.ship_data = spareDic;
        spareDic = {};
        currentKey = "";
        t_equip_data.split("\n").forEach((line: string) => {
            line = line.trim();
            if (line.includes(": {")) {
                currentKey = line.split(":")[0];
                spareDic[currentKey] = {};
            } else if (currentKey != "" && line.startsWith("icon: ")) {
                spareDic[currentKey]["icon"] = line.split("'")[1];
            } else if (currentKey != "" && line.startsWith("rarity: ")) {
                spareDic[currentKey]["rarity"] = Number(line.slice(-2, -1));
            }
        });
        this.equip_data = spareDic;
        spareDic = {};
        currentKey = "";
        t_spweapon_data.split("\n").forEach((line: string) => {
            line = line.trim();
            if (line.includes(": {")) {
                currentKey = line.split(": {")[0];
                spareDic[currentKey] = {};
            } else if (currentKey != "" && line.startsWith("icon: ")) {
                spareDic[currentKey]["icon"] = line.split("'")[1];
            } else if (currentKey != "" && line.startsWith("rarity: ")) {
                spareDic[currentKey]["rarity"] = Number(line.slice(-2, -1));
            }
        });
        this.spweapon_data = spareDic;
        return this;
    }
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

    async fetch_or_black(img_type: string, img_id: string, imageLoader: ImageLoader) {
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
            bg = cloneImage(imageLoader.rarity[clamp(imageLoader.equip_data[img_id]["rarity"] - 2)]);
            img_id = imageLoader.equip_data[img_id]["icon"];
        } else if (img_type == "shipicon") {
            bg = cloneImage(imageLoader.rarity[clamp(imageLoader.ship_data[img_id]["rarity"] - 2)]);
            img_id = imageLoader.ship_data[img_id]["icon"];
        } else {
            bg = cloneImage(imageLoader.rarity[clamp(imageLoader.spweapon_data[img_id]["rarity"] - 1)]);
            img_id = imageLoader.spweapon_data[img_id]["icon"];
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

    async getImages(imageLoader: ImageLoader) {
        if (this.shipId == "") {
            return createSolidCanvas(71 * 7, 71 + 20 + 20, "black");
        }
        
        let images: HTMLCanvasElement[] = await Promise.all([this.fetch_or_black("shipicon", this.shipId.split("|")[0], imageLoader)])

        const gear_list = [this.gear1, this.gear2, this.gear3, this.gear4, this.gear5, this.fuckaug];
        images.push(...await Promise.all(
            gear_list.map((gear) =>
                this.fetch_or_black(
                    gear === this.fuckaug ? "spweapon" : "equips",
                    gear.split("|")[0],
                    imageLoader
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

export function createSolidCanvas(width: number, height: number, color: string): HTMLCanvasElement {
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

export function get_fleet_by_url(config: Config) {
    let fleet: any = loadDataByID(false, decodeURIComponent(config.fleetBuilderLink.split("?AFLD=")[1]));
    if (typeof fleet == "string") {
        return createSolidCanvas(71 * 2 * 7, 71 * 3, "black");
    }
    if (fleet.length == 1) {
        fleet = fleet[0];
    } else {
        if (config.outputName.includes(" - fleet ")) {
            fleet = fleet[Number(config.outputName.split(" - fleet ")[1]) - 1];
        }
    }
    return fleet;
}

function get_fleets_by_url(config: Config) {
    let fleet: any = loadDataByID(false, decodeURIComponent(config.fleetBuilderLink.split("?AFLD=")[1]));
    if (typeof fleet == "string") {
        return createSolidCanvas(71 * 2 * 7, 71 * 3, "black");
    }
    return fleet;
}

export async function process_fleet(config: Config, imageLoader: ImageLoader): Promise<HTMLDivElement> {
    const fleets = get_fleets_by_url(config);
    const output = document.createElement("div");
    // @ts-ignore
    fleets.forEach(async (fleet) => {
        let vang_ships: Ship[] = fleet[0].map((v: any[]) => new Ship(v));
        while (vang_ships.length < 3) {
            vang_ships.push(new Ship([]));
        }
        let main_ships: Ship[] = fleet[1].map((s: any[]) => new Ship(s));
        while (main_ships.length < 3) {
            main_ships.push(new Ship([]));
        }

        let vang_images: HTMLCanvasElement[] = await Promise.all(vang_ships.map((ship) => ship.getImages(imageLoader)));
        let main_images: HTMLCanvasElement[] = await Promise.all(main_ships.map((ship) => ship.getImages(imageLoader)));

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
        output.appendChild(finalCanvas);
    });
    output.style = "width: 994px;"
    
    return output;
}
