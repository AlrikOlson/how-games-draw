# Handoff: interactive rendering-concepts library

Paste this whole file into a fresh Claude Code session opened in the `render-lib/` folder.

---

## Status as of 2026-09-13

All 22 pages and the hub are built and verified (errors [], no horizontal overflow at 1100 and 400 px).

Later the same day, every page's prose was rewritten in plain, progressive, scannable language per
`shared/REWRITE.md` (plain intro, "What you're seeing", "Try this", "The real version", one-line
"Remember" per section, a "Words on this page" box in the header). Demos, ids, JavaScript, math,
code and citations were left untouched. `shared/theme.css` gained the classes for that structure.
The hub is now generated: edit `shared/index.template.html` and run `node shared/build-index.js`,
which inlines the theme and fills each entry's demo list from the page's section headings.

Then the layout was redesigned for wide screens: `shared/theme.css` now has a 1640 px wrap, a
two-column header (title block plus the words box), numbered demo sections, a sticky canvas
column on screens over 1100 px, an "On this page" jump list, and roomier type and spacing.
Because every page carries a pasted copy of the theme, change `shared/theme.css` and then run
`node shared/apply-theme.js`, which swaps the theme block in every page (keeping page CSS) and
rebuilds the jump list. `node shared/peek.js pages/x.html out.png 1600 "section:nth-of-type(2)"`
screenshots one element at full size; with selector `overflow` it lists elements wider than the
viewport. `.bak/` holds the pages as they were before the theme re-injection; delete it once
the new layout is accepted.
The nine pages below were built on Windows at D:/Code/render-lib; shared/shot.js now points at the
Playwright Chromium under %LOCALAPPDATA%/ms-playwright and BRIEF.md paths were updated to match.
Their agents' uncertain claims are appended to UNCERTAIN.md. Only publishing remains (see the end
of this file). The rest of this document is the original build brief, kept for reference.

```
pages/culling.html                    Frustum & Occlusion Culling
pages/lod-and-clusters.html           LOD & Cluster Hierarchies
pages/virtual-texturing.html          Virtual Texturing
pages/depth-precision.html            Depth Precision & Reverse-Z
pages/ray-tracing-and-bvh.html        Ray Tracing & the BVH
pages/screen-space-reflections.html   Screen-Space Reflections
pages/temporal-upscaling.html         Temporal Upscaling
pages/volumetrics.html                Volumetric Fog & Light
pages/post-effects.html               Bloom, Depth of Field & Motion Blur
index.html                            Rendering Library (hub, theme CSS inlined)
```

---

## Situation

`render-lib/` is an interactive library of game-engine rendering concepts. Each page is a
self-contained HTML fragment with 4–5 live canvas demos, implementation-level math, and
shader-style pseudocode. 13 of 22 pages are done. Your job is the remaining 9 pages plus
the hub page.

**Read `shared/BRIEF.md` first.** It is the page spec: file rules, structure, palette,
demo quality bar, copy rules, and the verification loop. Every page must follow it exactly.

**Read `pages/distance-fields.html`** as the reference for structure and tone. It is the
page the others were modelled on. Do not copy its content.

### Done and verified (do not touch)

```
pages/rasterization.html              Rasterization & Depth
pages/texture-filtering.html          Texture Filtering & Mipmaps
pages/normal-mapping.html             Normal Mapping & Parallax
pages/anti-aliasing.html              Anti-Aliasing
pages/transparency.html               Transparency & Sorting
pages/tone-mapping.html               HDR, Tone Mapping & Color
pages/pbr-brdf.html                   PBR & the BRDF
pages/shadow-maps.html                Shadow Maps & Cascades
pages/ambient-occlusion.html          Ambient Occlusion
pages/lighting-architectures.html     Forward, Deferred & Clustered
pages/global-illumination.html        Global Illumination
pages/draw-calls-and-instancing.html  Draw Calls & Instancing
pages/distance-fields.html            Distance Field Explorer  (the reference page)
```

### To build (9 pages)

`culling`, `lod-and-clusters`, `virtual-texturing`, `depth-precision`,
`ray-tracing-and-bvh`, `screen-space-reflections`, `temporal-upscaling`,
`volumetrics`, `post-effects`

Full specs for each are in the next section. Build them one at a time, or fan out to
subagents with one page per agent (that is how the first 13 were built; give each agent
`shared/BRIEF.md`, the reference page path, and one spec verbatim).

