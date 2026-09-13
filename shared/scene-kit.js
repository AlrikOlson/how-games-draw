// Rendering Library scene kit. Paste this whole block at the top of a page's <script> (no external
// scripts are allowed). Small, flat, readable game-world props for 2D canvas demos. Every function
// takes a ctx and draws in the current transform; sizes are in canvas pixels. Keep the mechanism
// overlay (frustum lines, rays, samples, tests) in the library palette on top of these props.
const KIT = {
  // scene palette: props only; the mechanism overlay keeps amber / blue / white / green / red
  grass: '#1f3a2a', grassLite: '#2a4d37', dirt: '#3b2f25', stone: '#4c5563', stoneLite: '#6b7585',
  wood: '#7a4f2a', woodLite: '#a06a38', leaf: '#3f8f4a', leafLite: '#5ab562', roof: '#a5433a',
  wallCol: '#c9c2b2', window: '#f5d67a', skin: '#e8b98a', shirt: '#4aa3ff', pants: '#2f3a55',
  metal: '#8d95a3', flame: '#f2a341', sky: '#0b0e13', skyLite: '#141a26', water: '#1d4d73', cloud: '#c7cdd8',
  shadow: 'rgba(0,0,0,0.35)'
};
// horizon band: dark sky above, ground below (side-view scenes)
function kitGround(ctx, w, h, horizon) {
  const g = ctx.createLinearGradient(0, 0, 0, horizon); g.addColorStop(0, KIT.sky); g.addColorStop(1, KIT.skyLite);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, horizon);
  ctx.fillStyle = KIT.grass; ctx.fillRect(0, horizon, w, h - horizon);
  ctx.fillStyle = KIT.grassLite; ctx.fillRect(0, horizon, w, 3);
}
// top-down ground with faint tile grid (top-down scenes)
function kitTopGround(ctx, w, h, cell) {
  ctx.fillStyle = KIT.grass; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 0; x <= w; x += cell) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
  for (let y = 0; y <= h; y += cell) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
  ctx.stroke();
}
// round tree, base at (x, y), s = trunk height
function kitTree(ctx, x, y, s, tint) {
  ctx.fillStyle = KIT.shadow; ctx.beginPath(); ctx.ellipse(x, y, s * 0.55, s * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = KIT.wood; ctx.fillRect(x - s * 0.09, y - s, s * 0.18, s);
  ctx.fillStyle = tint || KIT.leaf; ctx.beginPath(); ctx.arc(x, y - s * 1.25, s * 0.62, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = KIT.leafLite; ctx.beginPath(); ctx.arc(x - s * 0.2, y - s * 1.45, s * 0.3, 0, Math.PI * 2); ctx.fill();
}
// pine tree, base at (x, y)
function kitPine(ctx, x, y, s) {
  ctx.fillStyle = KIT.wood; ctx.fillRect(x - s * 0.07, y - s * 0.4, s * 0.14, s * 0.4);
  ctx.fillStyle = KIT.leaf;
  for (let i = 0; i < 3; i++) { const yy = y - s * 0.35 - i * s * 0.42, ww = s * (0.7 - i * 0.16);
    ctx.beginPath(); ctx.moveTo(x - ww, yy); ctx.lineTo(x + ww, yy); ctx.lineTo(x, yy - s * 0.55); ctx.closePath(); ctx.fill(); }
}
// house, bottom-left corner at (x, y), width w, wall height h
function kitHouse(ctx, x, y, w, h, roofCol) {
  ctx.fillStyle = KIT.wallCol; ctx.fillRect(x, y - h, w, h);
  ctx.fillStyle = roofCol || KIT.roof; ctx.beginPath(); ctx.moveTo(x - w * 0.08, y - h); ctx.lineTo(x + w * 1.08, y - h); ctx.lineTo(x + w / 2, y - h - w * 0.45); ctx.closePath(); ctx.fill();
  ctx.fillStyle = KIT.window; ctx.fillRect(x + w * 0.15, y - h * 0.75, w * 0.22, h * 0.3);
  ctx.fillStyle = KIT.wood; ctx.fillRect(x + w * 0.6, y - h * 0.6, w * 0.22, h * 0.6);
}
// wooden crate, centre (x, y), size s
function kitCrate(ctx, x, y, s) {
  ctx.fillStyle = KIT.wood; ctx.fillRect(x - s / 2, y - s / 2, s, s);
  ctx.strokeStyle = KIT.woodLite; ctx.lineWidth = Math.max(1, s * 0.08);
  ctx.strokeRect(x - s / 2 + 1, y - s / 2 + 1, s - 2, s - 2);
  ctx.beginPath(); ctx.moveTo(x - s / 2, y - s / 2); ctx.lineTo(x + s / 2, y + s / 2); ctx.moveTo(x + s / 2, y - s / 2); ctx.lineTo(x - s / 2, y + s / 2); ctx.stroke();
}
// stone wall segment from (x1, y1) to (x2, y2), thickness t (top-down or side)
function kitWall(ctx, x1, y1, x2, y2, t) {
  ctx.strokeStyle = KIT.stone; ctx.lineWidth = t; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = KIT.stoneLite; ctx.lineWidth = Math.max(1, t * 0.25); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
// little player figure, feet at (x, y), height h, facing +1 right / -1 left
function kitPlayer(ctx, x, y, h, facing) {
  const f = facing || 1;
  ctx.fillStyle = KIT.shadow; ctx.beginPath(); ctx.ellipse(x, y, h * 0.28, h * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = KIT.pants; ctx.fillRect(x - h * 0.16, y - h * 0.42, h * 0.32, h * 0.42);
  ctx.fillStyle = KIT.shirt; ctx.fillRect(x - h * 0.2, y - h * 0.78, h * 0.4, h * 0.38);
  ctx.fillStyle = KIT.skin; ctx.beginPath(); ctx.arc(x, y - h * 0.9, h * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#171a1f'; ctx.fillRect(x + f * h * 0.04, y - h * 0.93, h * 0.05, h * 0.04);
}
// top-down player: a circle with a facing wedge, centre (x, y), radius r, angle a (radians)
function kitPlayerTop(ctx, x, y, r, a) {
  ctx.fillStyle = KIT.shirt; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = KIT.skin; ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6); ctx.stroke();
}
// lamp post / torch, base at (x, y), height h; glow radius g (0 = none)
function kitLamp(ctx, x, y, h, g) {
  if (g > 0) { const gr = ctx.createRadialGradient(x, y - h, 0, x, y - h, g); gr.addColorStop(0, 'rgba(242,163,65,0.35)'); gr.addColorStop(1, 'rgba(242,163,65,0)'); ctx.fillStyle = gr; ctx.fillRect(x - g, y - h - g, g * 2, g * 2); }
  ctx.fillStyle = KIT.metal; ctx.fillRect(x - h * 0.04, y - h, h * 0.08, h);
  ctx.fillStyle = KIT.flame; ctx.beginPath(); ctx.arc(x, y - h, h * 0.12, 0, Math.PI * 2); ctx.fill();
}
// simple side-view car, bottom-left at (x, y), length L
function kitCar(ctx, x, y, L, col) {
  ctx.fillStyle = col || '#d8493f'; ctx.fillRect(x, y - L * 0.22, L, L * 0.2);
  ctx.fillRect(x + L * 0.22, y - L * 0.4, L * 0.5, L * 0.2);
  ctx.fillStyle = KIT.window; ctx.fillRect(x + L * 0.26, y - L * 0.38, L * 0.42, L * 0.14);
  ctx.fillStyle = '#171a1f'; ctx.beginPath(); ctx.arc(x + L * 0.22, y, L * 0.09, 0, Math.PI * 2); ctx.arc(x + L * 0.78, y, L * 0.09, 0, Math.PI * 2); ctx.fill();
}
// cloud, centre (x, y), width w
function kitCloud(ctx, x, y, w, alpha) {
  ctx.fillStyle = 'rgba(199,205,216,' + (alpha == null ? 0.35 : alpha) + ')';
  ctx.beginPath(); ctx.arc(x - w * 0.3, y, w * 0.2, 0, Math.PI * 2); ctx.arc(x, y - w * 0.08, w * 0.28, 0, Math.PI * 2); ctx.arc(x + w * 0.3, y, w * 0.2, 0, Math.PI * 2); ctx.fill();
}
// plain-word label on the canvas with a dark pill behind it; anchor 'left' | 'center' | 'right'
function kitLabel(ctx, text, x, y, anchor, col) {
  ctx.font = '12px "IBM Plex Mono", Menlo, Consolas, monospace';
  const w = ctx.measureText(text).width + 12, h = 18;
  const x0 = anchor === 'center' ? x - w / 2 : anchor === 'right' ? x - w : x;
  ctx.fillStyle = 'rgba(11,14,19,0.82)'; ctx.fillRect(x0, y - h / 2, w, h);
  ctx.fillStyle = col || '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x0 + 6, y + 1);
}
// arrow from (x1, y1) to (x2, y2) in a colour, for callouts
function kitArrow(ctx, x1, y1, x2, y2, col, width) {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 7;
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = width || 1.5;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)); ctx.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
}
// "what the player sees" inset frame: draws a titled box at (x, y, w, h); draw the picture inside afterwards
function kitInset(ctx, x, y, w, h, title) {
  ctx.fillStyle = 'rgba(11,14,19,0.92)'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  if (title) kitLabel(ctx, title, x + 6, y + 12, 'left', '#c7cdd8');
}
