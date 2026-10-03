"""Render every food from front and reverse three-quarter views in Blender."""
import bpy, math, os, sys
from mathutils import Vector, Matrix

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
label = args[0] if args else 'after'
legacy = label == 'before'
show_cuts = len(args)>1 and args[1]=='cuts'
focus = args[2] if len(args)>2 else None
pack=args[3] if len(args)>3 else 'starter'
bpy.ops.wm.open_mainfile(filepath=os.path.join(base, f'typeslasher-{pack}.blend' if pack!='starter' else 'typeslasher-foods.blend'))
roots = [o for o in bpy.context.scene.objects if o.name.startswith('food_') and o.parent is None]
for o in bpy.context.scene.objects:
    if o.type not in {'CAMERA','LIGHT'}: o.hide_render = True
for o in list(bpy.context.scene.objects):
    if o.type in {'CAMERA', 'LIGHT'}: bpy.data.objects.remove(o, do_unlink=True)
names = ['apple','banana','carrot','cookie','corn','grape','kiwi','pear']
if pack=='fresh':names=['orange','lime','plum','mango','peach','donut']
if pack=='snacks':names=['egg','pie','muffin','waffle','pretzel','popcorn']
if pack=='big':names=['avocado','broccoli','sandwich','pineapple','strawberry','watermelon']
if pack=='garden':names=['tomato','cucumber','pepper','radish','beet','mushroom','zucchini','onion']
if pack=='market':names=['lemon','raspberry','blueberry','cherry','fig','pomegranate','dragonfruit','apricot']
if pack=='pantry':names=['bread','cheese','bagel','croissant','tofu','potato','pumpkin','celery']
if focus=='all':focus=None
if focus:
    assert focus in names
    names=[focus]
for i, name in enumerate(names):
    source = next(o for o in roots if o.name == 'food_' + name)
    source.hide_render = True
    for child in source.children_recursive: child.hide_render = True
    for row in range(2):
        parent = bpy.data.objects.new(name + '_view', None); bpy.context.collection.objects.link(parent)
        parent.location = ((i % 4 - 1.5) * 3.6, 0, 5.6 - (i // 4 * 2 + row) * 3.4)
        if focus: parent.location=((row-.5)*3.1,0,.9)
        parent.rotation_euler.z = -.22 if row == 0 or show_cuts else math.pi + .55
        sources=[(source,Matrix.Identity(4))]
        if show_cuts and row==1:
            sources=[(next(o for o in roots if o.name==f'food_{name}_{suffix}'),Matrix.Translation((sign*.8,0,0))@Matrix.Rotation(sign*.8,4,'Z')) for sign,suffix in ((-1,'left'),(1,'right'))]
        for model,transform in sources:
            for child in model.children_recursive:
                if child.type not in {'MESH','CURVE'}: continue
                copy = child.copy(); copy.data = child.data.copy(); bpy.context.collection.objects.link(copy)
                copy.parent = parent; copy.hide_render = False; copy.hide_set(False)
                copy.matrix_basis = transform @ (Matrix.Rotation(math.pi/2, 4, 'X') if legacy else Matrix.Identity(4)) @ child.matrix_world
        text = bpy.data.curves.new('Caption','FONT'); text.body = f'{name.upper()}  /  {"WHOLE" if row == 0 else "CUT" if show_cuts else "REVERSE"}'; text.size = .16; text.align_x = 'CENTER'
        obj = bpy.data.objects.new('Caption',text); bpy.context.collection.objects.link(obj)
        obj.location = (parent.location.x, -.05, parent.location.z - 1.55); obj.rotation_euler.x = math.pi/2
        if focus: obj.location.z=parent.location.z-1.95
        mat = bpy.data.materials.get('Caption') or bpy.data.materials.new('Caption'); mat.diffuse_color=(.65,.75,.8,1); text.materials.append(mat)

def light(name, loc, power, size):
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(obj); obj.location=loc; obj.rotation_euler=(Vector((0,0,0))-obj.location).to_track_quat('-Z','Y').to_euler()
light('Key',(-6,-10,12),1900,8); light('Fill',(8,-5,6),950,7); light('Rim',(0,5,8),1700,6)
bpy.ops.object.camera_add(location=(0,-30,1.1)); cam=bpy.context.object; cam.rotation_euler=(Vector((0,0,.7))-cam.location).to_track_quat('-Z','Y').to_euler(); cam.data.type='ORTHO'; cam.data.ortho_scale=15.4
scene=bpy.context.scene; scene.camera=cam; scene.render.engine='CYCLES'; scene.cycles.samples=24; scene.cycles.use_denoising=True
if not scene.world:scene.world=bpy.data.worlds.new('Food review world')
scene.world.color=(.15,.15,.15); scene.render.resolution_x=1500; scene.render.resolution_y=1450; scene.render.resolution_percentage=100
if focus:
    cam.data.ortho_scale=7.0
    scene.render.resolution_x=1400;scene.render.resolution_y=900;scene.cycles.samples=64
scene.view_settings.view_transform='AgX'; scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.path.join(base,'art-review',f'{label}.png'); os.makedirs(os.path.dirname(scene.render.filepath),exist_ok=True)
bpy.ops.render.render(write_still=True)