### Verification (required per page)

```
node shared/shot.js pages/<slug>.html shots/<slug>.png
node shared/shot.js pages/<slug>.html shots/<slug>-narrow.png 400
```

`errors` must be `[]` and `scrollWidth` must equal 1100 / 400. Then look at both PNGs and
fix anything visibly broken: empty canvas, overlapping text, clipped labels, a demo that
shows nothing at rest. One fix pass, re-run once, move on. Playwright is installed;
Chromium is at `/opt/pw-browsers/chromium` and `shared/shot.js` already points at it.

### Accuracy rule

Several finished pages carry estimated performance numbers (ms costs, bandwidth). That is
fine when labelled as an estimate. Never invent a citation: name an engine, paper or game
only when you are confident of it, otherwise write "many engines". Each subagent that
built a page reported its uncertain claims; those are collected in `UNCERTAIN.md`.

---

## Page specs

### 1. culling → Frustum & Occlusion Culling

Not drawing what the camera cannot see, and the CPU vs GPU ways to decide that. Top-down
2D world (200 m × 200 m), ~150 objects of varied size, draggable camera with FOV and
far-plane sliders.

1. **Frustum culling.** Bounding spheres and AABBs against the frustum planes; accepted/rejected counts; the false positives of a sphere vs an AABB vs an OBB for a long thin object; draw count and estimated CPU time at 1 µs per test.
2. **Spatial hierarchy.** A BVH or quadtree over the objects; walk it against the frustum, showing nodes rejected whole; tests with vs without the hierarchy as object count scales (slider 100–5000, generated deterministically).
3. **Hierarchical Z occlusion.** Render occluders into a 1D depth buffer (256 texels), build the Hi-Z max pyramid, and per object project its bounds, pick the mip where the bounds cover ≤2 texels, compare nearest bound depth against the Hi-Z max. Show tested mip level and verdict per object; count objects removed. Show the one-frame-late problem with last frame's depth (drag fast, an object pops) and the two-pass fix: draw previously visible, build Hi-Z, test the rest, draw newly visible.
4. **Portals and PVS.** A small indoor map of rooms and doors; portal culling clipping the frustum through each doorway, and a per-room PVS bitset computed live by sampling. Readout of rooms visible.
5. **Small-object culling and the GPU-driven pipeline.** Objects whose projected size < 1 pixel (threshold slider) are dropped; then a compute cull: instance buffer in, visible-instance list and indirect draw args out, with counters, as a 1080p frame budget.

Math: plane test `dist = n·c + d > −r`; AABB p-vertex test; `r_px = r·(H/2)/(d·tan(fov/2))`; Hi-Z mip `level = ceil(log2(max(w,h) in texels))`. Pseudocode: AABB frustum test; a compute cull writing an append buffer and `DrawIndexedIndirect` args; Hi-Z build as a max reduce.

Tradeoffs: CPU frustum / hierarchy / software occlusion (Umbra, Intel masked occlusion) / GPU Hi-Z / hardware occlusion queries / PVS on latency, precision, CPU cost, GPU cost, dynamic support. Shipped: PVS in Quake (1996) BSP; portals in the Unreal 1 era and Doom 3; Umbra in Unity and many AAA titles; GPU-driven culling in Assassin's Creed Unity (Haar & Aaltonen, "GPU-Driven Rendering Pipelines", SIGGRAPH 2015) and Nanite's two-pass Hi-Z; Intel masked occlusion culling. Trap: occlusion culling pays off only with big occluders; an open field gains nothing and still pays.

### 2. lod-and-clusters → LOD & Cluster Hierarchies

Matching triangle count to screen size, from discrete LODs to Nanite-style cluster DAGs.
Use 2D polylines as "meshes" (a closed curve of thousands of vertices), draggable camera distance.

