import * as THREE from 'three';
import type { RecipeId } from './kitchen-recipes';

export type DishStyle = { name:string; kind:'bowl'|'plate'; color:string; trim:string; radius:number; height:number; depth:number; foodY:number; spread:number; scalloped?:boolean; handles?:boolean; wood?:boolean };
export const SERVING_DISHES: Record<RecipeId,DishStyle> = {
  fruit:{name:'Mint mixing bowl',kind:'bowl',color:'#9fcab7',trim:'#e8eed8',radius:1.20,height:1.00,depth:1,foodY:.36,spread:.48},
  citrus:{name:'Coral scalloped bowl',kind:'bowl',color:'#eaa28a',trim:'#fff0d0',radius:1.23,height:.86,depth:1,foodY:.33,spread:.52,scalloped:true},
  orchard:{name:'Honey wooden bowl',kind:'bowl',color:'#b9814e',trim:'#e3b984',radius:1.25,height:.80,depth:1,foodY:.30,spread:.53,wood:true},
  salad:{name:'Wide garden bowl',kind:'bowl',color:'#f0e6d3',trim:'#719b76',radius:1.35,height:.66,depth:1,foodY:.27,spread:.58},
  vegetables:{name:'Terracotta roast platter',kind:'plate',color:'#cf8d6d',trim:'#f6d6a5',radius:1.45,height:.22,depth:.74,foodY:.19,spread:.67},
  berries:{name:'Lilac dessert bowl',kind:'bowl',color:'#bba5d4',trim:'#efe1f2',radius:1.15,height:.78,depth:1,foodY:.29,spread:.47,scalloped:true},
  tofu:{name:'Blue noodle bowl',kind:'bowl',color:'#91b7c7',trim:'#e6ede5',radius:1.21,height:.95,depth:1,foodY:.34,spread:.48},
  soup:{name:'Golden soup bowl',kind:'bowl',color:'#e6b762',trim:'#fff1d1',radius:1.10,height:.88,depth:1,foodY:.32,spread:.43,handles:true},
  picnic:{name:'Mint-rim picnic plate',kind:'plate',color:'#eee5ce',trim:'#79ae97',radius:1.45,height:.20,depth:.80,foodY:.18,spread:.66},
  breakfast:{name:'Scalloped bakery plate',kind:'plate',color:'#f5e4cd',trim:'#d99c87',radius:1.38,height:.22,depth:1,foodY:.19,spread:.65,scalloped:true},
};

function scallop(geometry:THREE.BufferGeometry,radius:number){
  const position=geometry.getAttribute('position');
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),z=position.getZ(i),r=Math.hypot(x,z);
    const strength=THREE.MathUtils.clamp((r/radius-.70)/.30,0,1);
    const factor=1+.032*Math.cos(Math.atan2(z,x)*10)*strength;
    position.setX(i,x*factor);position.setZ(i,z*factor);
  }
  geometry.computeVertexNormals();
}

export function createServingDish(recipe:RecipeId):THREE.Group {
  const style=SERVING_DISHES[recipe],group=new THREE.Group();group.name=`serving_${recipe}`;
  const {radius:r,height:h}=style;
  // A closed profile includes the underside, outer wall, lip, inner wall and floor.
  const profile=style.kind==='bowl'
    ?[[0,.02],[r*.40,.02],[r*.45,.06],[r*.50,h*.16],[r*.65,h*.28],[r*.85,h*.58],[r,h*.95],[r,h],[r-.06,h+.008],[r-.09,h*.96],[r*.77,h*.58],[r*.57,h*.30],[r*.34,.15],[0,.15]]
    :[[0,.025],[r*.60,.025],[r*.82,.05],[r*.96,h*.56],[r,h*.86],[r,h],[r-.06,h+.006],[r*.86,h*.83],[r*.72,.14],[0,.14]];
  const geometry=new THREE.LatheGeometry(profile.map(([x,y])=>new THREE.Vector2(x,y)),96);
  if(style.scalloped)scallop(geometry,r);
  const material=new THREE.MeshStandardMaterial({color:style.color,roughness:style.wood?.82:.43,metalness:0});
  if(style.wood){
    const width=128,height=128,data=new Uint8Array(width*height*4);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const theta=x/(width-1)*Math.PI*2;
      const grain=Math.sin(theta*19+y*.27+Math.sin(theta*7+y*.11)*1.8);
      const value=Math.round(238-31*Math.pow(Math.max(0,grain),8));
      const offset=(y*width+x)*4;data[offset]=value;data[offset+1]=value;data[offset+2]=value;data[offset+3]=255;
    }
    material.map=new THREE.DataTexture(data,width,height);material.map.needsUpdate=true;
  }
  const body=new THREE.Mesh(geometry,material);body.name='dish_body';group.add(body);
  const rimGeometry=new THREE.TorusGeometry(r-.035,.025,8,96);rimGeometry.rotateX(Math.PI/2);rimGeometry.translate(0,h+.012,0);
  if(style.scalloped)scallop(rimGeometry,r);
  const trim=new THREE.MeshStandardMaterial({color:style.trim,roughness:style.wood?.82:.42});
  const rim=new THREE.Mesh(rimGeometry,trim);rim.name='dish_rim';group.add(rim);
  const foot=new THREE.Mesh(new THREE.TorusGeometry(r*(style.kind==='bowl'?.41:.60),.028,8,64),material);foot.rotation.x=Math.PI/2;foot.position.y=.033;foot.name='dish_foot';group.add(foot);
  if(style.handles)for(const direction of [-1,1]){
    const handle=new THREE.Mesh(new THREE.TorusGeometry(.24,.075,12,36),material);
    handle.position.set(direction*(r+.11),h*.66,0);handle.scale.y=.73;handle.name=`soup_handle_${direction}`;group.add(handle);
  }
  if(style.wood)for(const [fraction,y] of [[.63,.27],[.81,.43],[.93,.64]]){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r*fraction,.009,6,64),new THREE.MeshStandardMaterial({color:'#9f693f',roughness:.9}));
    ring.rotation.x=Math.PI/2;ring.position.y=y;group.add(ring);
  }
  group.scale.z=style.depth;
  group.traverse(node=>{if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true;}});
  return group;
}

export function servingSlot(recipe:RecipeId,slot:number):THREE.Vector3 {
  const style=SERVING_DISHES[recipe],angle=slot*2.4;
  return new THREE.Vector3(Math.cos(angle)*style.spread,style.foodY+Math.floor(slot/4)*(style.kind==='plate'?.035:.08),Math.sin(angle)*style.spread*style.depth);
}
