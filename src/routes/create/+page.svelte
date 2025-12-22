<script lang="ts">
import Accordian from '../../Accordian.svelte';
import { ENEMIES, ENEMY_MODIFIERS, FT_TECH, FT_SHIPS, FT_SHIP_GROUP_TO_INDEX, type CreatedConfig } from '$lib/index';
function redirect() {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSc81Mzv69MWE2iCAIxDZf4Oxz3WVjnmoDK_IokUJaAmn3I2zw/viewform?usp=dialog");
}
let outputName: string = "";
let renhexLink: string = "";
let authorName: string = "";
let description: string = "";
let attemptCount: number = 10;
let forceCloakState: string = "-1";
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
    outputName.trim();
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
        statsCopy["armor_type"] = armor;
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

    if (forceCloakState == "0" || forceCloakState == "1") {
        dungeonModifications["'stages'/1/'stageCloaktype'"] = parseInt(forceCloakState);
    }

    let config: CreatedConfig = {
        ft: FTCopy,
        outputName: outputName,
        fleetBuilderLink: renhexLink,
        attempts: attemptCount,
        enemyId: enemy,
        enemyModifications: statsCopy,
        dungeonId: dungeonId,
        dungeonModifications: dungeonModifications,
        author: authorName,
        description: description,
        createdAt: new Date().toISOString().slice(0, 19) + "Z"
    };

    if (error != "") {
        alert(error);
    } else if (config.outputName.length < 5) {
        alert("Output name is too short, make it longer.");
    } else if (config.fleetBuilderLink.length < 46) {
        alert("Enter the ENTIRE renhex link (`https://renhex.github.io/AzurLaneFleet/?AFLD=` included!)");
    } else {
        var element: HTMLElement = document.getElementById('download') as HTMLElement;
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2)));
        element.setAttribute('download', `config-${config.outputName}.json`);
        element.innerText = `Download config-${config.outputName}.json`;
        (document.getElementById("code") as HTMLElement).innerText = JSON.stringify(config, null, 2);
        element = document.getElementById("clipboard-button") as HTMLElement;
        element.onclick = () => {
            navigator.clipboard.writeText(JSON.stringify(config, null, 2));
            alert("Copied to clipboard succsefully.")
        }
        element.style = "font-size: 42px;"

    }
};
</script>
<div style="text-align: center;">
    <p>Complete the form below, copy the file generated, then send it through the google form. Or you may send it to me through discord @that1nerd</p>
    <p>If you have any questions or want something more specific than can be generated here feel free to contact me @that1nerd on discord. If you want to try something there is a very good chance I can make it happen (with enough time).</p>
    <form>
        <h2>General information</h2>
        <div style="border: 1px solid black;">
            <p>Output Name*<input type="text" required bind:value="{outputName}"></p>
            <p>The name the simulator uses to store data related to the comp.</p>
        </div>
        <div style="border: 1px solid black;">
            <p>Author Name<input type="text" bind:value="{authorName}"></p>
            <p>Your name/tag. Not required but may be useful if someone else wants to inquire about your data.</p>
        </div>
        <div style="border: 1px solid black;">
            <p>Description  <textarea style="width: 250px; height: 100px;" bind:value="{description}"></textarea></p>
            <p>A short description of what this is meant to test, not required.</p>
        </div>
        <h2>General test attributes</h2>
        <div style="border: 1px solid black;">
            <p>Renhex Link*<input type="url" required bind:value="{renhexLink}"></p>
            <p>Include the entire URL from the "generate URL" button. It will copy gear, affinity, and level. Do not shorten the URL through any means (including the "short URL" option).</p>
        </div>
        <div style="border: 1px solid black;">
            <input type="range" min="1" max="20" bind:value="{attemptCount}">
            <p>The number of trials per fleet, more will mean more datapoints but longer to run.</p>
            <p>{attemptCount} attempts.</p>
        </div>
        <div style="border: 1px solid black; display: inline-flex;">
            <div style="width: fit-content; margin: 0 10px 0 10px;">
                <h3>Enemy ID</h3>
                {#each (Object.entries(ENEMIES)) as name}
                    <p><input type="radio" name="enemyId" value="{name[1][0]}" bind:group="{enemy}">{name[0]}</p>
                {/each}
                <p>Select an enemy ID, this will be the enemy spawned that will be attacked and the base stats used.</p>
            </div>
            <div style="width: fit-content; margin: 0 10px 0 10px;">
                <h3>Dungeon ID</h3>
                {#each Object.entries(ENEMIES) as name}
                    <p><input type="radio" name="dungeonId" value="{name[1][1]}" bind:group="{dungeonId}">{name[0]}</p>
                {/each}
                <p>Select a dungeon ID, this will dictate things like movement patterns, attack patterns, and length of fight.</p>
            </div>
        </div>
        <h2>Modifications</h2>
        <div style="border: 1px solid black;">
            {#each (Object.entries(ENEMY_MODIFIERS)) as modifiers}
                <p>{modifiers[0]}: <input type="number" bind:value={EnemyStats[modifiers[1] as keyof typeof EnemyStats]} defaultValue="-1"></p>
            {/each}
            {#each ["Default", "Light", "Medium", "Heavy"] as arm, index}
                <p><input type="radio" name="armorSelection" value="{index}" bind:group="{armor}">{arm}</p>
            {/each}
            <p>Enemy stat modifications, values &lt; 0 will use default.</p>
            <Accordian>
                <div slot="head">Click here to see the hull type numbers</div>
                <div slot="details">
                    <table style="margin: auto;">
                        <thead>
                            <tr>
                                <th>Hull Type</th>
                                <th>Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each Object.entries(FT_SHIP_GROUP_TO_INDEX) as [name, value]}
                                <tr>
                                    <td>{name}</td>
                                    <td>{value}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </Accordian>
        </div>
        <div style="border: 1px solid black;">
            
        </div>
        <div style="border: 1px solid black;">
            <p>Length of fight <input type="number" bind:value={battleLength}> (value &le; 0 will use default length)</p>
            <p>Force cloak state</p>
            <div>
                <input type="radio" name="cloakState" value="-1" bind:group="{forceCloakState}"> Default
                <input type="radio" name="cloakState" value="0" bind:group="{forceCloakState}"> Never Cloaked
                <input type="radio" name="cloakState" value="1" bind:group="{forceCloakState}"> Always Cloaked
            </div>
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
            <p>Fleet tech values (Values &lt; 0 will use max values at time of running)</p>
        </div>
        <br>
        <br>
    </form>
    <button on:click={GenerateConfig} style="font-size: 69px;">Generate configuration file</button>
    <br>
    <button id="clipboard-button" style="display: none;"> Copy Config to Clipboard </button>
    <br>
    <button id="form-button" style="font-size: 42px;" on:click={redirect}> &gt; Go to form to submit config &lt; </button>
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