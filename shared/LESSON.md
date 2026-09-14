# Lesson pass: rebuild one page as guided, learn-by-playing demos

You are rebuilding ONE page in `pages/` so that a person with no graphics background can understand
the idea by playing through its demos, the way a Brilliant.org lesson works. The finished exemplar is
`pages/rasterization.html`. Match it exactly in structure, tone and reading level. Do not copy its content.

Work only inside `pages/<slug>.html` and your own temp folder. Never run `shared/apply-theme.js`,
`shared/build-index.js` or `shared/build-site.js`: other agents are editing other pages at the same
time and those scripts touch every page. Your page already carries the current theme.

## The reader

Someone who plays games and knows a screen is made of tiny squares. That is all. They do not know
what a shader, a buffer, a texel, a frustum, a mip, a BRDF, a sample, a normal, a G-buffer or a
draw call is. Every one of those words is defined in the sentence that first uses it, in everyday
words, or it is not used. If the last session's page assumed the reader knew a term, that is exactly
what is being fixed.

Test every sentence you write: would a smart friend who has never programmed follow it without
asking? If not, rewrite it.

Before (assumes too much):
> "Switch the tie rule to E ≥ 0 both. The double-covered count jumps to 10."

After:
> "The two halves share the seam down the middle, and ten pixel centres sit exactly on it. Right now
> a tie rule gives each one to exactly one triangle. Switch it so both triangles draw it."

Before: `pixel = (883, 316) · depth 0.93458`
After: `lands on pixel (883, 316) of 1920×1080 · stored depth 0.935 (0 = at the camera, 1 = as far as it draws)`

Before: control buttons `D16 / D24 / D32F / D32F reversed`, `LESS / GREATER`
After: `16-bit / 24-bit / 32-bit float / 32-bit float, reversed`, `nearer number (LESS) / farther number (GREATER)`

## The formula, per demo section

Every demo section becomes one full-screen **stage**:

```html
<section id="<id>" class="stage">
  <h2>Plain heading, under 7 words</h2>
  <p class="sub">One plain sentence naming the game moment and what the demo shows.</p>
  <div class="cols">
    <div class="vp">
      <canvas id="…" width="512" height="512" class="grab sq" aria-label="…"></canvas>
      <div class="cap"><span id="…-read">…</span></div>
    </div>
    <div class="lesson" data-lesson="<id>">
      <div class="controls" data-step-min="3"> …existing controls, plain labels… </div>
      <div class="tiles"> …existing live numbers, plain labels… </div>
    </div>
  </div>
  <div class="foot">
    <p class="tldr">One plain sentence to remember.</p>
    <details class="hood"><summary>Under the hood: the math and the code</summary><div>
      …the old "The real version" paragraphs, .words lines, .math block and pre.code, verbatim…
    </div></details>
  </div>
</section>
```

- The lesson kit renders the step card at the top of `.lesson`. Controls and tiles stay in the
  markup after it. `data-step-min="k"` hides a block until step k (1-based); use it so controls
  appear when a step first needs them.
- The `.prose` block, its `.plain` intro, "What you're seeing", "Try this" and "The real version"
  headings go away. Their content is redistributed: the ideas into the steps, the math and code
  into the hood.
- Canvas class sets its shape so the stage can cap its height: `sq` (1:1), `r169` (16:9),
  `r32` (3:2, e.g. 768×512), `r43` (512×380). A canvas with another ratio gets the closest class
  and the canvas attributes changed to match, with the drawing code adjusted.
- A section that had two demos side by side becomes two stages, each with its own id and lesson
  (the exemplar split its coverage section into `coverage` and `persp`).
- The "Tradeoffs" and "Where it shows up in shipped games" sections stay as they are, apart from
  plainer wording if a cell assumes the reader knows a term.
- The header keeps its structure. Make the `.eyebrow` plain (no "60° fov · 24-bit depth"), rewrite
  the `.lead` for the reader above, and keep the `.key` legend and the `.terms` box.

## The lesson, in the script

At the end of the page's main script, after all demos are initialised, define one lesson per stage:

```js
L1 = lesson("<id>", { next: { id: "<next id>", title: "<next h2>" }, steps: [
  { say: "A look step: two to four short sentences that say what is on the canvas, in plain words." },
  { say: "<b>Drag the lantern</b> to the left of the tree.", todo: "drag the lantern left of the tree",
    goal: () => S.lamp.x < S.tree.x - 1, try: () => { S.lamp.x = S.tree.x - 2; draw(); },
    done: "One or two sentences on what just happened and what it means." },
  { say: "Optional lead-in.", quiz: { q: "One clear question?", options: [
      { t: "Wrong answer", why: "Why it is wrong, in one sentence, so the reader learns from it." },
      { t: "Right answer", ok: true, why: "Why it is right, tying it to what the canvas shows." },
      { t: "Another wrong answer", why: "…" } ] },
    todo: "now try it on the canvas", goal: () => …, try: () => …, done: "…" },
  { say: "A closing look step: the one idea, and that the formulas are under the hood." } ] });
```

