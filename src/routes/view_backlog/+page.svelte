<script lang="ts">
import type { ViewConfig } from "$lib";
import { process_fleets, ImageLoader } from "$lib";
import Accordian from '../../Accordian.svelte';

let configs: ViewConfig[] = [];
let imageLoader: ImageLoader = new ImageLoader();

Promise.all(
  Object.entries(import.meta.glob("../../pending/*.json")).map(async ([path, loader]) => {
    const mod = await loader();
    // @ts-ignore
    const data = mod.default ?? mod;
    // @ts-ignore
    const id = path.split("/").pop().replace(/\.json$/, "");
    return { ...data, "images": [null, false] };
  })
).then((confs: ViewConfig[]) => {
    configs = confs.sort((a, b) => {
        let v = a.createdAt.localeCompare(b.createdAt)
        if (v == 0) {
            v = a.outputName.localeCompare(b.outputName);
        };
        return v;
    });
});
</script>
<h1>{configs.length} pending configs</h1>
<div class="config-list">
    {#each configs as conf}
        <div class="config-card">
            <div >
            </div>
            <Accordian>
                <div slot="head">
                    <div class="config-head">
                        <span class="config-title">{conf.outputName}</span>
                        <span class="config-meta">
                            {conf.author} | {conf.createdAt}
                        </span>
                    </div>
                </div>

                <div slot="details">
                    <div class="config-details">

                        <pre style="overflow: auto;">{JSON.stringify(Object.fromEntries(Object.entries(conf).filter(([k, v]) => {
                            return ["id", "images", "active"].indexOf(k) == -1;
                        })), null, 2)}</pre>

                        <div class="config-image-area">
                            <div class="image-frame" bind:this={conf.images[0]}>
                                <div class="image-placeholder">
                                    Fleet image not generated
                                </div>
                            </div>

                            {#if !conf.images[1]}
                                <button
                                    class="generate-image"
                                    on:click={async () => {
                                        if (imageLoader.rarity.length === 0) {
                                            await imageLoader.init();
                                        }
                                        conf.images[0]?.replaceChildren(
                                            await process_fleets(conf, imageLoader)
                                        );
                                        conf.images[1] = true;
                                    }}>
                                    Generate fleet image
                                </button>
                            {/if}
                        </div>

                    </div>
                </div>
            </Accordian>

        </div>
    {/each}
</div>
<style>
.config-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

/* Card shell */
.config-card {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    background: #fafafa;
    border: 1px solid #ccc;
    border-radius: 6px;
    overflow: hidden;
}
.config-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}
.config-title {
    font-weight: 600;
}

.config-meta {
    font-size: 0.85rem;
    color: #666;
    white-space: nowrap;
}

.config-details {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1rem 0.25rem;
}


/* Image section */
.config-image-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

/* Ensures exact 994x333 display */
.image-frame {
    width: 994px;
    min-height: 333px;
    background: #222;
    border: 1px solid #444;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.image-placeholder {
    color: #888;
    font-size: 0.9rem;
}

.generate-image {
    padding: 0.4rem 0.8rem;
}

section {
    max-width: 750px;
    margin: 1.5rem auto;
    padding: 0 1rem;
}
.panel {
    flex: 1;
    min-width: 300px;
    border: 1px solid #ccc;
    padding: 1rem;
}
</style>