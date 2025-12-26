<script lang="ts">
import Accordian from '../../Accordian.svelte';
import { ENEMIES, ENEMY_MODIFIERS, FT_TECH, FT_SHIPS, FT_SHIP_GROUP_TO_INDEX, patchLink, type CreatedConfig } from '$lib/index';
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
    "type": -1,
};
let armor = 0;
let dungeonId = 296015;
let battleLength = 0;
let FT: object = {};
//202150, 317020
let shipReplacements: [number, number][] = [];
let gearReplacements: [number, number][] = [];
let spReplacements: [number, number][] = [];

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

    renhexLink = patchLink(Object.fromEntries(shipReplacements), Object.fromEntries(gearReplacements), Object.fromEntries(spReplacements), renhexLink);

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
        createdAt: new Date().toISOString().slice(0, 19) + "Z",
    };

    if (error != "") {
        alert(error);
    } else if (config.outputName.length < 5) {
        alert("Output name is too short, make it longer.");
    } else if (config.fleetBuilderLink.length < 46) {
        alert("Enter the ENTIRE renhex link (`https://renhex.github.io/AzurLaneFleet/?AFLD=` included!)");
    } else {
        (document.getElementById("code") as HTMLElement).innerText = JSON.stringify(config, null, 2);
        window.open(`https://docs.google.com/forms/d/e/1FAIpQLSc81Mzv69MWE2iCAIxDZf4Oxz3WVjnmoDK_IokUJaAmn3I2zw/viewform?usp=pp_url&entry.123100218=${JSON.stringify(config)}`)
    }
};
</script>
<div class="page">
    <header class="page-header">
        <h1>Config Creator</h1>
        <h3 class="subtitle">
            Fill this form out and press submit. It's that easy.
        </h3>
    </header>
    <h2>Required Information</h2>
    <fieldset>
        <legend>Basic Information</legend>

        <label>
            Output Name *
            <input type="text" required bind:value="{outputName}">
            <small>The name the simulator uses to store data.</small>
        </label>
        <br>
        <label>
            Renhex Link *
            <input type="url" required bind:value="{renhexLink}" style="margin-left: 4px;">
            <p>This is the fleet that will be run, the AutoTester™ will copy it <strong><u>exactly</u></strong> as shown in the renhex link. Including affinity, oaths, levels, gear enhancements, augments etc.</p>
            <p>You may have multiple fleets in the link and each will be run and seperated in the output. Submarine fleets are supported but you have to contact me to set it up.</p>
            <small>
                Paste the full URL from “Generate URL”. Do not shorten it.
                <a target="_blank" rel="noopener noreferrer" href="https://renhex.github.io/AzurLaneFleet/">https://renhex.github.io/AzurLaneFleet/</a>
            </small>
        </label>
    </fieldset>
    <fieldset>
        <legend>Test Setup</legend>

        <label>
            Attempt Count: <strong class="attempt-value">{attemptCount}</strong>
            <input style="margin-bottom: -5px;" type="range" min="1" max="20" bind:value="{attemptCount}">
            <small>
                More attempts = better data, longer runtime.
            </small>
        </label>
        <div class="two-col">
        <div class="picker">
            <h3>Enemy</h3>
            {#each Object.entries(ENEMIES) as name}
                <label class="radio-row">
                    {name[0]}
                    <input type="radio" name="enemyId" value="{name[1][0]}" bind:group="{enemy}">
                </label>
            {/each}
        </div>
        <div class="picker">
            <h3>Dungeon</h3>
            {#each Object.entries(ENEMIES) as name}
                <label class="radio-row">
                    {name[0]}
                    <input type="radio" name="dungeonId" value="{name[1][1]}" bind:group="{dungeonId}">
                </label>
            {/each}
        </div>
    </div>
    </fieldset>
    
    <Accordian>
        <div slot="head">
            <h2>Additional information</h2>
        </div>
        <div slot="details">
            <p>Author Name  <input type="text" bind:value="{authorName}"></p>
            <p>Your name/tag. Not required but may be useful if someone else wants to inquire about your data.</p>
            <p>Description  <textarea style="margin-left: 12px;" bind:value="{description}"></textarea></p>
            <p>A short description of what this is meant to test, not required.</p>
        </div>
    </Accordian>
    <Accordian>
        <div slot="head">
            <h2>Modifications</h2>
        </div>
        <div slot="details">
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
            <div class="grid">
                {#each Object.entries(ENEMY_MODIFIERS) as modifiers}
                    <label>
                        {modifiers[0]}
                        <input type="number" bind:value={EnemyStats[modifiers[1] as keyof typeof EnemyStats]}>
                    </label>
                {/each}
            </div>
            <p>Armor override.</p>
            {#each ["Default", "Light", "Medium", "Heavy"] as arm, index}
                <label class="radio-row">{arm}<input type="radio" name="armorSelection" value="{index}" bind:group="{armor}"></label>
            {/each}
            <p>Length of fight <input type="number" bind:value={battleLength}> (value &le; 0 will use default length)</p>
            <p>Force cloak state</p>
            <div>
                <label class="radio-row">Default<input type="radio" name="cloakState" value="-1" bind:group="{forceCloakState}"></label>
                <label class="radio-row">Never Cloaked<input type="radio" name="cloakState" value="0" bind:group="{forceCloakState}"></label>
                <label class="radio-row">Always Cloaked<input type="radio" name="cloakState" value="1" bind:group="{forceCloakState}"></label>
            </div>
            <div style="justify-content: center; display: grid;">
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
            <div>
                <p>Replace ships <strong>(use skin ID)</strong> <button onclick={() => {
                    console.log(shipReplacements);
                    shipReplacements.push([-1, -1]);
                    shipReplacements = shipReplacements
                }}>new row</button></p>
                {#each shipReplacements as val}
                    <div>
                        <input class="noPanel" type="number" bind:value={val[0]}/> <input class="noPanel" type="number" bind:value={val[1]}/>
                    </div>
                {/each}
                <p>Replace gears <button onclick={() => {
                    gearReplacements.push([-1, -1]);
                    gearReplacements = gearReplacements;
                }}>new row</button></p>
                {#each gearReplacements as val}
                    <div>
                        <input class="noPanel" type="number" bind:value={val[0]}/> <input class="noPanel" type="number" bind:value={val[1]}/>
                    </div>
                {/each}
                <p>Replace Augments <button onclick={() => {
                    console.log(spReplacements);
                    spReplacements.push([-1, -1]);
                    spReplacements = spReplacements
                }}>new row</button></p>
                {#each spReplacements as val}
                    <div>
                        <input class="noPanel" type="number" bind:value={val[0]}/> <input class="noPanel" type="number" bind:value={val[1]}/>
                    </div>
                {/each}
            </div>
        </div>
    </Accordian>
    <button class="generate" onclick={GenerateConfig}>
        Generate Configuration File
    </button>
    <pre id="code" style="text-align: left; width: 200px; margin: auto;"></pre>
</div>
<style>
tr {
    input {
        width: 40px;
    }
}
table {
    overflow: hidden;
    input[type=number] {
        -webkit-appearance: textfield;
        -moz-appearance:    textfield;
        appearance:         textfield;
    }
}
.noPanel {
    -webkit-appearance: textfield;
    -moz-appearance:    textfield;
    appearance:         textfield;
    width: 30ch;
}
tr:hover {
    background-color: #afafaf;
}
th {
    position: relative;
}
th:hover::after {
    content: "";
    position: absolute;
    background-color: #afafaf;
    left: 0;
    top: -5000px;
    height: 10000px;
    width: 100%;
    z-index: -1;
    pointer-events: none;
}
.page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
}
.page-header {
    text-align: center;
    margin-bottom: 2rem;
}
.subtitle {
    opacity: 0.8;
}
fieldset {
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1.5rem;
}
legend {
    font-weight: bold;
    padding: 0 0.5rem;
}
label {
    display: block;
    margin-bottom: 0.5rem;
    small {
        display: block;
        margin-top: 0.25rem;
        opacity: 0.8;
    }
}
input, textarea {
    width: 100%;
    max-width: 500px;
}
.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}
.picker {
    border: 1px solid #ccc;
    padding: 0.75rem;
}
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
}
button.generate {
    font-size: 1.5rem;
    padding: 1rem 2rem;
    margin: 2rem auto;
    display: block;
}
.attempt-value {
    display: inline-block;
    width: 2ch;
    text-align: right;
    font-family: monospace;
}
.radio-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.radio-row input {
    width: auto;
}
.radio-row input[type="radio"] {
    width: auto;
    max-width: none;
    margin-left: auto;
    margin-right: 35%;
}


</style>