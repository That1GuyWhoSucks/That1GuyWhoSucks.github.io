<script lang="ts">
import { goto } from "$app/navigation";
function ViewData() {
    goto("#/view");
}
function CreateConfig() {
    goto("#/create");
}
let backlog = Object.keys(import.meta.glob("../pending/*.json")).length;
</script>
<div class="home">

    <header class="hero">
        <h1>The AutoTester™</h1>

        <div class="versions">
            <p>Autotester™ version: <strong>1.7.0</strong> (06/01/26)</p>
            <p>Data viewer version: <strong>3.0.0</strong> (22/12/25)</p>
            <p><strong>{backlog}</strong> pending configs</p>
        </div>

        <div class="actions">
            <button onclick="{CreateConfig}">Create config</button>
            <button onclick="{ViewData}">View data</button>
        </div>
    </header>

    <section>
        <h2>What is The AutoTester™?</h2>

        <p>
            The AutoTester™ is a program that extremely accurately replicates the AL battlespace
            and collects extensive amounts combat data.
        </p>

        <p>
            It is configured using specially formatted JSON files (called "configs")
            which control how each test is run.
        </p>

        <p>
            This allows anyone to test unusual or expensive setups without investing resources
            on their own account.
        </p>

        <p>
            Unlike endscreen comparisons, the AutoTester™ separates DoT, AA, and surface damage,
            tracks health, etc.
        </p>

        <p>
            All collected data is stored on this site and can be explored through dynamically
            generated graphs.
        </p>
    </section>

    <section>
        <h2>FAQ</h2>

        <div class="faq">
            <div>
                <h3>How do I use this?</h3>
                <p>
                    Create a config using the "Create config" button above, fill out the form,
                    generate the configuration file, and submit it.
                </p>
                <p>
                    I will run the AutoTester™ using your config and publish the results.
                    You can contact me on Discord for updates.
                </p>
                <p>
                    Once ready, go to "View data", choose graphs, select your config(s), 
                    and generate the results.
                </p>
            </div>
            <div>
                <h3>How do I contact you?</h3>
                <p>Message me on Discord: <strong>that1nerd</strong></p>
            </div>
            <div>
                <h3>Is it accurate?</h3>
                <p>Yes absolutely. Accuracy is very important to me.</p>
                <p>It has been rigourously tested and vetted against real game data to ensure the results are indistinguishable.</p>
                <p>If you find results that seem contradictory then please contact me as soon as possible.</p>
            </div>
            <div>
                <h3>Can I share this?</h3>
                <p>Yes absolutely. Feel free to share all of this, when you view data it will generate a code that can also be shared (the full link also works).</p>
            </div>
            <div>
                <h3>Why would I use this?</h3>
                <ul>
                    <li>Testing setups that are too expensive in-game</li>
                    <li>Convenient, statistically significant testing</li>
                    <li>Custom enemy and dungeon modifications</li>
                    <li>Data that cannot be extracted from normal runs (e.g. DoT)</li>
                </ul>
            </div>
        </div>
    </section>
</div>
<style>
.home {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.hero {
    text-align: center;
    margin-bottom: 3rem;
}

.hero h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.versions p {
    margin: 0.25rem 0;
    color: #555;
}

.actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

section {
    margin-bottom: 3rem;
}

section h2 {
    margin-bottom: 1rem;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.25rem;
}

section p {
    line-height: 1.6;
}

.faq {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

</style>