import { Box3, Vector3, type Object3D } from 'three';
import type { FoodKind } from './food-catalog';
import { FOOD_SIZE } from './food-proportions.ts';

/** Derive from the WHOLE food once, then reuse for both complementary halves. */
export function foodFrame(whole:Object3D,kind:FoodKind,grounded=false,multiplier=1) {
  const bounds=new Box3().setFromObject(whole),size=bounds.getSize(new Vector3());
  const center=bounds.getCenter(new Vector3());
  if(grounded)center.y=bounds.min.y;
  return {scale:FOOD_SIZE[kind]*multiplier/Math.max(size.x,size.y,size.z),center};
}

export function applyFoodFrame(model:Object3D,frame:ReturnType<typeof foodFrame>) {
  model.scale.setScalar(frame.scale);
  model.position.copy(frame.center).multiplyScalar(-frame.scale);
}
