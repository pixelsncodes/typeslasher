import * as THREE from 'three';

// Reused geometry keeps each successful word free of new GPU allocations.
export function createSliceEffects(scene: THREE.Scene) {
  const group = new THREE.Group(); scene.add(group); group.visible = false;
  const segments = 40;
  function ribbon(width: number, color: number, opacity: number) {
    const vertices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = (t - .5) * 4.7;
      const x = .36 * Math.sin(t * Math.PI) - .18;
      const w = width * Math.pow(Math.sin(t * Math.PI), .7);
      vertices.push(x - w, y, 0, x + w, y, 0);
    }
    const indices: number[] = [];
    for (let i = 0; i < segments; i++) { const n = i * 2; indices.push(n,n+1,n+2,n+1,n+3,n+2); }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,depthTest:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false});
    const mesh = new THREE.Mesh(geometry,material); mesh.renderOrder=10; group.add(mesh);
    return {geometry,material,opacity};
  }
  const glow = ribbon(.19,0x78eeff,.45);
  const core = ribbon(.046,0xffffff,1);
  const sparks = Array.from({length:12},(_,i)=> {
    const material = new THREE.MeshBasicMaterial({color:0xffdc78,transparent:true,depthWrite:false,depthTest:false,toneMapped:false});
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(.045),material); mesh.renderOrder=11; group.add(mesh);
    const a=i*Math.PI*2/12;
    return {mesh,material,velocity:new THREE.Vector3(Math.cos(a)*(2+i%3),Math.sin(a)*(2+i%3),0)};
  });
  let age = 1;
  return {
    trigger(position: THREE.Vector3, color: number) {
      age=0; group.position.copy(position); group.position.z+=1.8; group.visible=true;
      for (const trail of [glow,core]) { trail.geometry.setDrawRange(0,0); trail.material.opacity=trail.opacity; }
      for (const spark of sparks) { spark.mesh.position.set(0,0,0); spark.material.color.setHex(color).lerp(new THREE.Color(0xffffff),.45); spark.material.opacity=1; }
    },
    update(delta: number) {
      if (!group.visible) return;
      age+=delta;
      if (age>.48) {group.visible=false; return;}
      const end=Math.min(segments,Math.ceil(age/.11*segments));
      const start=Math.min(end,Math.floor(Math.max(0,age-.12)/.25*segments));
      for (const trail of [glow,core]) {trail.geometry.setDrawRange(start*6,(end-start)*6); trail.material.opacity=trail.opacity*Math.max(0,1-age/.48);}
      for (const spark of sparks) { spark.mesh.position.addScaledVector(spark.velocity,delta); spark.mesh.position.y-=age*delta*3; spark.material.opacity=Math.max(0,1-age/.4); spark.mesh.scale.setScalar(1+age); }
    },
    clear() {group.visible=false;},
  };
}
