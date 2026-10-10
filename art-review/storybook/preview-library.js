const library = await fetch('./library.json').then(r => { if (!r.ok) throw new Error('Story library unavailable'); return r.json(); });
const reviewStyle=document.createElement('style');reviewStyle.textContent='.order[hidden]{display:none}';document.head.append(reviewStyle);
const selector = document.querySelector('#story-choice');
for (const story of library) { const option = document.createElement('option'); option.value = story.id; option.textContent = story.title; selector.append(option); }
let story = library.find(s => s.id === new URL(location.href).searchParams.get('story')) || library.find(s=>s.id==='little-kindness');
let current = 0;
function show(index) {
  current = Math.max(0, Math.min(story.pages.length - 1, index));
  const p = story.pages[current], image = document.querySelector('#scene-image');
  selector.value = story.id;
  document.querySelector('#story-title').textContent = story.title;
  document.title = `${story.title} · Pay with a story`;
  image.src = p.image; image.alt = p.alt;
  document.querySelector('#chapter').textContent = `${current + 1} / ${story.pages.length}`;
  document.querySelector('#page-number').textContent = `PAGE ${String(current+1).padStart(2,'0')} / ${String(story.pages.length).padStart(2,'0')}`;
  document.querySelector('#beat').textContent = p.beat;
  document.querySelector('#sentence').textContent = p.text;
  document.querySelector('#progress').replaceChildren(...story.pages.map((_,i)=>{const dot=document.createElement('span');dot.className=i<current?'past':i===current?'active':'';return dot;}));
  document.querySelector('#previous').disabled = current === 0;
  document.querySelector('#next').disabled = current === story.pages.length - 1;
  document.querySelector('#score').textContent = String(90+current*360);
  const url = new URL(location.href); url.searchParams.set('story',story.id); url.hash=`page-${current+1}`;
  history.replaceState(null,'',url);
  document.dispatchEvent(new CustomEvent('preview-page',{detail:{story,index:current}}));
}
document.querySelector('#previous').onclick=()=>show(current-1);
document.querySelector('#next').onclick=()=>show(current+1);
selector.onchange=()=>{story=library.find(s=>s.id===selector.value);show(0);};
document.querySelector('#sound').onclick=e=>{const muted=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(muted));e.currentTarget.textContent=muted?'Sound off':'Sound on';};
show((Number(location.hash.split('-').pop())||1)-1);
await import('./little-kindness/storybook-reveal.js');
await import('./preview-kitchen.ts');
show(current);