1. **Screen-space error.** The curve simplified at 4 levels (2048/512/128/32 vertices, decimated live); project each level's geometric error in metres to pixels; pick the LOD whose error ≤ 1 px (threshold slider). Show popping at a switch distance and a dithered cross-fade fix. Readout: distance, error in px per LOD, triangles drawn.
2. **Why triangle size matters.** A grid of 2×2 pixel quads: a triangle smaller than a quad still costs a full 2×2 helper-lane invocation. Slider for triangle size in pixels; readout of shading efficiency (%) and why sub-pixel triangles from over-dense meshes wreck hardware rasterizers. Mention the software-rasterizer takeover for small triangles in Nanite.
3. **Cluster hierarchy.** Split the curve into clusters of 128 segments; build the simplification DAG by grouping adjacent clusters, simplifying the group to half, splitting into new clusters, repeating. Draw the DAG levels. For the current distance select the cut per cluster so each cluster's error ≤ 1 px; show different regions landing at different levels with no cracks at group boundaries (locked boundaries are the reason for group-based simplification).
4. **Streaming and memory.** Clusters as 128 KB pages; only pages for the current cut are resident; drag the camera and watch pages load and unload against a budget slider; readout of resident MB vs the full mesh.
5. **Cost over distance.** A live canvas chart of triangles rendered vs camera distance for no LOD, 4 discrete LODs, and continuous cluster LOD, plus draw calls and cluster-cull tests.

Math: `e_px = e_world·(H/2)/(d·tan(fov/2))`; LOD select as the max level with `e_px ≤ τ`; quad efficiency = covered lanes / 4; the DAG cut condition `parent_error > τ ≥ cluster_error` and why error must be monotonic; the Douglas-Peucker distance test. Pseudocode: LOD selection; cluster cull and DAG cut in a compute shader; a dithered LOD cross-fade.

Tradeoffs: discrete LODs / HLOD and impostors / progressive meshes / cluster DAG on authoring cost, memory, popping, small-triangle cost, deformation support (Nanite is static or rigid). Shipped: LOD groups everywhere; HLOD in Unreal and Unity; octahedral impostors for foliage; Nanite (Karis, "A Deep Dive into Nanite Virtualized Geometry", SIGGRAPH 2021); Hoppe's progressive meshes (1996) as the root of continuous LOD. Trap: LOD is about triangle size on screen, not distance; a huge object far away can still need high detail.

### 3. virtual-texturing → Virtual Texturing

Paging texture data like virtual memory: a huge virtual texture, a page table, a small
physical cache, and a feedback pass that says which pages are needed.

1. **Virtual vs physical.** A 32k×32k virtual texture with mips as a page grid at 128×128 pages (256×256 pages at the top level, shrinking per mip); a 2048×2048 physical cache (16×16 pages) beside it; a draggable camera over a ground plane lights up the pages the view touches and gives them cache slots. Readout: virtual size in GB uncompressed, pages resident, cache MB.
2. **Page table and indirection.** Hover a pixel: virtual UV → page id → page table lookup (with mip fallback to a coarser resident page) → physical UV → texel. Draw the page table as a grid of entries (physical x, y, mip) and show the per-entry scale/bias math.
3. **Feedback pass.** Render a 1/8-res buffer of requested page ids each frame, read it back, diff against the resident set, queue loads with a budget of N pages/frame (slider); show the latency as pages arrive over frames and the coarser mip standing in meanwhile. Move the camera fast to see it.
4. **Cache eviction.** LRU over the 256 slots with slot ages visualized; thrashing when the view needs more pages than the cache holds (zoom-out slider), and how mip fallback bounds the damage. Readout: hit rate, loads per frame.
5. **Borders and filtering.** A 4-texel border duplicated from neighbours so bilinear and anisotropic taps do not bleed across pages; the seam artifact without borders, magnified; the cache lost to borders (%) for 128 vs 256 page sizes. Include the runtime-virtual-texture variant where pages are composited rather than loaded.

Math: `page id = floor(uv·virtualSize/pageSize)` at mip m; `uv_phys = (entry.xy + frac(uv·pagesAtMip))·pageSize/physSize`; mip fallback walking up until resident; feedback buffer = screen/8; cache memory = slots × pageSize² × bytes per texel (BC7 = 1 byte/texel); border overhead `1 − ((p−2b)/p)²`. Pseudocode: a VT sample in GLSL (page-table fetch then `textureGrad` on the physical page); the feedback pass writing page ids; the CPU update loop of readback → diff → load → page-table update.

Tradeoffs: mip streaming / VT / RVT / hardware sparse (tiled) resources on memory, latency, CPU cost, filtering quality, artist workflow. Shipped: id Tech 5 MegaTexture in Rage (2011) and id Tech 6/7 in Doom; Unreal's Streaming and Runtime Virtual Textures (4.23+); Unity's Streaming Virtual Texturing in HDRP; hardware tiled resources (DX11.2, Vulkan sparse). Trap: virtual texturing does not shrink the install; it shrinks resident GPU memory and the cost of unique texturing.

