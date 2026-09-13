# Rewrite pass: plain language, progressive, scannable

You are rewriting the PROSE of one existing page in `D:/Code/render-lib/pages/`. The demos,
controls, math blocks, code blocks and tables stay. The words around them change completely.

Read `D:/Code/render-lib/shared/BRIEF.md` first for the file rules and the copy rules (banned
words, no exclamation marks, at most one em dash per page). Those still apply. This file adds
the voice and the structure.

## Who you are writing for

Someone smart who plays games and knows a GPU draws the picture, but has never written a
shader and does not know what a frustum, a texel, a BRDF or a G-buffer is. They should be
able to read the page top to bottom and follow every step. They should also be able to skim
it in two minutes and still leave with the idea.

Write the way a working graphics programmer would explain it to a friend across a table,
pointing at the demo. Talk to the reader as "you". Contractions are fine.

## The three rules

1. **Plain first, precise second.** Every section opens with the idea in everyday words.
   Only after that do the real terms, the math and the code appear. A reader who stops after
   the first paragraph still has the idea.
2. **Define every term in the sentence where it first appears.** Not in a glossary
   somewhere else, not by assuming. Example: "the frustum, which is just the wedge of space
   the camera can see". After that first definition, use the term freely.
3. **Short units.** Paragraphs are 1–3 sentences. Sentences average under 20 words. One
   idea per paragraph. Sections have headings the reader can scan. No wall of text anywhere.

## What "ADHD-friendly" means here, concretely

- The payoff comes first. Say what the thing does for the reader before saying how it works.
- Bold the 2–4 key phrases in each plain paragraph so a skimmer gets the point from the bold alone.
- Every demo gets a short "Try this" list: 2–3 concrete actions and what to watch for.
- Every section ends with one sentence to remember.
- Use one everyday comparison per section when it helps (a bouncer checking IDs, a library
  card catalogue, a photocopier at 50%). State it, use it, drop it. Do not stretch it.
- Numbers get a "so what": "24 bits, which is about 16 million steps, and most of them land in
  the first metre".
- No teasing, no suspense, no rhetorical questions. Say the thing.

## Structure of each demo section (inside `.prose`, in this order)

```html
<p class="plain">2–4 sentences in everyday words. <b>Bold the key phrases.</b></p>

<h3>What you're seeing</h3>
<p>What the picture shows and what each colour means, in 1–2 short paragraphs.</p>

<h3>Try this</h3>
<ul class="try">
  <li>Drag the camera to the left. The red boxes are the ones that just got skipped.</li>
  <li>Push the slider to 5,000. The brute-force number climbs; the tree number barely moves.</li>
</ul>

<!-- existing .controls and .tiles markup stays here, unchanged -->

<h3>The real version</h3>
<p>The precise explanation, with each term defined the first time it appears.</p>
<p class="words">In words: reject the object if it is entirely on the wrong side of any one plane.</p>
<div class="math">…existing math block, unchanged…</div>
<p>One short paragraph naming what each symbol in the math is.</p>
<p class="words">What this code does: walks the six planes and bails on the first one that fails.</p>
<pre class="code">…existing code block; you may make the comments plainer…</pre>

<p class="tldr">The one sentence to remember from this section.</p>
```

The `.h2` heading of each section may be reworded to plainer language. Keep it under 8 words.
The `.sub` line under it becomes one plain sentence saying what the demo lets you do.

## Header

- `.eyebrow`: keep (a concrete fact about the demo scene).
- `<h1>`: keep.
- `.lead`: rewrite as three or four sentences. Sentence one says what the thing is, as if to
  a friend. Sentence two says why the reader should care (what it fixes, what it costs).
  Sentence three or four gives the one thing people get wrong, in plain words.
- `.key` legend: keep, but make the labels plain.
- Add after the legend a "Words on this page" box with 4–8 terms, one short line each:

```html
<dl class="terms">
  <dt>frustum</dt><dd>the wedge of space the camera can see</dd>
  <dt>bounding box</dt><dd>the smallest box that fits around an object; cheap to test</dd>
</dl>
```

## Tradeoffs and "Where it shows up" sections

- Add one plain paragraph before each table saying how to read it and what the reader is
  choosing between.
- Rewrite header cells and cell text in plain words. Keep every number and every citation
  exactly as it is. Do not add new facts. Do not remove "estimate" labels.
- The closing `.note` (the naming trap) becomes two or three plain sentences.

## Hard constraints

- Do not change any `id`, any canvas, any control, any JavaScript, any formula, any number,
  any citation. If a control's visible label is jargon, you may rewrite the label text only.
- Do not add new technical claims. If a sentence in the old prose was a fact, keep the fact.
  You may drop a fact that is not needed for understanding.
- Keep the copy rules from BRIEF.md: no banned words, no exclamation marks, no rhetorical
  questions, at most one em dash on the whole page, no "It's not just X, it's Y".
- Paste the block marked `/* Rewrite additions */` from `D:/Code/render-lib/shared/theme.css`
  into the page's `<style>` after the existing theme rules (it defines `.plain`, `.try`,
  `.words`, `.tldr`, `.terms`). Do not paste it twice.
- The page must still pass the same verification: `errors` is `[]` and `scrollWidth` is
  1100 / 400 in both screenshots. Look at both PNGs and fix anything visibly broken.

## Report back (your final message, nothing else)

```
slug: <slug>
title: <the <title> text>
h2s: <section heading 1>; <section heading 2>; …
kept-jargon: <any term you could not make plain and why, or "none">
```
