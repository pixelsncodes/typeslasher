import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FOOD_IDS, FOOD_CATALOG, FOOD_PACKS, type FoodKind, type PackId } from './food-catalog';

export const FOOD_KINDS = FOOD_IDS;
export type { FoodKind } from './food-catalog';
const models = new Map<string, THREE.Object3D>();
const pending = new Map<PackId,Promise<void>>();

export async function loadFoodAssets(packs:readonly PackId[]=['starter']): Promise<void> {
  await Promise.all(packs.map(pack=>loadPack(pack)));
}
function loadPack(pack:PackId):Promise<void> {
  const existing=pending.get(pack);if(existing)return existing;
  const definition=FOOD_PACKS[pack];
  const promise=new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/${definition.file}?v=${definition.revision}`).then(({ scene }) => {
    const validated=new Map<string,THREE.Object3D>();
    for (const {kind} of FOOD_CATALOG.filter(food=>food.pack===pack)) {
      for (const suffix of ['', '_left', '_right']) {
        const name = `food_${kind}${suffix}`;
        const model = scene.getObjectByName(name);
        // Blender empties are Object3D, not THREE.Group. Validate by name and mesh content.
        if (!model) throw new Error(`Food asset is missing: ${name}`);
        let meshCount = 0;
        model.traverse((node) => {
          if (!(node instanceof THREE.Mesh)) return;
          meshCount++;
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          for (const material of materials) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.vertexColors = /Painted|Golden baked/.test(material.name);
              material.envMapIntensity = .35;
              if (material instanceof THREE.MeshPhysicalMaterial && /translucent grape/.test(material.name)) {
                material.thickness = material.name.includes('flesh') ? .09 : .18;
                material.attenuationColor.setHex(0xe3a2ae);
                material.attenuationDistance = 2;
              }
            }
          }
        });
        if (!meshCount) throw new Error(`Food asset has no mesh: ${name}`);
        validated.set(name, model);
      }
    }
    for(const [name,model] of validated)models.set(name,model);
  }).catch(error => { pending.delete(pack); throw error; });
  pending.set(pack,promise);return promise;
}

export function foodModel(kind: FoodKind, part: '' | '_left' | '_right' = ''): THREE.Group | undefined {
  const source = models.get(`food_${kind}${part}`);
  if (!source) return undefined;
  const group = new THREE.Group();
  group.name = `food_${kind}${part}`;
  group.add(source.clone(true));
  group.userData.assetSource = 'blender';
  return group;
}

// The review room and game use exactly the same lighting and color pipeline.
export function lightFoodScene(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xd6ecff, 0x233248, .45));
  const key = new THREE.DirectionalLight(0xfff0d4, 2); key.position.set(-3, 5, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbadfff, .55); fill.position.set(5, 1, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.8); rim.position.set(2, 3, -4); scene.add(rim);
  return environment;
}