### 4. depth-precision → Depth Precision & Reverse-Z

Where the bits of a depth buffer go, why the near plane dominates, and why reverse-Z with
a float buffer is the modern default.

1. **Where the precision goes.** Plot view distance (near 0.1 m to far 1000 m, sliders) to post-projection depth for standard Z; histogram how many of the 2²⁴ codes land in each distance decade; readout of the smallest resolvable step at 1, 10, 100 and 1000 m.
2. **Near plane sensitivity.** Near slider 0.01–1 m against precision at 100 m on a log plot; far slider 100–100000 m showing it barely matters. Readout of depth resolution at 50 m in cm.
3. **Reverse-Z with float.** The same plot with depth mapped 1 → 0, and a D32F buffer whose exponent spacing (denser near 0) now lands on the far distances; compare step-size curves for D24 standard, D32F standard, D24 reverse, D32F reverse. State the pipeline changes: GREATER test, clear to 0, projection tweak.
4. **Z-fighting simulator.** A floor and a decal 1 mm above it at a draggable camera distance; quantize with each config and show which surface wins per pixel over a 64×16 strip, and the distance where the fight starts. Include polygon offset / depth bias and its slope-scaled form.
5. **Reconstruction and linearization.** Hover a depth value and show `linear = n·f/(f − z(f − n))` and the reverse-Z variant, plus view-space position from the inverse projection; plot the error from linearizing with the wrong convention. Show the infinite-far-plane matrix and that reverse-Z loses nothing with it.

Math: the projection z form (state the convention); `dz_view/dz_ndc`; float32 `ulp(x) = 2^(floor(log2 x) − 23)`; the reverse-Z matrix; both linearization formulas; the infinite far plane matrix; slope-scaled bias `m·max(|dz/dx|,|dz/dy|) + r·constant`. Pseudocode: reverse-Z setup in D3D/Vulkan (compare op, clear value, projection); linearize in GLSL for both conventions; reconstruct view position.

Tradeoffs: D16 / D24S8 / D32F / D32F+S8, standard vs reverse; logarithmic depth and why it breaks early-Z; the historical W-buffer. Shipped: reverse-Z in Unreal since 4.x, Unity HDRP/URP where supported, Frostbite; logarithmic depth in Outerra and Kerbal Space Program for planetary scale; Nathan Reed's "Depth Precision Visualized" (2015) as the reference. Trap: reverse-Z helps only with a floating-point buffer; on 24-bit integer depth it changes little.

### 5. ray-tracing-and-bvh → Ray Tracing & the BVH

What a ray query costs, how a BVH makes it affordable, and how DXR/Vulkan RT exposes it.
2D world of ~300 line segments ("triangles") grouped into a few objects.

1. **Brute force vs BVH.** A draggable ray; tests without a BVH (all 300) vs with one (nodes visited + leaves tested); draw the visited nodes' boxes. Segment-count slider 50–5000, generated deterministically.
2. **Building it.** Step through construction: median split vs the surface area heuristic, drawing the tree levels; plot the SAH cost for candidate splits; compare average traversal cost over 100 random rays. Leaf-size slider 1–8.
3. **Traversal in detail.** A stack-based traversal for one ray: stack contents, near/far child ordering, `t_max` shrinking as hits are found, and the any-hit early-out for shadow rays. Readout: nodes visited, tests, stack depth.
4. **Two-level acceleration.** Objects as instances of a few BLASes with transforms; rays transformed into object space per instance; the TLAS over instance AABBs. Drag an object: only the TLAS rebuilds (fast); animate a deforming object: a BLAS refit. Readout of what was rebuilt and rough cost.
5. **Ray budget.** At 1080p, 1 ray per pixel is 2.07 M rays; sliders for rays per pixel (shadows, reflections, GI) and hardware rate in Grays/s to give ms per frame; visualize divergence as coherent primary rays vs incoherent GI rays hitting different BVH branches, counting distinct leaves per bundle.

Math: ray-AABB slab test; ray-segment in 2D, and state Möller-Trumbore for triangles; `C = C_t + (A_L/A)N_L C_i + (A_R/A)N_R C_i`; expected visited nodes ~ O(log N); instance transform `o' = M⁻¹o, d' = M⁻¹d` without normalizing; `ms = rays / rate`. Pseudocode: the slab test; a stack traversal loop; the DXR shader-table concept (ray generation, closest hit, any hit, miss) in HLSL-like pseudocode; an SAH binning build.

