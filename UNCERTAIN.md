# Claims to check before publishing

Each page was built by a separate agent that reported what it was unsure of. Collected
here so a fact-check pass has one list. Nothing below is known to be wrong; these are the
places where a citation, date or number was written from memory or estimated.

Performance figures across the whole library are order-of-magnitude estimates unless a
source is named. The 2D demos are deliberate analogues of 3D algorithms.

## rasterization
- Ubisoft SIGGRAPH 2015 attribution for Assassin's Creed Unity GPU-driven culling (talk was "GPU-Driven Rendering Pipelines", Haar & Aaltonen).
- Hardware tile sizes (8×8, 16×16) are stated as typical, not per-vendor facts.
- Depth-step numbers computed from the page's own formula at near 0.1 m, far 500 m, not vendor figures.

## texture-filtering
- The mip-bias formula in the DLSS and FSR 2 integration guides (page says "about log2(render width / display width)"; the guides may subtract a further constant).
- "Bilinear is full rate for 32-bit formats, wide formats filter at reduced rate" is a generalisation across vendors.
- "Console defaults to 4× anisotropic" is a rule of thumb, not a documented setting.

## normal-mapping
- The BC5 encoder in the demo is a simplified per-block nearest-palette encoder, so its error numbers are an upper bound, not what a production compressor gives.
- Doom 3 / Half-Life 2 both 2004; Crysis 2007; Unreal's ParallaxOcclusionMapping material function and Composite Texture setting: from memory, fairly confident.

## anti-aliasing
- "Well under a millisecond at 1080p" for FXAA is a rough figure, not measured.
- Battlefield 3 and Skyrim shipping FXAA as an option, and Crysis 3 using SMAA: from memory.
- SMAA lookup-table size (~0.2 MB) approximate. UE4 TAA default stated only as "since 2014".

## transparency
- AMD 2010 per-pixel linked-list demo authorship (Yang, Hensley, Grün, Thibieroz, HPG 2010) and its later use in TressFX: from memory.
- Linked-list node size of 12 B is an assumed layout; some implementations use 16 B.
- Unity HDRP LOD cross-fade being dither-based: from memory.
- "Some engines use WBOIT for particles" is deliberately vague.

## tone-mapping
- The AgX curve is the 6th-order polynomial sigmoid approximation without inset/outset matrices, labelled "AgX-like".
- Godot 4.3 shipping an AgX option; Unity's tonemapper naming ("Neutral", "ACES" in HDRP); Dolby Vision gaming on Xbox Series X|S dated 2021.
- The SIGGRAPH 2016 attribution for tone-mapped TAA in Call of Duty.

## pbr-brdf
- ALU-per-light counts in the tradeoffs table are rough estimates.
- "Up to about 30% energy loss at roughness 1" for single-scattering GGX is approximate.
- UE4's spherical-gaussian Fresnel constants (−5.55473, −6.98316) quoted from memory.
- The 1D microfacet demo groups GGX slopes into four coherent hills for visibility, so its measured G1 deviates from Smith more than an uncorrelated surface would.

## shadow-maps
- Per-pixel ms costs in the tradeoffs table are order-of-magnitude estimates for 1080p on a mid-range GPU.
- UE5 Virtual Shadow Map geometry stated as 16k×16k virtual per light in 128×128 pages.
- "Several NVIDIA-sponsored titles of that period" for PCSS beyond GTA V PC (2015).
- "Hardware slope-scale bias equals texel width × tan θ" is a simplification of the depth-derivative definition.

## ambient-occlusion
- Cost ranges and the per-sample constants in demo 5 (0.05 ms per SSAO sample, 0.025 ms per SDF tap, 1.5 ms per ray at 1080p) are estimates, not benchmarks.
- Assassin's Creed IV: Black Flag as an HBAO+ example.
- The GTAO single-slice value is normalized by its open-sky value, a 2D adaptation rather than the paper's 3D integral over slice directions.

## lighting-architectures
- Doom 2016's exact cluster grid dimensions were omitted rather than guessed.
- "Some mobile and tile-based GPU pipelines" for the visibility buffer is a general claim.
- Unity URP Forward+ named as clustered forward, per Unity's docs.
- Battlefield 3 (2011) as the shipped Frostbite tiled-deferred title, from DICE's SIGGRAPH 2011 talk.

## global-illumination
- Per-frame ms ranges (DDGI 1–3, SSGI 1–2, VXGI/SDFGI 3–6, Lumen 4–8, hardware RT 5–20) and lightmap/clipmap memory figures are estimates.
- Far Cry 3's 2012 "deferred radiance transfer volumes" attribution and Unreal 4.24 as the first SSGI release: from memory.

## draw-calls-and-instancing
Built but its agent was cut off before reporting. Renders clean (no console errors, no
overflow at 1100 and 400 px) but its numbers and citations have had no second look.
Worth a read-through: the µs-per-draw costs, the sort-key bit layout, and the
"Approaching Zero Driver Overhead" (NVIDIA, GDC 2014) and Alan Wake 2 mesh-shader claims.
## depth-precision
- Kerbal Space Program's approach to planetary depth (page says "camera split" rather than logarithmic depth; not confident of either).
- Unreal Engine using an infinite far plane by default.
- Frostbite using reverse-Z (taken from the spec, not verified).
- The Outerra blog year (2012).
- D32F+S8 padded to 8 bytes per pixel (labelled an estimate).
- The W-buffer's history is stated only as a dropped fixed-function Direct3D option.
- "Reverse-Z on D24 changes almost nothing" is exact for the quantization step but ignores small float error in z/w before quantization.

