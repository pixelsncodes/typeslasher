"""Pack modeling references into saved source files and frame their first model."""
from pathlib import Path
import bpy, math, json
from mathutils import Euler, Vector
BASE=Path(__file__).resolve().parent.parent
saved=[]
for pack,reference,first in [('market','fruit','lemon'),('pantry','pantry','bread'),('garden','salad','tomato')]:
    path=BASE/f'typeslasher-{pack}.blend';bpy.ops.wm.open_mainfile(filepath=str(path))
    for filename in [reference+'-whole-and-cut.png']+(['celery-whole-and-cut.png'] if pack=='pantry' else []):
        im=bpy.data.images.load(str(BASE/'design/food-expansion'/filename),check_existing=True);im.use_fake_user=True;im.pack()
    bpy.context.scene['reference_folder']='design/food-expansion'
    bpy.context.scene['food_count']=8;bpy.context.scene['cut_piece_count']=16
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                space=area.spaces.active
                if 'MATERIAL' in space.shading.bl_rna.properties['type'].enum_items.keys():space.shading.type='MATERIAL'
                space.region_3d.view_location=Vector((0,0,.18));space.region_3d.view_distance=4.2
                space.region_3d.view_rotation=Euler((math.pi/2-.12,0,.23)).to_quaternion()
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(path));saved.append({'pack':pack,'bytes':path.stat().st_size})
print(json.dumps(saved))
