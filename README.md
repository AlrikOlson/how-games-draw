# Rendering Library

Twenty-two interactive pages on how a game draws its picture, one idea per page, each with
live canvas demos you can drag. Plain HTML, no framework, no external scripts.

Published at https://moistfridge.com/rendering-library

## Layout

```
index.html                 the hub (generated, do not edit by hand)
pages/<slug>.html          one page per idea; a fragment: <title>, fonts, <style>, then the body
shared/theme.css           the shared stylesheet, pasted into every page and the hub
shared/scene-kit.js        the shared canvas props, pasted into every page's <script>
shared/index.template.html the hub source
shared/BRIEF.md            the page spec: structure, palette, demo quality bar, copy rules
shared/REWRITE.md          the plain-language prose structure every section follows
shared/VISUALS.md          the rules for the game-scene demos
UNCERTAIN.md               every claim written from memory or estimated, collected for a fact-check
```

Hub order, and the previous / next order on the site, is the order of entries in
`shared/index.template.html`.

## Working on it

Pages open directly from disk. Edit `pages/<slug>.html`; keep the theme block at the top of
its `<style>` verbatim and put page rules after it.

```
node shared/build-index.js     rebuild index.html from the template and the pages' section headings
node shared/apply-theme.js     after editing shared/theme.css: re-paste it into every page, rebuild jump lists
node shared/build-site.js      build dist/ for publishing (see below)
```

Screenshots for checking a page need Playwright somewhere on disk:

```
PLAYWRIGHT=/path/to/node_modules/playwright node shared/shot.js pages/x.html out.png 1100
PLAYWRIGHT=... node shared/peek.js pages/x.html out.png 1600 "section:nth-of-type(2)"
PLAYWRIGHT=... node shared/peek.js pages/x.html - 400 overflow     # list elements wider than 400 px
```

`shot.js` prints page errors and the scroll width; a page is fine when errors are `[]` and the
scroll width equals the viewport at 1100 and 400.

## Publishing

`shared/build-site.js` writes `dist/`: the hub plus every page wrapped as a full HTML document,
with links rewritten to absolute paths under the site's address and previous / next navigation
added at the foot of every page. The absolute paths matter: moistfridge serves a folder at
`/slug` with no trailing slash, so a relative link resolves against the site root and breaks.

```
node shared/build-site.js --base /rendering-library
fridge dist --slug rendering-library
node ~/.claude/skills/moistfridge/scripts/verify-page.mjs https://moistfridge.com/rendering-library
```

Republishing keeps the address, the view count and the revision history.