Tradeoffs: BVH / kd-tree / grid / SDF / hardware BVH on build time, traversal, dynamic updates, memory; refit vs rebuild. Shipped: DXR (2018) and Vulkan RT; Battlefield V reflections (2018), Control, Metro Exodus Enhanced, Cyberpunk 2077 path tracing (2023); console RT on PS5 and Series X; Lumen's hardware RT path; Embree on CPU. Trap: game ray tracing means a few rays per pixel plus denoisers, not film path tracing, and the BVH build or update is often the real cost.

### 6. screen-space-reflections → Screen-Space Reflections

Reflecting only what is already on screen by marching the depth buffer, and the fallbacks
that hide the holes. 2D side view: camera, a floor with a reflective strip, objects above
it; the camera's screen is a 1D line of 160 pixels with depth and color buffers.

1. **The idea.** For a hovered floor pixel, reflect the view ray about the normal, march it in screen space (draw the ray in world and its projection on the screen strip), compare depth against the buffer each step until it goes behind the stored surface; show the hit and the colour fetched. Readout: steps, hit/miss, the thickness test.
2. **Linear vs hierarchical march.** Fixed screen-space steps (slider 1–16 px) vs Hi-Z marching over a min-depth pyramid drawn as a strip pyramid; count steps and show skipped ranges; add the binary-search refinement after a hit.
3. **Failure cases.** The reflected object off-screen (drag it above the view), occluded by a foreground object (the hidden back side), or the ray leaving the screen edge; show the miss and the fallback chain of reflection probe cubemap → sky, with the edge-fade weight.
4. **Rough reflections.** Jitter the reflected direction by GGX importance sampling (roughness slider), N rays per pixel; the noise, then temporal accumulation and a roughness-weighted blur; reflections blurring with distance. Readout of rays per pixel and equivalent 1080p cost.
5. **Thickness and stepping artifacts.** The ray passing behind a thin object without hitting (thickness too small) vs false hits (too large), plus the smearing at grazing angles and the fix with per-pixel thickness from the depth derivative.

Math: `r = d − 2(n·d)n`; a screen-space DDA step in NDC; `z_ray > z_buf && z_ray < z_buf + thickness`; the Hi-Z min pyramid and cell-boundary step; edge fade as a smoothstep on screen-uv distance; GGX half-vector importance sampling; the temporal blend. Pseudocode: an SSR march in GLSL with the depth fetch and thickness test; a Hi-Z step; the fallback blend.

Tradeoffs: SSR / planar reflections / reflection probes / SDF-traced (Lumen) / hardware RT on cost, correctness, dynamic objects, roughness support, memory. Shipped: Crysis 2 (2011); Killzone Shadow Fall (Valient, GDC 2014); Frostbite's stochastic SSR (Stachowiak, SIGGRAPH 2015); Unreal's SSR and Lumen reflections; RT reflections in Battlefield V and Cyberpunk 2077. Trap: SSR never shows the underside of anything or what is behind the camera; it is a screen-space cache lookup, not a reflection of the scene.

### 7. temporal-upscaling → Temporal Upscaling

Rendering at lower resolution and rebuilding the full-resolution image from jittered
history (the idea behind DLSS 2+, FSR 2/3, XeSS, TSR), and what breaks it. A small
synthetic scene (sharp edge, thin line, checker) rendered per frame into a low-res buffer
and reconstructed at 2× or 3×.

1. **Sub-pixel jitter.** Output and input pixel grids at 1.5×/2×/3× (segmented control); per frame, jitter the input grid by a Halton(2,3) offset (draw the 8 or 16 offsets inside one output pixel); show the coverage of every output pixel after N frames. Readout of samples per output pixel.
2. **Reprojection.** A moving object with motion vectors; the history buffer, the current low-res frame, and arrows showing where each output pixel reads history from; disocclusion behind the moving object where history is rejected on depth/motion mismatch. Toggle rejection off for the ghosting.
3. **Accumulation and sharpness.** Reconstructed vs native vs bilinear upscale side by side with live RMSE against native; convergence over frames; the reset after a camera cut; an RCAS-like sharpen slider.
4. **Failure modes.** Thin lines flickering under a moving camera, translucent particles without motion vectors smearing, UI drawn before upscale going blurry, and a missing texture LOD bias making textures soft; toggle each. Show the mip bias formula.
5. **Cost and budget.** Tiles for internal vs output resolution (1440p → 4K quality, 1080p → 4K performance), pixels shaded, the fixed upscaler cost in ms (slider), and net frame time saved, as a canvas bar chart in the library palette.

