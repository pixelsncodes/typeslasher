import { Group, type Object3D } from 'three';
import type { FoodKind } from './food-catalog';
import { KITCHEN_FOOD_SCALE } from './food-proportions.ts';
import { applyFoodFrame, foodFrame } from './food-sizing.ts';

/** Food is authored for upright display. Lay it on its back for kitchen prep.
 * Rotating around X preserves the X cut plane, and grounding against the posed
 * whole food gives both halves the same origin throughout the cut animation. */
export function restingFoodModel(food:Object3D,whole:Object3D,kind:FoodKind):Group {
  const reference=new Group();reference.add(whole);reference.rotation.x=-Math.PI/2;
  const posed=new Group();posed.add(food);posed.rotation.x=-Math.PI/2;
  applyFoodFrame(posed,foodFrame(reference,kind,true,KITCHEN_FOOD_SCALE));
  const group=new Group();group.add(posed);return group;
}
