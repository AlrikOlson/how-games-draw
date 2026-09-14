// Rendering Library lesson kit. Paste this whole block into a page's <script> after the scene kit.
// A lesson is a short run of steps beside one demo. Each step says one thing and asks for one of:
//   look    { say }                         read it, press Continue
//   do      { say, goal, todo, done }       goal() is checked on every redraw; Continue unlocks when it is true
//   predict { say, quiz: { q, options: [{ t, ok, why }] }, goal?, todo?, done? }
//           answer first (wrong answers explain and let you retry), then the optional goal
// Elements inside the lesson panel with data-step-min="k" stay hidden until step k (1-based).
// Progress is remembered per page and section in localStorage.
function lesson(id, spec) {
  const root = document.querySelector('[data-lesson="' + id + '"]');
  const steps = spec.steps, n = steps.length;
  const key = 'rl:' + (location.pathname.split('/').pop() || 'page') + ':' + id;
  let i = 0, met = steps.map(() => false), answered = steps.map(() => false), finished = false;
  try { const s = JSON.parse(localStorage.getItem(key) || 'null'); if (s && s.n === n) { i = s.i; met = s.met; answered = s.answered; finished = !!s.finished; } } catch (e) {}
  const save = () => { try { localStorage.setItem(key, JSON.stringify({ n, i, met, answered, finished })); } catch (e) {} };
  root.insertAdjacentHTML('afterbegin',
    '<ol class="steps" aria-label="Steps"></ol><div class="step"><div class="stepn"></div><div class="say"></div><div class="quiz"></div><div class="status"></div>' +
    '<div class="nav"><button type="button" class="next">Continue</button><button type="button" class="restart">start over</button></div></div>');
  const dots = root.querySelector('.steps'), stepn = root.querySelector('.stepn'), say = root.querySelector('.say'), quiz = root.querySelector('.quiz'), status = root.querySelector('.status'), next = root.querySelector('.next'), restart = root.querySelector('.restart');
  for (let k = 0; k < n; k++) { const li = document.createElement('li'); li.setAttribute('role', 'button'); li.tabIndex = 0; li.title = 'step ' + (k + 1); li.addEventListener('click', () => go(k)); li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(k); } }); dots.appendChild(li); }
  next.addEventListener('click', () => { if (i < n - 1) go(i + 1); else { finished = true; save(); render(); } });
  restart.addEventListener('click', () => { met = steps.map(() => false); answered = steps.map(() => false); finished = false; go(0); });
  function go(k) { i = Math.max(0, Math.min(n - 1, k)); finished = false; if (steps[i].enter) steps[i].enter(); save(); render(); check(); }
  function reveal() { root.querySelectorAll('[data-step-min]').forEach(el => { el.hidden = (i + 1) < +el.dataset.stepMin; }); }
  function render() {
    const s = steps[i];
    [...dots.children].forEach((li, k) => { li.className = k < i || (k === i && finished) ? 'done' : k === i ? 'cur' : ''; li.setAttribute('aria-current', k === i ? 'step' : 'false'); });
    stepn.textContent = 'step ' + (i + 1) + ' of ' + n;
    say.innerHTML = s.say;
    quiz.innerHTML = '';
    if (s.quiz) {
      const q = document.createElement('div'); q.className = 'q'; q.textContent = s.quiz.q; quiz.appendChild(q);
      const why = document.createElement('div'); why.className = 'why';
      s.quiz.options.forEach((o, k) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = o.t;
        if (answered[i]) { b.disabled = true; if (o.ok) b.className = 'ok'; }
        b.addEventListener('click', () => {
          quiz.querySelectorAll('button').forEach(x => x.classList.remove('no'));
          if (o.ok) { answered[i] = true; b.className = 'ok'; quiz.querySelectorAll('button').forEach(x => x.disabled = true); why.innerHTML = '<b>Right.</b> ' + o.why; save(); render(); }
          else { b.className = 'no'; why.innerHTML = '<b>Not quite.</b> ' + o.why + ' Try another answer.'; }
          quiz.appendChild(why);
        });
        quiz.appendChild(b);
      });
      if (answered[i]) { why.innerHTML = '<b>Right.</b> ' + s.quiz.options.find(o => o.ok).why; quiz.appendChild(why); }
    }
    const gate = s.quiz && !answered[i];
    if (s.goal && !gate) status.innerHTML = met[i] ? '<span class="ok">✓</span> ' + (s.done || 'Done.') : '<span class="todo">→ ' + (s.todo || 'do it on the canvas') + '</span>';
    else if (finished && i === n - 1) status.innerHTML = '<span class="ok">✓</span> Section done.' + (spec.next ? ' <a href="#' + spec.next.id + '">Next: ' + spec.next.title + ' ↓</a>' : '');
    else status.innerHTML = '';
    next.disabled = gate || (s.goal && !met[i]) || (finished && i === n - 1);
    next.textContent = i < n - 1 ? 'Continue' : 'Finish';
    restart.hidden = i === 0 && !finished;
    reveal();
    if (spec.onStep) spec.onStep(i, s);
  }
  function check() { const s = steps[i]; if (s.goal && !met[i] && s.goal()) { met[i] = true; save(); render(); } }
  render(); reveal();
  return { check, go, get step() { return i; } };
}
