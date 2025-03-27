import * as Plotly from "plotly.js";
import LZString from 'lz-string';
import CryptoJS from 'crypto-js';

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

export interface Config {
    outputName: string
    fleetBuilderLink: string
    attempts: number
    enemyId: number
    dungeonId: number
    const: object
    ft: FleetTech
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
}

export const TAB_SIZE: number = 40;

export class ShipData {
    data: IndividualStatistics[];
    name: string;
    constructor(name: string) {
        this.data = [];
        this.name = name;
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

function PurDmg(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>) {
    const D: Plotly.Data[] = Object.values(ship_data).map((val) => {
        return {
            y: val.pureDmg(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "Pure dmg"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true}
    })
}
function AADmg(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>) {
    const D: Plotly.Data[] = Object.values(ship_data).map((val) => {
        return {
            y: val.AADmg(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "AA dmg"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true}
    })
}
function DotDmg(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>) {
    const D: Plotly.Data[] = Object.values(ship_data).map((val) => {
        return {
            y: val.DoTDmg(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "DoT dmg"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true}
    })
}
function SurfaceDmg(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>) {
    const D: Plotly.Data[] = Object.values(ship_data).map((val) => {
        return {
            y: val.totalDmg(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "Surface dmg"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true}
    })
}
function HPRemaining(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>) {
    const D: Plotly.Data[] = Object.values(ship_data).map((val) => {
        return {
            y: val.HealthRemaining(),
            name: val.name,
            boxpoints: "outliers",
            type: "box",
        }
    });
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "Remaining hp%"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true}
    })
}
function AvgTimeline(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>) {
    let min: number;
    let max: number;
    data[key].forEach((attempt) => {
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
    const D: Plotly.Data[] = Object.values(ship_data).map((ship) => {
        let record: Record<number, number> = {};
        for (let i=0; i<data[key].length; i++) {
            for (let time=min; time<=max; time++) {
                if (record[time] == null) {
                    record[time] = 0;
                }
                if (data[key][i].Timed_Damage[ship.name][String(time)] != null) {
                    record[time] += data[key][i].Timed_Damage[ship.name][time];
                }
            }
        }
        for (let time=min; time<=max; time++) {
            record[time] = record[time] / data[key].length;
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
        width: 1800,
        height: 600,
    })
}
function AttemptLength(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>) {
    let bucks: Record<number, number> = {}
    data[key].forEach((res) => {
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
    });
}
function Timelines(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>): Promise<HTMLElement> {
    let min: number;
    let max: number;
    data[key].forEach((attempt) => {
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

    const records: Plotly.Data[][] = data[key].map((res) => {
        return Object.entries(res.Timed_Damage).sort(([ship, _], [ship2, __]) => ship.localeCompare(ship2)).map(([ship, vals]) => {
            return {
                x: Object.keys(vals).map(k => Number(k)),
                y: Object.values(vals),
                name: ship,
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
            Object.entries(data[key][i].History.airstrikes).forEach(([ship, data]) => { 
                // @ts-ignore
                annotations.push(...Object.entries(data).map(([time, hidden]) => {
                    return {
                        x: Number(time),
                        y: total_max,
                        xref: "x",
                        yref: "y",
                        text: `${ship} airstrike ${hidden}`,
                        showarrow: false,
                        yshift: 0,
                        hovertext: time
                    }
                }))
            })
            Object.entries(data[key][i].History.salvos).forEach(([ship, data]) => { 
                // @ts-ignore
                annotations.push(...Object.entries(data).map(([time, hidden]) => {
                    return {
                        x: Number(time),
                        y: total_max,
                        xref: "x",
                        yref: "y",
                        text: `${ship} salvo`,
                        showarrow: false,
                        yshift: 0,
                        hovertext: time
                    }
                }))
            })
            Object.entries(data[key][i].History.torps).forEach(([ship, data]) => { 
                // @ts-ignore
                annotations.push(...Object.entries(data).map(([time, hidden]) => {
                    return {
                        x: Number(time),
                        y: total_max,
                        xref: "x",
                        yref: "y",
                        text: `${ship} torp`,
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
                if ((an.x as number) - lastX > 7) {
                    count = 0;
                }
                an.yshift = -15 * count;
                count += 1;
                lastX = an.x as number;
            })
            return Plotly.newPlot(document.createElement("div"), res, {
                title: {
                    text: `attempt ${i + 1}`
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
                width: 1800,
                height: 600,
                annotations: annotations
            })
        })))
        resolve(div);
    })
    
}
function TotalDmg(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>) {
    let D: Plotly.Data[] = Object.values(ship_data).map(data => {
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
    })
}

function StandTotalDmg(data: Record<string, Results[]>, key: string, ship_data: Record<string, ShipData>) {
    const att = Object.values(ship_data)[0].data.length
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
        y: data[key].map(res => res.Remaining_HP / 100),
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
    })
}

export const IndividualGraphTypes = {
    Timelines: ["Timlines", Timelines],
    AvgTimeline: ["Average Timeline", AvgTimeline],
    SurfaceDmgDist: ["Surface Damage Distribution", SurfaceDmg],
    DoTDmgDist: ["DoT Damage Distribution", DotDmg],
    PureDmgDist: ["Pure Damage Distribution", PurDmg],
    AADmgDist: ["AA Damage Distribution", AADmg],
    LengthOfBattle: ["Length of Battle", AttemptLength],
    RemainingHP: ["Remaining HP% of Ships", HPRemaining],
    StandardizedDmg: ["Standardized Total Damage", StandTotalDmg],
    TotalDmg: ["Total Dmg", TotalDmg]
}

function GroupDmgDist(configs: Config[], data: Record<string, Results[]>) {
    const D: Plotly.Data[] = configs.map((config) => {
        return {
            y: data[config.outputName].map((res) => {
                let sum = 0;
                Object.values(res.Statistics).forEach((stats) => {
                    sum += stats.DMG + stats.DoT
                })
                return sum
            }),
            name: config.outputName,
            boxpoints: "outliers",
            type: "box"
        }
    })
    return Plotly.newPlot(document.createElement("div"), D, {
        title: {
            text: "Comp dmg distr"
        },
        yaxis: {fixedrange: true},
        xaxis: {fixedrange: true}
    })
}

function GroupStdDevDistr(configs: Config[], data: Record<string, Results[]>) {
    function getStandardDeviation(array: number[]) {
        const n = array.length
        const mean = array.reduce((a, b) => a + b) / n
        return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
    }
    const D: number[] = configs.map((config) => {
        return getStandardDeviation(data[config.outputName].map((res) => {
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
        xaxis: {fixedrange: true}
    });
}
function GroupKillPerc(configs: Config[], data: Record<string, Results[]>) {
    const D: number[] = configs.map((config) => {
        return (data[config.outputName].filter((res) => res.Remaining_HP == 0).length / data[config.outputName].length) * 100;
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
        xaxis: {fixedrange: true}
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
    let c_formation;
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