## ray-tracing-and-bvh
- "1.5–2 × log₂N box tests" and "20–60 node visits per ray" are labelled estimates, not measured.
- "Tens of ms on one CPU core, about 1 ms with a GPU builder" for a 1 M-triangle binned SAH build: estimate.
- "Refit is roughly 1/5 to 1/10 of a build" and "a few times the vertex data" for hardware BVH memory: estimates.
- Alan Wake 2 (2023) path-tracing mode and Spider-Man: Miles Morales (2020) reflections: from memory.
- Lumen hardware RT tracing against simplified Nanite fallback meshes: from memory.
- AMD RDNA 2 doing box/triangle tests in hardware with traversal in shader: from memory.

## culling
- Nanite's two-pass scheme described as "draw last-visible, build Hi-Z, test the rest" and attributed generically.
- Unreal Engine 1 era zones/portals and Doom 3 portals: from memory.
- Intel masked occlusion culling dated 2016.
- Cost figures (20–50 ns per SIMD test, 0.5–2 ms software occlusion, 0.1–0.3 ms GPU Hi-Z, 2 G instances/s compute cull, 20 µs dispatch) are labelled estimates.
- The demo's PVS is sampled (12×12 per room) and can miss a sliver; the prose says so.

## volumetrics
- Unreal's default Volumetric Fog grid (8 px per froxel, 64 depth slices, 240×135×64 at 1080p): from memory of the UE4 docs.
- Assassin's Creed IV grid 160×90×64: from Wronski's 2014 talk as remembered.
- All ms costs in the tradeoffs table and the cloud cost tiles are labelled estimates.
- "Crysis (2007)" for screen-space god rays and "Unreal Engine Volumetric Clouds" cited without a paper reference.

## lod-and-clusters
- "4 clusters per 128 KB page" is the demo's stand-in ratio, labelled as such; real Nanite packs many more compressed clusters per page.
- Nanite's 64-bit visibility-buffer packing in the pseudocode is illustrative, not the exact bit layout.
- "Skinning arrived later and with restrictions" refers to Nanite's experimental skeletal-mesh support in a later UE 5.x release; version not stated.
- Unity HLOD cited as a package rather than a core feature.
- Impostor-atlas memory (16 MB raw / 4 MB BC7 at 2048² RGBA8) is arithmetic, not a measured engine number.
- "Roughly four times per output pixel" shading overhead for 1 px triangles is derived from the quad rule, not measured.

## temporal-upscaling
- "8·s²" jitter phase count stated as FSR 2's formula.
- Balanced preset scale given as "about 1/1.7" (DLSS/FSR Balanced is 58%, about 1.72×).
- All cost-column and upscaler-cost ms figures are labelled estimates.
- "Unity HDRP TAA Upscale" as a shipped TAAU name.
- "PS4 Pro titles from 2016", "Horizon Zero Dawn (GDC 2017)" and "Frostbite's Battlefield 1 (GDC 2017)" checkerboard citations: from memory of those GDC talks.
- Call of Duty listed for dynamic resolution without a specific title or year.
- XeSS DP4a fallback path and DLSS 3 requiring RTX 40: from memory of vendor docs.
- The projection-matrix jitter sign/row convention is flagged in the code as convention-dependent.

## virtual-texturing
- The eviction demo uses a mip-bias slider instead of the spec's "zoom-out" slider (page demand is screen-bounded in this model); the prose says so.
- Latency (3 frames) and all per-frame ms figures in the tradeoffs table are labelled estimates.
- "Some engines store 136² slots for 128 unique texels" stated generically.
- Far Cry 4 adaptive virtual texturing (GDC 2015) and Unity HDRP Streaming Virtual Texturing: from memory.
- Doom (2016) mip-chain-per-slot and "anisotropy capped near 8×" are generalisations, not attributed.
- Page-table size "about 340 KB as RGBA8" is computed (87,381 × 4 bytes), not sourced.

## post-effects
- All ms figures in the cost section and tradeoffs table come from assumed ns-per-pixel constants (labelled estimates).
- FFT bloom cost/memory (1–3 ms, ~20 MB) and scatter DoF range (0.5–6 ms) are rough guesses.
- Unreal running temporal AA before motion blur and bloom: from memory of the UE4 post-process order; may not hold for every version.
- "Moving Frostbite to PBR" (Lagarde and de Rousiers, SIGGRAPH 2014) cited for Frostbite's physical camera model, not a specific DoF implementation.
- Guertin, McGuire and Nowrouzezahrai HPG 2014 motion blur citation: from memory.
- The partial Karis average is a luma-weighted average inside each 4-tap group, one reading of Jimenez 2014.
- The DoF focal-length slider changes only the CoC, not the framing; the page does not say so.

## screen-space-reflections
- All cost figures in the tradeoffs table (0.5–2 ms SSR, 2–8 ms planar, 2–5 ms Lumen software, 1–5 ms hardware RT, "tens to hundreds of MB" BVH) are labelled estimates.
- The "250 G depth fetches/s" throughput behind the estimated-ms tile is a round-number assumption.
- The Killzone Shadow Fall GDC 2014 talk is cited by author and year only.
- The GGX 2D demo keeps only the in-plane component of a 3D half-vector sample, an approximation of the true 2D lobe.
- The "one-sided min depth derivative" thickness rule is the author's formulation, not a quoted engine implementation.

