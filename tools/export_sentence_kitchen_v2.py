"""Save the editable scene, then export an optimized copy for the game."""
import bpy, json, os
from mathutils import Vector
scene=bpy.context.scene
assert scene.name.startswith('Midnight fruit kitchen - daylight')
base='D:/AI/Kazi WorkOS/Typeslasher/'
# The raised pottery flutes must sit outside the bowl surface.
for obj in scene.objects:
    if obj.name.startswith('bowl flute') and obj.type=='CURVE':
        for p,r in zip(obj.data.splines[0].points,[.775,.857,1.010,1.13]):
            old=(p.co.x*p.co.x+p.co.y*p.co.y)**.5
            p.co.x*=r/old;p.co.y*=r/old

bpy.data.libraries.write(base+'typeslasher-kitchen-v2.blend',{scene})
report={'scene':scene.name,'shelf_depth':1.32,'pendants':[], 'shelf_props':[]}
for obj in scene.objects:
    if 'pendant' in obj.name:report['pendants'].append(obj.name)
    if obj.name.startswith(('stacked dishes','storage jar','jar lid')):
        pts=[obj.matrix_world@Vector(v) for v in obj.bound_box];front=min(v.y for v in pts);back=max(v.y for v in pts)
        assert front>=2.15 and back<=3.47 and back<3.5075
        report['shelf_props'].append({'name':obj.name,'front':front,'back':back,'wall_clearance':3.5075-back})
assert not report['pendants']
with open(base+'art-review/kitchen-v2-clearance.json','w') as file:json.dump(report,file,indent=2)

# Work in a separate export scene; the visible authoring scene retains its objects.
export=bpy.data.scenes.new('Kitchen optimized export')
copies={};original_roots=[scene.objects[n] for n in ['kitchen_environment','service_bowl','chef_knife']]
for original in original_roots:
    for obj in [original]+list(original.children_recursive):
        copy=obj.copy()
        if obj.data:copy.data=obj.data.copy()
        export.collection.objects.link(copy);copies[obj]=copy
for original,copy in copies.items():
    copy.parent=copies.get(original.parent);copy.matrix_parent_inverse=original.matrix_parent_inverse.copy()
bpy.context.window.scene=export
for copy in copies.values():
    if copy.type in ['MESH','CURVE']:
        bpy.ops.object.select_all(action='DESELECT');copy.select_set(True);bpy.context.view_layer.objects.active=copy
        if copy.type=='CURVE':bpy.ops.object.convert(target='MESH')
        else:
            for modifier in list(copy.modifiers):bpy.ops.object.modifier_apply(modifier=modifier.name)
# One object per assembly, with shared materials grouped into primitives by glTF.
for original in original_roots:
    root=copies[original];parts=[o for o in root.children_recursive if o.type=='MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts:obj.select_set(True)
    if parts:
        bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join()
        bpy.context.object.name=original.name+' geometry'
# Names required by the runtime are applied only during export, then restored.
names=[o.name for o in original_roots]
try:
    for original,name in zip(original_roots,names):original.name=name+' authoring';copies[original].name=name
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=base+'public/assets/typeslasher-kitchen.glb',use_selection=True,export_apply=True)
finally:
    for original,name in zip(original_roots,names):copies[original].name=name+' export';original.name=name
    bpy.context.window.scene=scene
print('Saved editable v2 and optimized GLB:',os.path.getsize(base+'public/assets/typeslasher-kitchen.glb'),'bytes')
