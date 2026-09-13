# Visuals pass: make every demo look like a game moment

You are re-conceptualising and rewriting the DEMOS (the canvas drawing code and the prose that
describes it) of ONE existing page in `D:/Code/render-lib/pages/`. The math blocks, code blocks,
tradeoffs table and shipped-games table stay. The pictures change completely.

Read first: `D:/Code/render-lib/shared/BRIEF.md` (file rules, demo quality bar, copy rules) and
`D:/Code/render-lib/shared/REWRITE.md` (voice and section structure). Both still apply.

## The goal

A person who plays games but has never written a shader should look at any canvas and
recognise a game situation before reading a word: a player standing in a village, a lamp on a
dark street, a car on a road, a forest, a castle with rooms and doorways. The mechanism the page
teaches is drawn on top of that scene, in the library's overlay colours, and it stays the point.

Today the demos are abstract: grey rectangles, random polygons, checkerboards, "object 37".
Replace every abstract stand-in with something a player would recognise.

## The scene kit

`D:/Code/render-lib/shared/scene-kit.js` is a small set of canvas helpers: `kitGround`,
`kitTopGround`, `kitTree`, `kitPine`, `kitHouse`, `kitCrate`, `kitWall`, `kitPlayer`,
`kitPlayerTop`, `kitLamp`, `kitCar`, `kitCloud`, `kitLabel`, `kitArrow`, `kitInset`, and a
`KIT` colour palette for props. Read it. Paste the whole file verbatim at the top of the page's
`<script>` (external scripts are not allowed) and use it, so all 22 pages share one game-world
look. Add your own props in the same flat style when you need them (a sword, a barrel, a
window, a torch, a fence, a bridge, a mountain ridge).

## Rules

1. **Every demo is anchored in a recognisable game moment.** Say it in the section's `.sub`
   line: "A player walks through a village at night. Which houses does the engine bother to
   draw?" Use one world per page where you can (the same village, forest, road or castle in
   every section) so the page feels like one place.
2. **Show both views when it helps.** The main canvas is usually the engine's view (top-down or
   side-on, with the mechanism overlaid). Add a "what the player sees" inset (`kitInset`) that
   shows the result on screen. For image-based topics (textures, anti-aliasing, tone mapping,
   post effects, upscaling, reflections) the main canvas IS the player's view, and the
   mechanism appears as a magnified inset, a side strip, or an overlay you can toggle.
3. **Label the picture in plain words.** Use `kitLabel` and `kitArrow` for up to about six
   callouts per canvas: "player", "hidden behind the wall", "too far, skipped", "the sun's
   photo", "this pixel". Prefer a label on the canvas over a paragraph beside it.
4. **Keep the overlay palette for the mechanism.** Amber = drawn / kept / hit / the thing being
   explained; blue = the comparison or the second thing; white = camera, rays, handles; green
   and red only for pass / fail. The kit colours are for props only. Viewports stay dark.
5. **Keep the mechanism visible.** No demo becomes a pretty picture. The test, the compare, the
   sample positions, the buffer being written: still drawn, still live, still driven by drags
   and sliders. Every readout in the `.cap` stays live and in real units.
6. **Pixel-level demos** (ImageData renders) draw a tiny game scene instead of a test pattern:
   the player sprite, a brick wall, a fence, a sky with a sun, a road. Keep a synthetic case
   only where the mechanism needs it (a thin line for flicker), and make it a game thing (a
   fence wire, a power line, a sword edge).
7. **Controls and ids.** Keep every existing control and id where it still makes sense. You may
   add controls (stable ids) and drop ones that no longer fit, but then update the prose and
   captions that mention them. Keep all math, code and tables unchanged.
8. **Update the words that describe the picture:** the `.eyebrow`, the header `.key` legend,
   each section's `.sub`, "What you're seeing", "Try this", and `.cap` text. The plain intro,
   "The real version" and the "Remember" line mostly stay; fix any sentence that referred to
   the old picture.
