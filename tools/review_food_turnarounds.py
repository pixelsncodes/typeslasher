"""Render seven views of every exported food: front, left, back, right, top,
bottom and both cut faces. Reads the actual GLB so reviews include export issues.
Usage: blender --background --python tools/review_food_turnarounds.py -- PACK LABEL
"""
from pathlib import Path
import bpy, math, sys, json
from mathutils import Vector, Matrix
BASE=Path(__file__).resolve().parent.parent
args=sys.argv[sys.argv.index('--')+1:]
pack,label=args[:2]
filename='typeslasher-food-pack.glb' if pack=='starter' else f'typeslasher-{pack}-pack.glb'
source=BASE/'public/assets'/filename
if len(args)>2:source=Path(args[2])/filename
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(source))
scene=bpy.context.scene
roots=[o for o in scene.objects if o.name.startswith('food_') and o.parent is None and not o.name.endswith(('_left','_right'))]
roots.sort(key=lambda o:o.name)
for o in scene.objects:o.hide_render=True
columns=['FRONT','LEFT','BACK','RIGHT','TOP','BOTTOM','CUT']
def text(body,x,z,size=.14):
    data=bpy.data.curves.new('Review caption','FONT');data.body=body;data.align_x='CENTER';data.size=size
    obj=bpy.data.objects.new(body,data);scene.collection.objects.link(obj);obj.location=(x,-.15,z);obj.rotation_euler.x=math.pi/2
    data.materials.append(ink)
ink=bpy.data.materials.new('Review plum ink');ink.diffuse_color=(.24,.17,.24,1);ink.use_nodes=True
p=next(n for n in ink.node_tree.nodes if n.type=='BSDF_PRINCIPLED');p.inputs['Base Color'].default_value=(.24,.17,.24,1)
rotations=[Matrix.Identity(4),Matrix.Rotation(-math.pi/2,4,'Z'),Matrix.Rotation(math.pi,4,'Z'),Matrix.Rotation(math.pi/2,4,'Z'),Matrix.Rotation(math.pi/2,4,'X'),Matrix.Rotation(-math.pi/2,4,'X'),Matrix.Identity(4)]
for row,root in enumerate(roots):
    points=[o.matrix_world@Vector(v) for o in root.children_recursive if o.type=='MESH' for v in o.bound_box]
    lo=Vector(tuple(min(p[i] for p in points) for i in range(3)));hi=Vector(tuple(max(p[i] for p in points) for i in range(3)))
    size=max(hi-lo);middle=(hi+lo)/2
    for col,rotation in enumerate(rotations):
        x=(col-3)*2.6;z=(len(roots)-1-row)*2.55
        transform=Matrix.Translation((x,0,z))@rotation@Matrix.Scale(1.75/size,4)@Matrix.Translation(-middle)
        sources=[(root,Matrix.Identity(4))]
        if col==6:
            sources=[(bpy.data.objects[root.name+'_'+suffix],Matrix.Translation((sign*.60,0,0))@Matrix.Rotation(sign*.85,4,'Z')) for sign,suffix in [(-1,'left'),(1,'right')]]
            transform=Matrix.Translation((x,0,z))@Matrix.Scale(1.2/size,4)@Matrix.Translation(-middle)
        for original,offset in sources:
            for child in original.children_recursive:
                if child.type!='MESH':continue
                copy=child.copy();scene.collection.objects.link(copy);copy.parent=None;copy.matrix_world=transform@offset@child.matrix_world;copy.hide_render=False;copy.hide_set(False)
        text(root.name[5:] if col==0 else columns[col],x,z-1.08,.15 if col==0 else .105)
for col,name in enumerate(columns):text(name,(col-3)*2.6,len(roots)*2.55-1.1,.18)
center=Vector((0,0,(len(roots)-1)*2.55/2+.18))
def area(name,pos,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=pos;obj.rotation_euler=(center-obj.location).to_track_quat('-Z','Y').to_euler()
area('Large softbox',(-7,-12,center.z+10),2300,10);area('Soft fill',(9,-8,center.z+1),1300,10);area('Rim',(2,4,center.z+6),1700,8)
bpy.ops.object.camera_add(location=(0,-32,center.z));cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=max(19.0,len(roots)*2.55+1.5)
scene.camera=cam
try:scene.render.engine='CYCLES'
except TypeError:pass
scene.cycles.samples=12;scene.cycles.use_denoising=True
scene.render.resolution_x=1750;scene.render.resolution_y=round(1750*(len(roots)*2.55+1)/19);scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Warm cream studio');scene.world.use_nodes=True
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Color'].default_value=(.75,.70,.62,1);bg.inputs['Strength'].default_value=.55
scene.render.film_transparent=False
scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='AgX'
out=BASE/'art-review/food-polish';out.mkdir(parents=True,exist_ok=True)
scene.render.filepath=str(out/f'{label}-{pack}.png');bpy.ops.render.render(write_still=True)
print(json.dumps({'sheet':scene.render.filepath,'foods':len(roots),'views':7}))
