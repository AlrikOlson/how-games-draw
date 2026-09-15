# How Games Draw

22 interactive lessons on how games render stuff. Rasterization, shadow maps, global illumination, ray tracing, temporal upscaling, that kind of thing. Each lesson has a handful of demos you can drag around, and it walks you through them one step at a time (look at this, now drag that, what do you think happens if...). The math and shader code are there too, tucked under the hood so they don't get in the way.

Live here: https://moistfridge.com/how-games-draw

I built this because I'm a visual learner and I had a rough picture in my head of how some of these techniques worked and wanted to see if I was right. I'm not a graphics programmer. The lessons and demos were written with GPT-6 Astra and Claude Fable 5.1, I directed and checked, and every demo step gets run by a script before it goes out. If you know this area and something's wrong, open an issue, I'd rather fix it.

Everything is plain HTML and canvas. No framework, no build step to run the pages, nothing loads from a CDN except the two fonts.

## What's in here

```
index.html                  the home page (generated, don't edit directly)
pages/*.html                one lesson per file
art/                        screenshots of each lesson's first demo, used on the home page
shared/theme.css            the stylesheet, pasted into every page
shared/scene-kit.js         little canvas props (trees, houses, a knight) shared by the demos
shared/lesson-kit.js        the step-by-step runtime
shared/shell.js             turns each page into the full-screen dashboard layout at load
shared/index.template.html  home page source
shared/LESSON.md            the brief the lessons were written to
shared/BRIEF.md, REWRITE.md, VISUALS.md   older briefs from earlier passes, kept for reference
UNCERTAIN.md                every number or citation that was written from memory, so someone can check them
```

Lessons open straight from disk, no server needed. The order on the home page (and the prev/next links) comes from `shared/index.template.html`.

## How a lesson works

Each demo is a "stage": picture on the left, step card on the right. Steps are one of three things. A look step just tells you what you're seeing. A do step asks you to drag or change something and unlocks the Continue button when the demo detects you did it. A predict step asks a question first and explains why each answer is right or wrong. `pages/rasterization.html` is the reference if you want to see how one is put together, and `shared/LESSON.md` has the rules.

## Working on it

The theme and the two runtime scripts are pasted into every page (no external scripts, remember), so after editing them you re-paste:

```
node shared/apply-theme.js     re-paste theme.css into every page
node shared/apply-kit.js       re-paste lesson-kit.js and shell.js into every page
node shared/build-index.js     rebuild index.html
```

Put any page-specific CSS *after* the theme block in the page's `<style>`. `apply-theme.js` replaces the whole theme block and will eat anything you put inside it.

There are a couple of checks that need Playwright. Point `PLAYWRIGHT` at a `node_modules/playwright` somewhere on your machine.

```
PLAYWRIGHT=... node shared/walk.cjs pages/culling.html      # can every step actually be completed?
PLAYWRIGHT=... node shared/stages.cjs pages/culling.html    # does every stage fit on screen at a few common sizes?
PLAYWRIGHT=... node shared/shot.js pages/culling.html out.png 1100   # screenshot + console errors
PLAYWRIGHT=... node shared/build-art.cjs                    # regenerate the home page card pictures
```

I run the first two on every page before publishing. They've caught a lot.

## Publishing

`node shared/build-site.js` writes `dist/`. It wraps each page in a full HTML document, rewrites links to absolute paths under `/how-games-draw` (the host serves folders without a trailing slash, so relative links break), adds prev/next navigation and copies the art in. Then it's `fridge dist --slug how-games-draw`, which is my own little publishing tool. If you're hosting it somewhere else, pass `--base /whatever` to build-site and put `dist/` wherever you like.
