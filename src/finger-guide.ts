import { FINGER_ZONES, fingerFor } from './learning';

export function handDiagram() {
  return `<svg class="hand-diagram" viewBox="0 0 270 125" role="img" aria-label="Hands viewed from above: left fingers A S D F, right fingers J K L semicolon; thumbs rest near space">
    ${[0,1].map(side => `<g transform="translate(${side*140},0)">
      <path class="palm" d="M22 61 Q22 51 35 51 H85 Q98 51 98 65 V92 Q95 111 79 111 H45 Q26 108 22 89Z"/>
      ${[0,1,2,3].map(i=> {
        const zone = FINGER_ZONES[side*4+i];
        const heights = side === 0 ? [35,48,55,44] : [44,55,48,35];
        return `<g data-finger="${zone.id}" style="--finger-color:${zone.color}"><rect class="finger" x="${21+i*20}" y="${65-heights[i]}" width="18" height="${heights[i]}" rx="9"/><text x="${30+i*20}" y="52">${zone.home}</text></g>`;
      }).join('')}
      <rect class="palm" x="${side===0?95:5}" y="66" width="22" height="38" rx="11" transform="rotate(${side===0?-28:28} ${side===0?100:20} 86)"/>
      <text class="hand-label" x="60" y="124">${side===0?'LEFT':'RIGHT'}</text>
    </g>`).join('')}
  </svg>`;
}

export function createFingerGuide(container: HTMLElement, keyboard: HTMLElement) {
  container.innerHTML = handDiagram();
  for (const key of keyboard.querySelectorAll<HTMLElement>('[data-key]')) {
    const zone = fingerFor(key.dataset.key!);
    if (zone) { key.style.setProperty('--finger-color',zone.color); key.title = `${key.dataset.key!.toUpperCase()}: ${zone.label}`; }
    if (key.dataset.key === 'f' || key.dataset.key === 'j') key.classList.add('anchor-key');
  }
  return (key = '') => {
    const zone = fingerFor(key);
    container.querySelectorAll<SVGElement>('[data-finger]').forEach(el => el.classList.toggle('active', el.dataset.finger===zone?.id));
  };
}
