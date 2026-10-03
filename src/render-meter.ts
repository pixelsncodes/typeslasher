// Opt-in development display; excluded from the production build.
export function createRenderMeter() {
  const output=document.createElement('output');output.id='render-meter';
  output.style.cssText='position:fixed;left:8px;bottom:4px;z-index:100;color:#fff;background:#000d;padding:8px;font:12px monospace;pointer-events:none';
  document.body.append(output);
  let frames=0;let start=performance.now();let total=0;let calls=0;let triangles=0;let geometries=0;
  return {
    record(ms:number,renderCalls:number,renderTriangles:number,memoryGeometries:number){frames++;total+=ms;calls=renderCalls;triangles=renderTriangles;geometries=memoryGeometries;},
    tick(now:number){if(now-start<1000)return;output.textContent=`${Math.round(frames*1000/(now-start))} rendered fps · ${(frames?total/frames:0).toFixed(2)} ms CPU/render · ${calls} draws · ${triangles} triangles · ${geometries} geometries`;frames=0;total=0;start=now;},
  };
}