Math: samples over N frames `= N·(r_in/r_out)²`; `j_k = Halton_k − 0.5` in input pixels; `uv_prev = uv − mv`; rejection by `|z_prev − z_reproj| > ε` or neighborhood clamp; `c = lerp(c_hist, c_in, α)` with α from sample confidence; `mip bias = log2(r_in/r_out)`; RCAS as a 3×3 kernel. Pseudocode: the jittered projection matrix; a resolve kernel (Catmull-Rom history sample, clamp, blend, jitter-aware upsample weight); the disocclusion test.

Tradeoffs: spatial (FSR 1) / temporal (TAAU, FSR 2, TSR) / ML temporal (DLSS 2+, XeSS) / frame generation (DLSS 3, FSR 3) on quality, latency, vendor requirement, engine work. Shipped: DLSS 2.0 (2020), FSR 2.0 (2022), XeSS (2022), Unreal's TSR; PS4 Pro checkerboard rendering as the earlier cousin; dynamic resolution in Halo Infinite and Call of Duty. Trap: the upscaler sees only what was rendered; correct motion vectors for everything that moves, animated UVs included, are the engine's job, and most artifacts trace back to missing ones.

### 8. volumetrics → Volumetric Fog & Light

Light scattering in participating media, and the froxel grid that makes it affordable.
2D side view: camera, a spotlight or sun, occluders, fog as uniform + height fog + a
draggable density blob.

1. **Single scattering along a view ray.** For a hovered pixel, march the ray (steps slider 8–128); per step show density, the shadow test toward the light, in-scattered light with the phase function, and transmittance so far; plot the accumulation. Render the whole view so light shafts appear behind occluders.
2. **Phase functions.** A polar plot of Henyey-Greenstein at g = −0.5, 0, 0.5, 0.9 with a draggable light direction relative to the view; apply g to the render to show the forward-scattering halo; readout of the phase value at the current angle.
3. **Froxels.** Split the frustum into an x × depth grid (32 × 64, logarithmic depth): inject density and lighting per froxel (grid coloured by in-scatter), integrate front-to-back accumulating transmittance and scattered light, then apply to a hovered pixel by sampling at its depth. Show the blockiness at low resolution and the temporal jitter plus reprojection that smooths it. Grid sliders; readout of froxel count and RGBA16F memory.
4. **Height fog.** Analytic `density = d0·exp(−h/H)` integrated in closed form vs numerically (sliders for d0 and H), showing they agree and what the cost difference is; distance fog as the special case.
5. **Clouds and self-shadowing.** A layered-noise density field at low res; march the view ray and, per sample, a short secondary march toward the sun (slider 0–8 steps); show the cost multiplying out (primary × secondary) and the Beer-Powder look. Readout of samples per pixel and estimated 1080p ms for a given per-sample cost.

Math: `T = exp(−∫σ_t ds)`; `L = ∫ T(t)σ_s ρ(t) p(θ) L_light(t) V(t) dt`; `p(θ) = (1−g²)/(4π(1+g²−2g cosθ)^1.5)`; the closed-form exponential height fog integral; `z_i = n(f/n)^(i/N)`; Beer-Lambert. Pseudocode: a GLSL march with transmittance and shadow sampling; a froxel integration compute pass scanning front-to-back; applying froxel fog as `color·T + inscatter`.

Tradeoffs: analytic distance/height fog / screen-space god rays / per-pixel ray marching / froxels / ray-marched clouds on cost, quality, dynamic lights, shadowing. Shipped: froxel fog in Assassin's Creed IV (Wronski, SIGGRAPH 2014) and Frostbite (Hillaire, 2015); Unreal's Volumetric Fog; Unity HDRP; Horizon Zero Dawn's clouds (Schneider, SIGGRAPH 2015); radial-blur god rays from GPU Gems 3 (Mitchell, 2007). Trap: fog colour is not a tint; it is scattered light and depends on the scene's lights, which is why a baked fog colour looks wrong under moving lights.

### 9. post-effects → Bloom, Depth of Field & Motion Blur

Three screen-space post effects, each a pipeline of passes with its own inputs (HDR
colour, depth, velocity). Work on a synthetic 256×144 HDR scene: bright emissive shapes
at 5–50× white, dim geometry, a textured ground with depth, one moving object with a
velocity buffer.

