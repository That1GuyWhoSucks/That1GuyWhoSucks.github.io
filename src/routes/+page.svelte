<script lang="ts">
import { goto } from "$app/navigation";
import Accordian from "../Accordian.svelte";
function ViewData() {
    goto("#/view");
}
function CreateConfig() {
    goto("#/create");
}
let backlog = Object.keys(import.meta.glob("../pending/*.json")).length;
</script>
<div style="margin: auto; text-align: center;">
    <h1>The AutoTester&#8482;</h1>
    <h3>Autotester&#8482; version: 1.4.0 (last updated 22/12/25)</h3>
    <h3>Data viewer version: 3.0.0 (last updated 22/12/25)</h3>
    <h3>Current backlog is {backlog} items long</h3>
    <br>
    <button onclick="{CreateConfig}">Create config for testing</button>
    <button onclick="{ViewData}">View data</button>
    <br>
    <h3>What's The AutoTester&#8482;?</h3>
    <p>The Autotester&#8482; is a program that extremely accurately replicates the AL battlespace and collects loads of very detailed data.</p>
    <p>I have it set up in such a way that specifically formatted JSON files (I refer to as "configs") can configure how the tester runs.</p>
    <p>This means that anyone can try out wierd or very expensive setups without needing to invest on their actual account.</p>
    <p>Because of how it collects data it is far more accurate than judging by end screens. It seperates DoT, AA, and surface damage, records health, etc.</p>
    <p>This data is then stored on this site and can be viewed in a variety of graphs that are generated as requested by you.</p>
    <br>
    <h3>FAQ</h3>
    <div style="justify-content: center; align-items: center;">
        <Accordian>
            <div slot="head">
                <p>How do I contact you?</p>
            </div>
            <div slot="details">
                <p>Feel free to message me at "that1nerd" on discord.</p>
            </div>
        </Accordian>
        <Accordian>
            <div slot="head">
                <p>Is it accurate?</p>
            </div>
            <div slot="details">
                <p>Yes absolutely. The accuracy of my data is very important to me.</p>
                <p>It has been rigourously tested and vetted against real game data to ensure the results are indistinguishable.</p>
                <p>If you find results that seem contradictory then please contact me as soon as possible.</p>
            </div>
        </Accordian>
        <Accordian>
            <div slot="head">
                <p>How do I use this?</p>
            </div>
            <div slot="details">
                <p>First you need to create a config file. Press the "Create config" button above, fill out the form and then generate the file. Then just copy it and send it through the google form.</p>
                <p>I will run The AutoTester&#8482; with your config and let you know when this site is update with your results.</p>
                <p>Then simply navigate to the "View data" page, select your config (and any other configs you want to compare to), select what graphs to generate and hit generate.</p>
                <p>It will redirect you to the code viewer page, give it some time to generate the graphs then look at your data. If you want to share simply give them the code or the URL, either works.</p>
            </div>
        </Accordian>
        <Accordian>
            <div slot="head">
                <p>Can I share this?</p>
            </div>
            <div slot="details">
                <p>Yes absolutely. Feel free to share all of this, when you view data it will generate a code that can also be shared (the full link also works).</p>
            </div>
        </Accordian>
        <Accordian>
            <div slot="head">
                <p>Why would I use this?</p>
            </div>
            <div slot="details">
                <p>1: The setup you want to test is too expensive for your account.</p>
                <p>2: Testing against bosses you have limited access to (like past METAs).</p>
                <p>3: Convience, this tool allows you to get statistically significant amoutns of data without all the hastle.</p>
                <p>4: The Autotester&#8482; allows you to modify enemies and dungeons as your heart desires to get clearer data.</p>
                <p>5: Because the code is all run under my control I can collect data that is impossible to detangle under normal runs (like DoT).</p>
            </div>
        </Accordian>
        <Accordian>
            <div slot="head">
                <p>How does it work?</p>
            </div>
            <div slot="details">
                <p>It effectively is all of the battle code but translated into another language and then run.</p>
            </div>
        </Accordian>
        <Accordian>
            <div slot="head">
                <p>Can you share the source code?</p>
            </div>
            <div slot="details">
                <p>No sadly not. The code contains sensitive data that cannot be removed. Not to mention actually getting it to run is a nightmare.</p>
                <p>I am doing the best I can to make it as accesible to anyone who wants to do testing.</p>
            </div>
        </Accordian>
    </div>
    
    
</div>