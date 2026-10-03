"""Small transparent food compositions for the isolated UI prototype."""
import bpy, math, sys
from pathlib import Path
from mathutils import Vector
BASE=Path(__file__).resolve().parent.parent
OUT=BASE/'design/ui-v2/trays';OUT.mkdir(parents=True,exist_ok=True)
groups={'starter':('starter',['apple','banana','kiwi']), 'fresh':('fresh',['orange','donut','lime']), 'snacks':('snacks',['popcorn','pretzel','muffin']), 'big':('big',['watermelon','pineapple','strawberry']), 'mixed':('starter',['grape','cookie','pear'])}
groups.update({'garden':('garden',['tomato','pepper','radish']),'market':('market',['lemon','fig','dragonfruit']),'pantry':('pantry',['bagel','pumpkin','cheese'])})
if '--expansion' in sys.argv:groups={k:v for k,v in groups.items() if k in ('garden','market','pantry')}
for name,pack,foods,sliced in [(name,pack,foods,sliced) for name,(pack,foods) in groups.items() for sliced in (False,True)]:
    bpy.ops.wm.open_mainfile(filepath=str(BASE/('typeslasher-foods.blend' if pack=='starter' else f'typeslasher-{pack}.blend')))
    for o in bpy.context.scene.objects:o.hide_render=True
    for i,food in enumerate(foods):
        for suffix,sign in ([('_left',-1),('_right',1)] if sliced else [('',0)]):
            r=bpy.data.objects['food_'+food+suffix];r.hide_render=False
            for child in r.children_recursive:child.hide_render=False
            r.location=((i-1)*1.35+sign*.32,0 if i==1 else .12,0 if i==1 else -.14)
            r.scale=((.60 if sliced else .78),)*3;r.rotation_euler.z=sign*.85 if sliced else (-.18, .08, .24)[i]
    for loc,power,size in [((-4,-6,7),850,5),((4,-3,4),400,5),((1,4,6),950,4)]:
        d=bpy.data.lights.new('Menu light','AREA');d.energy=power;d.shape='DISK';d.size=size
        o=bpy.data.objects.new('Menu light',d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.2))-o.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add(location=(0,-12,3));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.25))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.4
    s=bpy.context.scene;s.camera=cam;s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=True
    if not s.world:s.world=bpy.data.worlds.new('Menu world')
    s.world.color=(.2,.2,.2)
    s.render.resolution_x=384;s.render.resolution_y=240;s.render.resolution_percentage=100;s.render.film_transparent=True
    s.view_settings.view_transform='AgX';s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.filepath=str(OUT/f'{name}{"-cut" if sliced else ""}.png')
    bpy.ops.render.render(write_still=True)