1. **Bloom pipeline.** Threshold with a soft knee (sliders) → a 6-mip downsample chain with the 13-tap filter (draw every mip) → tent-filter upsample with additive blends → composite with intensity. Show the firefly flicker from one bright pixel and the Karis-average fix. Readout of chain memory and texture reads.
2. **Why the blur is HDR-correct.** Bloom before vs after tone mapping (after looks like haze on everything); show that only pixels above 1.0 contribute.
3. **Depth of field.** Circle of confusion from the thin-lens model (focal length, f-stop, focus distance sliders); plot CoC vs depth; render gather-based DoF with the near/far split and the rule that the near field bleeds over in-focus areas; show the halo from a naive blur; compare hexagonal vs circular bokeh and the sample count.
4. **Motion blur.** A velocity buffer from the moving object and camera motion (draw the vectors); per-pixel blur along velocity with N samples; the tile-max / neighbor-max dilation (McGuire 2012) that lets blur spread past the silhouette; depth-aware weighting that stops the background smearing over the foreground. Sliders: shutter 0–1 frame, samples.
5. **Cost and ordering.** The post stack as a pass list (motion blur → DoF → bloom → tone map → AA/upscale → UI, noting orders vary) with ms tiles and a total, the resolution each pass runs at (half-res DoF, quarter-res bloom), and memory. Note where TAA and upscalers sit relative to these.

Math: the soft-threshold knee; 13-tap downsample weights; `CoC = A·|f(d − d_f)| / (d(d_f − f))` with `A = f/N`; signed near/far CoC; motion sample `p + v·(i/N − 0.5)·shutter`; tile max velocity; the depth-aware weight. Pseudocode: a bloom downsample with the Karis average; a DoF gather loop with a CoC compare; a motion-blur loop with neighbor-max and depth weighting.

Tradeoffs: bloom as a blur chain vs FFT convolution; DoF gather vs scatter vs ray-traced; motion blur per-object vs camera-only vs tile-based, on cost, artifacts, half-res tricks. Shipped: Call of Duty: Advanced Warfare (Jimenez, "Next Generation Post Processing in Call of Duty", SIGGRAPH 2014); Unreal's Standard and Convolution bloom; Unity's post-processing stack; McGuire's motion blur (2012); Frostbite's DoF. Trap: post effects are cheap per pixel but run full-res every frame, so they end up 2–5 ms of a 16 ms budget, which is why most run at half or quarter resolution.

---

## Hub page → index.html

A real page, not a link list. It is a standalone HTML **document** (unlike the fragments:
it needs `<!doctype html>`, `<html>`, `<head>` with the fonts link and the theme CSS, and
`<body>`). Same palette and typography as the pages.

- Title "Rendering Library". A lead paragraph saying what this is: interactive explainers
  for real-time rendering, each with live demos, the math, and shader pseudocode.
- Group the 22 pages under four headings: Core pipeline, Lighting & shadows,
  Geometry & performance, Ray tracing & temporal. Put Distance Fields under
  Lighting & shadows, or in a fifth group of its own if that reads better.
- Each entry: the page name as a link to `pages/<slug>.html`, a one-line description, and
  a mono list of its demo names. Keep the card treatment light: these are index entries,
  not five identical drop-shadowed boxes.
- A "read in order" suggestion for someone new: rasterization → depth precision →
  texture filtering → anti-aliasing → PBR → lighting architectures → shadow maps →
  the rest.
- A short honesty note: performance figures on these pages are estimates unless a source
  is named, and the 2D demos are analogues of 3D algorithms, chosen so the mechanism is
  visible.

Verify it the same way (`node shared/shot.js index.html shots/index.png`, and at 400).
The relative links will not resolve in the screenshot harness; check them by opening the
folder in a browser, or just confirm the `href`s match the filenames in `pages/`.

## Publishing

The 13 finished pages are not yet published. Options, in the order I would try them:

1. As a static site: the pages are already self-contained, so `index.html` + `pages/` +
   `shared/` is servable as-is from any static host.
2. As individual Claude artifacts, one per page, if you want each shareable on its own.
   The fragments are written for that (no doctype, no head), so they publish directly.
3. The user mentioned `fridge` CLI and a `moistfridge` target; I could not find that tool
   and no folder was connected, so nothing was pushed. Ask the user for the exact command.
