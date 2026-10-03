"""Refine the active daylight kitchen, keeping the original revision intact."""
import bpy, math, random
from mathutils import Vector, noise
scene=bpy.context.scene
assert scene.name.startswith('Midnight fruit kitchen - daylight')
random.seed(73)
# Finer grain: variation comes from pores and irregular fibers, not broad waves.
for name,kind,base in [('oak-grain','wood',(.43,.26,.13)),('end-grain','end',(.48,.285,.135))]:
    img=bpy.data.images['Kitchen '+name];size=256;pixels=[]
    for y in range(size):
        for x in range(size):
            u=x/size;v=y/size
            n=noise.noise_vector(Vector((u*12,v*22,8))).x
            if kind=='wood':
                fiber=math.sin(u*690+2.1*noise.noise_vector(Vector((u*4,v*5,2))).x)
                f=.93+.045*fiber+.075*n+random.uniform(-.025,.025)
            else:
                r=math.sqrt((u-.11)**2*1.3+(v-.62)**2)
                f=.94+.055*math.sin(r*235+n*3)+.09*n+random.uniform(-.025,.025)
            pixels.extend([min(1,max(0,c*f)) for c in base]+[1])
    img.pixels.foreach_set(pixels);img.save();img.pack()
# Each board block samples a different patch of end grain.
for obj in scene.objects:
    if obj.name.startswith('end grain block') and obj.data.uv_layers:
        a=random.choice([0,math.pi/2,math.pi,3*math.pi/2]);dx=random.random();dy=random.random()
        for uv in obj.data.uv_layers.active.data:
            u,v=uv.uv;uv.uv=(u*math.cos(a)-v*math.sin(a)+dx,u*math.sin(a)+v*math.cos(a)+dy)

# Replace angular leaf cards with curved, tapered leaf surfaces and fine central veins.
leaves=[o for o in scene.objects if o.type=='MESH' and ' leaf' in o.name and any(s in o.name for s in ['left herb','right trailing herb','shelf trailing herb'])]
for obj in leaves:
    old=obj.data;start=old.vertices[0].co.copy();tip=old.vertices[2].co.copy();direction=tip-start
    side=(old.vertices[1].co-old.vertices[3].co)*.5
    verts=[];faces=[];segments=10
    for j in range(segments+1):
        t=j/segments;width=math.sin(math.pi*t)**.75
        for k in [-1,0,1]:
            point=start+direction*t+side*width*k
            point.z+=.035*math.sin(math.pi*t)*(1-abs(k))-.020*math.sin(math.pi*t)*abs(k)
            verts.append(tuple(point))
    for j in range(segments):
        for k in range(2):
            a=j*3+k;faces.append((a,a+1,a+4,a+3))
    mesh=bpy.data.meshes.new('Curved herb leaf');mesh.from_pydata(verts,[],faces);mesh.update()
    for mat in old.materials:mesh.materials.append(mat)
    for face in mesh.polygons:face.use_smooth=True
    obj.data=mesh
    # A paired leaf creates the fuller herb foliage visible in the reference.
    duplicate=obj.copy();duplicate.data=mesh.copy();scene.collection.objects.link(duplicate)
    pivot=(start+tip)*.5
    for vertex in duplicate.data.vertices:
        v=vertex.co-pivot;vertex.co=pivot+Vector((-v.y*.88,v.x*.88,v.z+.035))

# Actual fruit halves lie inside the review bowl, with their cut surfaces facing the viewer.
review=bpy.data.collections['Review fruit - game supplies these dynamically']
halves=[o for o in review.objects if o.type=='EMPTY' and '_left' in o.name]
for i,obj in enumerate(halves):
    obj.rotation_euler=(.3,-.45+i*.2,-.8+i*1.5)
    obj.scale*=.78
    obj.location=(3.9+math.cos(i*2.4)*.31,-.25+math.sin(i*2.4)*.28,.46+(i%2)*.06)

# Lighting: broad off-camera window with gentle sky fill and a directional sun.
for obj in scene.objects:
    if obj.type=='LIGHT':
        if obj.name.startswith('window daylight'):
            obj.location=(-5.8,-3.5,7);obj.data.energy=1150;obj.data.size=4.0;obj.data.color=(1,.95,.87)
        else:obj.data.energy=100;obj.data.color=(.82,.90,1)
        obj.rotation_euler=(Vector((0,1,0))-obj.location).to_track_quat('-Z','Y').to_euler()
sun_data=bpy.data.lights.new('soft morning sunlight','SUN');sun_data.energy=1.3;sun_data.angle=.09;sun_data.color=(1,.94,.82)
sun=bpy.data.objects.new('soft morning sunlight',sun_data);scene.collection.objects.link(sun)
sun.rotation_euler=Vector((.8,.35,-1.3)).to_track_quat('-Z','Y').to_euler()
background=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND')
background.inputs['Color'].default_value=(.42,.52,.68,1);background.inputs['Strength'].default_value=.3
scene.camera.location=(0,-13.8,8.4)
scene.camera.rotation_euler=(Vector((0,1.05,.92))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
scene.camera.data.ortho_scale=15.15
scene.render.resolution_x=1600;scene.render.resolution_y=800
try:scene.render.engine='CYCLES'
except TypeError:pass
if scene.render.engine=='CYCLES':
    scene.cycles.samples=40;scene.cycles.use_denoising=True
scene.render.filepath='D:/AI/Kazi WorkOS/Typeslasher/art-review/kitchen-daylight-v2.png'
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.overlay.show_overlays=False
        area.spaces.active.region_3d.view_perspective='CAMERA'
        area.spaces.active.region_3d.view_camera_zoom=16
print('Refined materials, curved herbs, composition and daylight.')