9. **Performance.** Props are cheap, but draw the static scene once into an offscreen canvas
   and blit it each frame when a demo redraws on every pointer move. Keep per-frame work under
   about 10 ms. Deterministic scene layout (seeded), never random per frame.
10. **Accessibility.** Update each canvas `aria-label` to describe the new scene.

## Suggested framings (use, improve, or replace with something better)

| page | one world for the page | how the mechanism shows |
|---|---|---|
| rasterization | a low-poly knight on a tiny 24×16 "screen" | the knight's triangles landing on the pixel grid; depth when the knight stands behind a tree; overdraw in a forest |
| depth-precision | a long road at night with lamp posts to the horizon | a poster on a far wall that z-fights; the depth buffer as a strip under the road |
| texture-filtering | a cobblestone road and a brick wall receding | moiré on a picket fence; the mip chain as the road texture at each distance |
| anti-aliasing | a castle roofline and a picket fence against the sky | jaggies on the roof edge; the fence shimmering as the camera pans; sample points inside one pixel of the roof |
| transparency | a tavern window, smoke from a chimney, a glass bottle | draw-order mistakes with smoke puffs around the player; the depth trick on a stained-glass window |
| tone-mapping | a campfire at night and the bright doorway of a cave | exposure as walking from the cave into daylight; the tone curve applied to the fire |
| post-effects | a street lamp (bloom), a player with trees behind (DoF), a passing car (motion blur) | each effect's passes shown on that object |
| pbr-brdf | a wet road, a bronze shield, a wooden barrel | the lobe from the player's eye; the lit sphere becomes a lit helmet or shield |
| lighting-architectures | a village square at night with 30 lanterns | how many lanterns each house has to check under forward / deferred / clustered |
| shadow-maps | the sun over a village; the player and trees casting shadows | the shadow map as "the sun's photo"; acne on the ground; cascades as near / mid / far rings around the player |
| ambient-occlusion | a cellar corner with crates and barrels | the darkening under and between crates; the rays from a floor point |
| global-illumination | a room with a red wall and a sunlit window | the red bounce on the floor and on the player |
| distance-fields | a dungeon level map with walls | distance to the nearest wall used for a sliding collision and a soft torch shadow |
| volumetrics | a lantern in a foggy forest; clouds over a field | the light shafts between trees; the fog ray from the player's eye |
| normal-mapping | a brick wall lit by a moving torch | the fake bumps reacting to the torch; the flat quad beside it |
| draw-calls | a forest of 1,000 trees and a market of 200 crates | one order per tree vs one order for all; the sort as grouping by kind |
| culling | a village top-down with a player, walls and a castle with rooms | houses behind walls skipped; rooms and doorways as portals |
| lod-and-clusters | a mountain ridge and a tree line seen from a road at several distances | the ridge polyline simplified as the player walks away |
| virtual-texturing | a huge painted world map (forest, river, village) the camera flies over | the tiles that get loaded as the camera moves |
| ray-tracing-and-bvh | a room with a mirror, a lamp and furniture; a forest outside | rays from the player's eye; the box tree over trees and houses |
| screen-space-reflections | a lake or puddle reflecting a house and the player | the reflection failing when the house leaves the screen |
| temporal-upscaling | a running player past a picket fence | the small frame and the rebuilt big frame of that scene |

## Verify before you finish (required)

Same as BRIEF.md: `node shared/shot.js pages/<slug>.html shots/<slug>.png` and the 400 px run.
`errors` must be `[]`, `scrollWidth` 1100 / 400. Then `node shared/peek.js pages/<slug>.html
shots/<slug>-peek-N.png 1600 "section:nth-of-type(N)"` for at least two demo sections and look at
them: the scene must be recognisable and the mechanism visible at rest. One fix pass, re-run.

Use a temp folder named after your page under the scratchpad for any working files; other
agents share that scratchpad and generic names get clobbered.

## Report back (your final message, nothing else)

```
slug: <slug>
title: <the <title> text>
world: <the game world the page uses, one line>
demos: <section 1: game moment · mechanism shown>; <section 2: …>; …
controls-changed: <ids added or removed, or "none">
uncertain: <anything you were unsure of, or "none">
```
