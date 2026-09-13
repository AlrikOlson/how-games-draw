# Rendering Library: page brief

You are writing ONE page of an interactive library that explains real-time rendering concepts used in game engines. The audience is a game developer who wants working intuition AND the implementation: the math, the data layout, and shader-style pseudocode. Every page is a self-contained HTML fragment with live 2D-canvas (or WebGL) demos, written in vanilla JS with no libraries.

Read the reference page first: `D:/Code/render-lib/pages/distance-fields.html`. Match its quality, tone, and structure. Do not copy its content.

## File rules

- Write to `D:/Code/render-lib/pages/<slug>.html`.
- The file is an HTML **fragment**: no `<!doctype>`, `<html>`, `<head>` or `<body>` tags. It starts with `<title>…</title>`, then the Google Fonts `<link>` (copy it from the reference), then ONE `<style>` containing the full contents of `D:/Code/render-lib/shared/theme.css` pasted verbatim, followed by any page-specific CSS. Then the markup inside `<div class="wrap">`, then one `<script>`.
- First element inside `.wrap`: `<a class="back" href="../index.html">← Rendering Library</a>`.
- No external scripts, stylesheets, images, or fetches. Everything inline. No `alert`/`confirm`.
- Must render correctly at 400px wide and at 1100px wide with no horizontal scrolling of the page body.
- Every form control gets a stable `id`.
- Canvases: internal size 512×512 (or 640×360 for 16:9 demos, set `aspect-ratio` on the canvas in page CSS), CSS width 100%. Use `touch-action:none` (already in theme) and pointer events. Viewports are always dark (`#0b0e13` ground) regardless of page theme, like an engine debug view; page chrome uses the theme tokens.
- Viewport palette: ground `#0b0e13`, amber `#f2a341`, blue `#4aa3ff`, white `#ffffff` for handles/ray lines, green `#5ad48a` and red `#ef5d5d` only for pass/fail semantics, dim grid `rgba(255,255,255,0.12)`. Keep to this palette so the pages read as one library.

## Page structure (in this order)

1. `<header>`: `.eyebrow` (a mono line with a concrete fact about the demo scene, e.g. "1024×1024 shadow map · 60° spotlight · drag the light"), `<h1>` (2–4 word product-style name, e.g. "Shadow Maps", "Tone Mapping"), `.lead` paragraph (3–4 sentences that state the core idea and the one distinction people get wrong), and a `.key` legend for the viewport colors used on the page (set `--sw` per span: `<span style="--sw:#f2a341">outside</span>`).
2. **4 to 5 `<section>`s, each with a live demo.** Each section: `<h2>`, `.sub` one-liner, a `.cols` grid with `.vp` canvas on the left and `.prose` on the right (or `.cols.two` for side-by-side comparisons, `.cols.wide` for a wide canvas). Every demo has at least one thing to drag or a control that changes the picture, and a live numeric readout in the `.cap` under the canvas (real units: pixels, metres, milliseconds, bytes, degrees, samples).
   Inside each section's prose, include:
   - **The math**, in a `<div class="math">` block: the actual formulas in plain ASCII/Unicode (e.g. `D_GGX(h) = α² / (π ((n·h)² (α² − 1) + 1)²)`). One block per idea, not a wall.
   - **Shader-style pseudocode** in `<pre class="code">` (GLSL/HLSL flavour, 6–20 lines, real variable names, comments on the non-obvious line). Wrap comments in `<span class="c">`, keywords you want to highlight in `<span class="k">`. Escape `<` and `>` as `&lt;` `&gt;` inside pre.
   - Optional `.tiles` row of live numbers when a comparison (e.g. samples per pixel across three modes) is the point.
3. A **"Tradeoffs"** section: `.stats`-style or `.uses`-style table comparing the variants on shared dimensions (cost in ms or bandwidth, memory, quality failure mode, when to pick it). Real numbers where they exist (e.g. G-buffer bytes per pixel, shadow map memory at a resolution).
4. A **"Where it shows up in shipped games"** section: `.uses` table with columns Use / What the query is / Data it needs / Seen in. Only cite engines, games, papers and years you are confident of (e.g. Unreal Engine, Unity HDRP, Godot 4, Frostbite, id Tech, Call of Duty's SIGGRAPH talks, Valve papers, Nanite, Lumen, DLSS/FSR/XeSS). If unsure, say "many engines" instead of guessing a name. End with a `.note` that names one common naming trap or misconception.

## Demo quality bar

- Demos must show the **mechanism**, not a picture of the result. A shadow-map page shows the depth texture being written from the light, then compared per pixel. A TAA page shows the jitter sequence and history buffer. An anti-aliasing page shows the sample positions inside one pixel.
- Everything computed live from the scene, never hard-coded results. Readouts change when the user drags.
- Keep per-frame work under ~10 ms. Throttle pointer moves with `requestAnimationFrame`. Precompute what does not change. Use `ImageData` for per-pixel renders (scale up with `imageSmoothingEnabled=false`).
- The page at rest (no interaction) already shows every demo in an interesting state. Pick defaults that make the effect visible immediately.
- Use real units and real scales: a 10 m scene, a 1920×1080 target, a 2048² shadow map, a 24-bit depth buffer, 16 bytes per G-buffer pixel, 60 Hz / 16.7 ms.
- WebGL is allowed if a demo truly needs it (e.g. a lit sphere for BRDF). If you use it, include a 2D-canvas fallback message if `getContext('webgl')` returns null.

## Voice

As of the 2026-09-13 rewrite, every page follows the plain-language, progressive structure in `D:/Code/render-lib/shared/REWRITE.md`. Read it. New pages are written that way from the start.

## Visuals

Demos are game moments, not abstract shapes: see `D:/Code/render-lib/shared/VISUALS.md` and paste `D:/Code/render-lib/shared/scene-kit.js` into the page script.

## Copy rules (strict)

- Plain, direct prose. Short paragraphs. Lead with the point. Concrete nouns and real numbers.
- Never use: delve, dive into, unpack, navigate, landscape, realm, tapestry, journey, underscore, bolster, foster, harness, leverage, elevate, unlock, illuminate, shed light on, pave the way, testament, cornerstone, pivotal, crucial, vital, seamless, robust, comprehensive, holistic, nuanced, intricate, multifaceted, vibrant, transformative, groundbreaking, game-changing, cutting-edge, revolutionary, meticulous, profound, myriad, plethora, embark, resonate, foundational, genuinely, honestly, straightforward.
- Never use "It's not just X, it's Y", "Not only X but Y", rhetorical questions as transitions, one-line fragments for emphasis, or emoji. No exclamation marks.
- At most one em dash on the whole page. Prefer a period, comma or colon.
- No "**Bold term:** explanation" lists. Use prose or a table.

## Verify before you finish (required)

1. Run `cd D:/Code/render-lib && node shared/shot.js pages/<slug>.html shots/<slug>.png` and then `node shared/shot.js pages/<slug>.html shots/<slug>-narrow.png 400`.
2. The script prints JSON: `errors` must be `[]` and `scrollWidth` must equal the viewport width (1100 and 400). Fix any error.
3. Look at both screenshots with the Read tool. Fix anything visibly broken (empty canvas, overlapping text, clipped labels, a demo that shows nothing at rest). One fix pass, then re-run the screenshot once to confirm.
4. Do not build a test loop beyond that; do not add DOM-probing scripts.

## Report back (your final message)

Return exactly this, nothing else:

```
slug: <slug>
title: <the <title> text>
description: <one sentence for a gallery card>
demos: <demo 1 name>; <demo 2 name>; …
uncertain: <any fact, name or number you were not sure of, or "none">
```
