<script lang="ts">
import type { ViewConfig } from "$lib";
import { ELEMENTS_PER_ROW, process_fleet, ImageLoader } from "$lib";
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
        let v = b.createdAt.localeCompare(a.createdAt)
        if (v == 0) {
            v = a.outputName.localeCompare(b.outputName);
        };
        return v;
    });
});
function Chunk(arr: ViewConfig[]): ViewConfig[][] {
    const result = [];
    for (let i=0; i<arr.length; i+=ELEMENTS_PER_ROW) {
        result.push(arr.slice(i, i + ELEMENTS_PER_ROW));
    }
    return result;
}
</script>
<h1>{configs.length} pending configs</h1>
<table style="width: 100%;">
    <tbody>
        {#each Chunk(configs) as row}
            <tr>
                {#each row as conf}
                    <td style="vertical-align: top; border: 1px solid black;">
                        <Accordian style='width: 100%;'>
                            <div slot="head" style="">
                                <p>{conf.outputName}</p>
                            </div>
                            <div slot="details" style="width: 994px; overflow-x: scroll; text-align: left;">
                                <pre>{JSON.stringify(conf, ["outputName", "attempts", "author", "description", "fleetBuilderLink", "enemyId", "dungeonId", "ft", "createdAt", "enemyModifications", "dungeonModifications"], 2)}</pre>
                                <div bind:this={conf.images[0]}></div>
                                {#if !conf.images[1]}
                                    <button on:click={async function() {
                                        if (imageLoader.rarity.length == 0) {
                                            await imageLoader.init();
                                        }
                                        conf.images[0]?.replaceChildren(await process_fleet(conf, imageLoader))
                                        conf.images[1] = true;
                                    }}>Generate fleet image</button>
                                {/if}
                            </div>
                        </Accordian>
                    </td>
                {/each}
                {#each Array(ELEMENTS_PER_ROW - row.length) as _}
                    <td></td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>