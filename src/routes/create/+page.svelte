<script lang="ts">
    import { goto } from "$app/navigation";

const ENEMIES = {
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
};
const ENEMY_MODIFIERS = {
    "HP": "durability",
    "AA": "antiaircraft",
    "EVA": "dodge",
    "LUCK": "luck",
    "SPEED": "speed",
    "RLD": "reload",
    "FP": "cannon",
    "AVI": "air",
    "TRP": "torpedo",
    "HIT": "hit"
};
const FT_SHIPS = [
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
]
const FT_TECH = [
    "Health",
    "Firepower",
    "Torpedo",
    "AA",
    "Aviation",
    "Reload",
    "Accuracy",
    "Evasion",
    "ASW",
]

let outputName: string = "";
let renhexLink: string = "";
let attemptCount: number = 10;
let enemy: number = 295015;
let EnemyStats = {
    "durability": -1,
    "antiaircraft": -1,
    "dodge": -1,
    "luck": -1,
    "speed": -1,
    "reload": -1,
    "cannon": -1,
    "air": -1,
    "torpedo": -1,
    "hit": -1,
};
let armor = 0;
let dungeonId = 296015;
let battleLength = 0;
let FT: object = {};
function GenerateConfig() {
    let error = "";
    let statsCopy: {[key: string]: number} = {}
    Object.entries(EnemyStats).forEach(([key, value]) => {
        if (value >= 0 && value != null) {
            statsCopy[key] = value;
        } else if (value == null) {
            error = `${key} is invalid. Fix it.`;
        }
    })
    if (armor > 0) {
        statsCopy["armor"] = armor;
    }
    let FTCopy: {[key: string]: {[key: string]: number}} = {}
    Object.entries(FT).forEach(([key, value]) => {
        if ((value as number) >= 0 && value != null) {
            let keySplit: string[] = key.split("-");
            if (!(keySplit[0] in FTCopy)) {
                FTCopy[keySplit[0]] = {};
            }
            FTCopy[keySplit[0]][keySplit[1]] = value;
        } else if (value == null) {
            error = `${key} is invalid. Fix it.`;
        }
    })
    let dungeonModifications: {[key: string]: number} = {}
    if (battleLength > 0 && battleLength != null) {
        dungeonModifications["'stages'/1/'timeCount'"] = battleLength
    } else if (battleLength == null) {
        error = "battleLength is invalid. Fix it.";
    }

    let config = {
        ft: FTCopy,
        outputName: outputName,
        fleetBuilderLink: renhexLink,
        attempts: attemptCount,
        enemyId: enemy,
        enemyModifications: statsCopy,
        dungeonId: dungeonId,
        dungeonModifications: dungeonModifications
    };

    if (error != "") {
        alert(error);
    } else if (config.outputName.length < 5) {
        alert("Output name is too short, make it longer.");
    } else if (config.fleetBuilderLink.length < 46) {
        alert("Enter the ENTIRE renhex link (`https://renhex.github.io/AzurLaneFleet/?AFLD=` included!)");
    } else {
        console.log(config);
        var element: HTMLElement = document.getElementById('download') as HTMLElement;
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2)));
        element.setAttribute('download', `config-${config.outputName}.json`);
        element.innerText = `Download config-${config.outputName}.json`;
        (document.getElementById("code") as HTMLElement).innerText = JSON.stringify(config, null, 2);
    }
};
</script>
<div style="text-align: center;">
    <p>Complete the form below, download the configuration file generated, then send it to @that1nerd on discord to have it run</p>
    <p>If you have any questions or want something more specific than can be generated here feel free to contact me @that1nerd on discord. If you want to try something there is a very good chance I can make it happen (with enough time).</p>
    <form>
        <div style="border: 1px solid black;">
            <p>Output Name*<input type="text" required bind:value="{outputName}"></p>
            <p>The name the simulator uses to store data related to the comp. It is reccomended to make this unqiue as it WILL overrite data if it detects the same name twice.</p>
        </div>
        <div style="border: 1px solid black;">
            <p>Renhex Link*<input type="url" required bind:value="{renhexLink}"></p>
            <p>Include the entire URL from the "generate URL" button. Only 1 fleet per link. It will copy gear, affinity, and level. Do not shorten the URL.</p>
        </div>
        <div style="border: 1px solid black;">
            <input type="range" min="1" max="20" bind:value="{attemptCount}">
            <p>{attemptCount} attempts</p>
        </div>
        <div style="border: 1px solid black;">
            {#each (Object.entries(ENEMIES)) as name}
                <p><input type="radio" name="enemyId" value="{name[1][0]}" bind:group="{enemy}">{name[0]}</p>
            {/each}
            <p>Select an enemy ID, this will be the enemy spawned that will be attacked and the base stats used.</p>
        </div>
        <div style="border: 1px solid black;">
            {#each (Object.entries(ENEMY_MODIFIERS)) as modifiers}
                <p>{modifiers[0]}: <input type="number" bind:value={EnemyStats[modifiers[1] as keyof typeof EnemyStats]} defaultValue="-1"></p>
            {/each}
            {#each ["Default", "Light", "Medium", "Heavy"] as arm, index}
                <p><input type="radio" name="armorSelection" value="{index}" bind:group="{armor}">{arm}</p>
            {/each}
            <p>Enemy stat modifications, values &lt; 0 will use default.</p>
        </div>
        <div style="border: 1px solid black;">
            {#each Object.entries(ENEMIES) as name}
                <p><input type="radio" name="dungeonId" value="{name[1][1]}" bind:group="{dungeonId}">{name[0]}</p>
            {/each}
            <p>Select a dungeon ID, this will dictate things like movement patterns, attack patterns, and length of fight.</p>
        </div>
        <div style="border: 1px solid black;">
            <p>Length of fight <input type="number" bind:value={battleLength}> (value &le; 0 will use default length)</p>
        </div>
        <div style="border: 1px solid black; justify-content: center; display: grid;">
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        {#each FT_SHIPS as ship}
                            <th>{ship}</th>
                        {/each}
                    </tr>
                    {#each FT_TECH as tech}
                        <tr>
                            <th>{tech}</th>
                            {#each FT_SHIPS as ship}
                                <th><input type="number" bind:value={FT[`${ship}-${tech}` as keyof typeof FT]} defaultValue="-1"></th>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
            <p>Fleet tech modifications (Values &lt; 0 will use max values at time of running)</p>
        </div>
        <br>
        <br>
    </form>
    <button on:click={GenerateConfig}>Generate configuration file</button>
    <br>
    <a id="download"></a>
    <pre id="code" style="text-align: left; width: 200px; margin: auto;"></pre>
</div>
<style>
tr {
    input {
        width: 60px;
    }
}
table {
    overflow: hidden;
}

tr:hover {
    background-color: red;
}

th {
    position: relative;
}
th:hover::after {
    content: "";
    position: absolute;
    background-color: red;
    left: 0;
    top: -5000px;
    height: 10000px;
    width: 100%;
    z-index: -1;
}
</style>