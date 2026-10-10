import type { StoryPage } from './story-pages';

/** A sentence-driven color layer over the original grayscale illustration. */
export function createStorybook(host:HTMLElement,reduced:()=>boolean) {
  const base=host.querySelector<HTMLImageElement>('img')!;
  const canvas=host.querySelector<HTMLCanvasElement>('canvas')!;
  const context=canvas.getContext('2d');
  const mask=document.createElement('canvas');mask.width=canvas.width;mask.height=canvas.height;
  const brush=mask.getContext('2d');
  const number=host.querySelector<HTMLElement>('.story-page-number')!;
  const loading=host.querySelector<HTMLElement>('.story-art-status')!;
  let artwork:HTMLImageElement|undefined;
  let generation=0,frame=0,last=0,target=0,shown=0,paused=false,path='';
  let next:HTMLImageElement|undefined;
  function paintMask(progress:number) {
    if(!brush)return;
    brush.clearRect(0,0,mask.width,mask.height);
    const rows=15,columns=34,count=progress*rows*columns;
    for(let i=0;i<Math.ceil(count);i++) {
      const row=Math.floor(i/columns),column=i%columns;
      const x=(row%2?columns-1-column:column)/(columns-1)*mask.width;
      const y=(row+.45)/rows*mask.height+Math.sin(i*1.72)*7;
      const radius=46+Math.sin(i*2.1)*8,opacity=Math.min(1,count-i);
      const bloom=brush.createRadialGradient(x,y,radius*.25,x,y,radius);
      bloom.addColorStop(0,`rgba(255,255,255,${opacity})`);
      bloom.addColorStop(.62,`rgba(255,255,255,${opacity*.92})`);
      bloom.addColorStop(1,'rgba(255,255,255,0)');
      brush.fillStyle=bloom;brush.fillRect(x-radius,y-radius,radius*2,radius*2);
      for(let b=0;b<3;b++) {
        brush.fillStyle=`rgba(255,255,255,${opacity*.16})`;
        brush.beginPath();brush.ellipse(x+Math.sin(i*4.3+b*2)*radius*.75,y+Math.cos(i+b)*22,15,4+b,-.2,0,Math.PI*2);brush.fill();
      }
    }
  }
  function draw() {
    host.dataset.paintProgress=String(Math.round(shown*100));
    if(!context)return;
    context.clearRect(0,0,canvas.width,canvas.height);
    if(!artwork||shown<=0)return;
    context.globalCompositeOperation='source-over';context.drawImage(artwork,0,0,canvas.width,canvas.height);
    if(shown<.999&&brush) {
      paintMask(shown);context.globalCompositeOperation='destination-in';context.drawImage(mask,0,0);context.globalCompositeOperation='source-over';
    }
  }
  function bloom(now:number) {
    if(paused){frame=0;last=0;return;}
    const elapsed=Math.min(50,now-(last||now));last=now;
    shown+=(target-shown)*(1-Math.exp(-elapsed/420));
    if(Math.abs(target-shown)<.002)shown=target;
    draw();
    if(shown!==target)frame=requestAnimationFrame(bloom);else{frame=0;last=0;}
  }
  function setProgress(progress:number) {
    target=Math.max(0,Math.min(1,progress));
    host.dataset.typedProgress=String(Math.round(target*100));
    if(paused)return;
    if(reduced()||!context||!brush){cancelAnimationFrame(frame);frame=0;shown=target;draw();base.style.filter=context&&brush?'grayscale(1)':`grayscale(${1-target})`;}
    else {base.style.filter='grayscale(1)';if(!frame&&shown!==target){last=0;frame=requestAnimationFrame(bloom);}}
  }
  function clear() {
    ++generation;cancelAnimationFrame(frame);frame=0;last=0;target=shown=0;artwork=undefined;path='';next=undefined;
    base.onload=base.onerror=null;base.removeAttribute('src');base.hidden=true;
    loading.textContent='';number.textContent='';draw();
  }
  function show(page:StoryPage,index:number,total:number,following?:StoryPage) {
    if(path===page.image)return;
    clear();path=page.image;const ticket=generation;
    number.textContent=`PAGE ${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    loading.textContent='Opening your story…';base.alt=page.alt;base.style.filter='grayscale(1)';
    base.onload=()=>{if(ticket!==generation)return;artwork=base;base.hidden=false;loading.textContent='';draw();};
    base.onerror=()=>{if(ticket!==generation)return;loading.textContent='Picture unavailable · keep telling the story.';};
    base.src=`${import.meta.env.BASE_URL}assets/${page.image}`;
    if(following){next=new Image();next.src=`${import.meta.env.BASE_URL}assets/${following.image}`;}
  }
  function setPaused(value:boolean) {
    paused=value;
    if(value){cancelAnimationFrame(frame);frame=0;last=0;}else setProgress(target);
  }
  return {show,setProgress,setPaused,clear};
}