Rules:
- 4 to 7 steps per stage. Look, do, predict-then-check. At least one quiz per stage, at least
  two do steps. Each step introduces at most one new idea.
- `goal()` reads the demo's own state. It must be reachable by a real drag or control change, and
  not by a hair: leave margin (a threshold of 10 when the drag can reach 13). Goals are sticky once
  met, so a goal can be "at some point the reader did X".
- Every goal step has `try()`: a realistic way to reach the goal. For a control, set the DOM
  element and dispatch its event (`$("dA").value = 120; $("dA").dispatchEvent(new Event("input"))`
  or `$("segBits").querySelector('[data-v="24"]').click()`). For a drag, set the same state the drag
  handler would set, with values a user can reach, then call the demo's draw. `shared/walk.cjs`
  runs these and is the gate.
- `enter()` on a step resets the demo to the state the step assumes (the exemplar's `set3(...)`
  helper shows the pattern). Use it whenever an earlier step could leave the demo somewhere that
  makes this step's instruction meaningless.
- Every demo's draw function calls its lesson's `check()` at the end: declare `let L1, L2, …;`
  near the top of the main script and add `L1 && L1.check();` as the last line of `draw1()`.
  If a goal needs a number the draw computes, store it on the demo's state object
  (`H5.stats = { … }`) before the check.
- `next` chains to the following stage; the last demo stage points at `tradeoffs`.
- Fix any demo drag helper so releasing the pointer applies the last position: in the `end`
  handler, `if (last) onMove(active, last[0], last[1]);` before clearing.

## Plain words everywhere the reader looks

- Captions under the canvas (`.cap` readouts): full words, units explained the first time, no
  symbols (`E`, `λ`, `w`, `z_buf`) outside the hood.
- Control labels, segmented-button text, checkbox text, tile labels: plain. Keep every `id` and
  every `data-v` value unchanged so the script still works.
- On-canvas labels via `kitLabel`: plain. "the sun's photo", not "shadow map (depth)".
- The "Remember" `.tldr` line: plain, one sentence, under 25 words.
- Keep the copy rules from `shared/BRIEF.md`: no banned words, no exclamation marks, no rhetorical
  questions, at most one em dash on the page.

## Page CSS goes after the theme block

Any page-specific rule goes after the pasted theme, never inside it: `shared/apply-theme.js` replaces
everything from the theme's first comment to its `prefers-reduced-motion` line, so a rule placed in
between is lost the next time the theme is re-applied.

## Keep

Every canvas id, control id, `data-v` value, formula, number, citation, code block and table.
Demo drawing code may change where the lesson needs it (an extra readout, a stored stat, a plainer
label, a small default-state change). Do not add new technical claims.

## Do this, in order

1. Read this file, then `pages/rasterization.html`: the `depth` stage markup (search
   `<section id="depth"`) and the lesson block (search `// ---------- guided steps`). Skim one more
   stage. That is the model.
2. Read your page top to bottom. List its sections, demos, controls and state objects.
3. Rewrite the page. Work section by section. Paste the kit with
   `node shared/apply-kit.js pages/<slug>.html` (safe: it only touches your page).
4. Verify, all four, and fix until all pass:
   ```
   export PLAYWRIGHT=/Users/alrik/Code/redactl-clone/node_modules/playwright
   node shared/walk.cjs pages/<slug>.html        # 0 blocked, errors []
   node shared/stages.cjs pages/<slug>.html      # no OVER at 1440x900; no horizontal overflow at any width
   node shared/shot.js pages/<slug>.html <tmp>/<slug>.png 1100      # errors [], scrollWidth 1100
   node shared/shot.js pages/<slug>.html <tmp>/<slug>-narrow.png 400  # errors [], scrollWidth 400
   ```
   Then `node shared/peek.js pages/<slug>.html <tmp>/s2.png 1440 "section.stage:nth-of-type(2)"` for
   two stages and look at them with the Read tool: the step card must read cleanly beside the
   picture, controls must not be clipped, nothing may overlap.
5. Re-read every step's `say`, `done` and `why` once more as the reader above. Cut what is not needed.

Use a temp folder named after your page under the scratchpad directory for screenshots; other
agents share that directory.

## Report back (your final message, nothing else)

```
slug: <slug>
stages: <id: h2>; <id: h2>; …
steps: <total step count> (<quiz count> quizzes, <do count> do steps)
walk: <"0 blocked" or what is blocked and why>
fit: <stages.cjs result at 1440x900 and 1280x720>
kept-jargon: <any term you could not make plain, or "none">
uncertain: <anything you were unsure of, or "none">
```
