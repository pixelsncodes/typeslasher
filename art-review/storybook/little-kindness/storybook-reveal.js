// Isolated visual prototype. No changes to production typing or cooking logic.
const base = document.querySelector('#scene-image');
const canvas = document.querySelector('#story-paint');
const context = canvas.getContext('2d');
const mask = document.createElement('canvas');
mask.width = canvas.width; mask.height = canvas.height;
const brush = mask.getContext('2d');
const input = document.querySelector('#story-typing');
const reading = document.querySelector('.reading');
const sentence = document.querySelector('#sentence');
const hint = document.querySelector('.hint');
const status = document.querySelector('#painting-status');
const demoButton = document.querySelector('#watch-reveal');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let text = '', typed = 0, target = 0, shown = 0, frame = 0, last = 0;
let artwork, generation = 0, demoFrame = 0;

// Overlapping, uneven daubs form a gently ragged, watercolor-like brush edge.
// Positions are deterministic, so replaying a page follows the same strokes.
function paintMask(progress) {
  brush.clearRect(0, 0, mask.width, mask.height);
  if (progress <= 0) return;
  if (progress >= .999) { brush.fillStyle = '#fff'; brush.fillRect(0, 0, mask.width, mask.height); return; }
  const rows = 15, columns = 34, steps = rows * columns;
  const count = progress * steps;
  for (let i = 0; i < Math.ceil(count); i++) {
    const row = Math.floor(i / columns), column = i % columns;
    const fraction = row % 2 ? columns - 1 - column : column;
    const x = fraction / (columns - 1) * mask.width;
    const y = (row + .45) / rows * mask.height + Math.sin(i * 1.72) * 7;
    const radius = 46 + Math.sin(i * 2.1) * 8;
    const opacity = Math.min(1, count - i);
    const bloom = brush.createRadialGradient(x, y, radius * .25, x, y, radius);
    bloom.addColorStop(0, `rgba(255,255,255,${opacity})`);
    bloom.addColorStop(.62, `rgba(255,255,255,${opacity * .92})`);
    bloom.addColorStop(1, 'rgba(255,255,255,0)');
    brush.fillStyle = bloom; brush.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    for (let bristle = 0; bristle < 3; bristle++) {
      const offset = Math.sin(i * 4.3 + bristle * 2) * radius * .75;
      brush.fillStyle = `rgba(255,255,255,${opacity * .16})`;
      brush.beginPath(); brush.ellipse(x + offset, y + Math.cos(i + bristle) * 22, 15, 4 + bristle, -.2, 0, Math.PI * 2); brush.fill();
    }
  }
}
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!artwork || shown <= 0) return;
  context.globalCompositeOperation = 'source-over';
  context.drawImage(artwork, 0, 0, canvas.width, canvas.height);
  if (shown < .999) {
    paintMask(shown);
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0);
    context.globalCompositeOperation = 'source-over';
  }
}
function bloom(now) {
  const elapsed = Math.min(50, now - (last || now)); last = now;
  shown += (target - shown) * (1 - Math.exp(-elapsed / 420));
  if (Math.abs(target - shown) < .002) shown = target;
  draw();
  if (shown !== target) frame = requestAnimationFrame(bloom);
  else { frame = 0; last = 0; }
}
function reveal(progress) {
  target = Math.max(0, Math.min(1, progress));
  if (reduced.matches) { cancelAnimationFrame(frame); frame = 0; shown = target; draw(); }
  else if (!frame && shown !== target) { last = 0; frame = requestAnimationFrame(bloom); }
}
function renderText() {
  const done = document.createElement('span'); done.className = 'done'; done.textContent = text.slice(0, typed);
  const cursor = document.createElement('span'); cursor.className = 'cursor'; cursor.textContent = text[typed] || '';
  sentence.replaceChildren(done, cursor, document.createTextNode(text.slice(typed + 1)));
  status.textContent = typed === 0 ? 'A blank page, waiting for your words.' : typed === text.length ? 'Your story brought this page to life.' : `Color blooming · ${Math.round(typed / text.length * 100)}%`;
  hint.innerHTML = typed === text.length ? 'Picture complete. Your dish would be ready.<br>Use Next scene to preview the next page.' : 'Click the sentence and start typing.<br>Every word adds a little color.';
}
function stopDemo() { cancelAnimationFrame(demoFrame); demoFrame = 0; demoButton.textContent = 'Watch color bloom'; }
function reset() {
  stopDemo(); cancelAnimationFrame(frame); frame = 0; last = 0;
  typed = 0; target = 0; shown = 0; input.value = ''; reading.classList.remove('typing-error');
  draw(); renderText();
}
function loadPage() {
  text = sentence.textContent; reset(); artwork = undefined;
  const ticket = ++generation;
  const image = new Image();
  image.onload = () => { if (ticket === generation) { artwork = image; draw(); } };
  image.src = base.src;
}
reading.addEventListener('click', () => input.focus({ preventScroll: true }));
input.addEventListener('input', () => {
  stopDemo(); let correct = 0;
  while (correct < input.value.length && correct < text.length && input.value[correct] === text[correct]) correct++;
  reading.classList.toggle('typing-error', correct < input.value.length);
  typed = correct; input.value = text.slice(0, typed);
  renderText(); reveal(typed / text.length);
});
demoButton.addEventListener('click', () => {
  if (demoFrame) { stopDemo(); return; }
  reset(); demoButton.textContent = 'Pause color bloom';
  const started = performance.now();
  const play = now => {
    typed = Math.min(text.length, Math.floor((now - started) / 8000 * text.length));
    input.value = text.slice(0, typed); renderText(); reveal(typed / text.length);
    if (typed < text.length) demoFrame = requestAnimationFrame(play); else stopDemo();
  };
  demoFrame = requestAnimationFrame(play);
});
document.querySelector('#reset-reveal').addEventListener('click', reset);
document.addEventListener('preview-page', loadPage);
reduced.addEventListener('change', () => reveal(target));
document.addEventListener('visibilitychange', () => { if (document.hidden) stopDemo(); });
window.addEventListener('pagehide', () => { stopDemo(); cancelAnimationFrame(frame); });
loadPage();
