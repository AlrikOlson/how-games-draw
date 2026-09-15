# How Games Draw

22 interactive lessons on how games render stuff. Rasterization, shadow maps, global illumination, ray tracing, temporal upscaling, that kind of thing. Each lesson has a handful of demos you can drag around and walks you through them one step at a time. The math and shader code are there too, tucked away so they don't get in the way.

https://moistfridge.com/how-games-draw

I'm a visual learner and I had a rough picture in my head of how some of these techniques worked. I wanted to see if I was right. I'm not a graphics programmer. The lessons and demos were written with GPT-6 Astra and Claude Fable 5.1 and I directed and checked. If you know this area and something's wrong, open an issue.

Everything is plain HTML and canvas. No framework, nothing loads from anywhere except the two fonts. The lessons in `pages/` open straight from disk. `UNCERTAIN.md` lists every number or citation that was written from memory or estimated.

To host it yourself, `node shared/build-site.js --base /some/path` writes static files to `dist/`.

Public domain, CC0. Do whatever you want with it.
