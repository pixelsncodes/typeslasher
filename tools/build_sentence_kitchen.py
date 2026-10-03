"""Run through Blender MCP. Creates an isolated scene; preserves existing scenes.
Coordinates: counter top z=0, board top z=.18. glTF converts Z up to Y up.
"""
import bpy, math, random
from mathutils import Vector
random.seed(14)
scene=bpy.data.scenes.new('Midnight fruit kitchen')
bpy.context.window.scene=scene
def material(name, color, rough=.5, metal=0):
    m=bpy.data.materials.new('Kitchen '+name); m.diffuse_color=(*color,1); m.use_nodes=True
    n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    n.inputs['Base Color'].default_value=(*color,1)
    n.inputs['Roughness'].default_value=rough; n.inputs['Metallic'].default_value=metal
    return m
cream=material('warm stone',(.66,.56,.43),.65)
plum=material('plum tile',(.12,.055,.085),.32)
grout=material('grout',(.21,.13,.15),.8)
mint=material('sage ceramic',(.30,.48,.34),.25)
mint_dark=material('cabinet',(.16,.25,.21),.6)
ivory=material('ivory glaze',(.78,.71,.55),.23)
brass=material('brushed brass',(.54,.32,.10),.28,.7)
steel=material('steel',(.67,.74,.78),.23,.85)
edge=material('honed edge',(.88,.91,.92),.16,.85)
handle=material('walnut handle',(.075,.034,.025),.4)
oak=[material('oak '+str(i),(.29+i*.021,.135+i*.011,.054+i*.006),.57) for i in range(7)]
def root(name):
    o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);return o
env=root('kitchen_environment')
def cube(name,loc,size,mat,bevel=.04,parent=env):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name
    o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(mat);o.parent=parent
    if bevel:
        b=o.modifiers.new('soft handcrafted corners','BEVEL');b.width=bevel;b.segments=3
        o.modifiers.new('weighted surface normals','WEIGHTED_NORMAL')
    return o
def lathe(name,profile,mat,parent=env,loc=(0,0,0),segments=64):
    verts=[];faces=[]
    for radius,z in profile:
        for i in range(segments):
            a=2*math.pi*i/segments;verts.append((radius*math.cos(a),radius*math.sin(a),z))
    for j in range(len(profile)-1):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments
            faces.append((a,b,b+segments,a+segments))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.location=loc;o.parent=parent;o.data.materials.append(mat)
    for p in mesh.polygons:p.use_smooth=True
    return o
cube('stone counter',(0,0,-.18),(14,3.5,.36),cream,.10)
cube('cabinet carcass',(0,.15,-.71),(13.7,3.1,.85),mint_dark,.05)
for i in range(7):
    x=-5.88+i*1.96
    cube('framed drawer',(x,-1.43,-.57),(1.87,.10,.48),mint,.035)
    cube('inset drawer panel',(x,-1.50,-.58),(1.61,.045,.29),mint_dark,.015)
    cube('brass pull',(x,-1.57,-.50),(.40,.10,.055),brass,.025)
cube('back wall',(0,1.65,1.05),(14,.18,2.2),grout,.01)
for row in range(4):
    for col in range(25):cube('glazed plum tile',(-6.72+col*.56,1.535,.25+row*.54),(.542,.055,.522),plum,.018)
cube('oak shelf',(0,1.20,1.65),(7.2,.65,.12),oak[3],.035)
for x in [-2.8,2.8]:cube('shelf bracket',(x,1.39,1.40),(.08,.30,.47),brass,.02)
for x in [-1.9,-.75]:
    for n in range(3):lathe('stacked dishes',[(0,0),(.40,.015),(.53,.08),(.52,.11),(.40,.05),(0,.04)],ivory,loc=(x,1.13,1.73+n*.08),segments=40)
for x,mat in [(1.1,ivory),(1.85,mint)]:
    lathe('storage jar',[(0,0),(.23,0),(.27,.06),(.27,.42),(.23,.47),(0,.47)],mat,loc=(x,1.18,1.71),segments=40)
    lathe('jar lid',[(0,0),(.29,0),(.29,.045),(0,.06)],brass,loc=(x,1.18,2.18),segments=40)
# Two shallow pendant domes, framing the work area.
for x in [-4.55,4.55]:
    lathe('pendant shade',[(.05,.43),(.20,.39),(.40,.26),(.55,0),(.52,-.03),(.38,.22),(.17,.35),(.05,.38)],ivory,loc=(x,.85,1.68),segments=48)
    cube('pendant cable',(x,.85,2.42),(.025,.025,.65),brass,.005)
    lathe('warm lamp underside',[(0,0),(.47,0),(.47,.025),(0,.025)],ivory,loc=(x,.85,1.67),segments=40)
# Central end-grain chopping board and inset juice groove.
cube('board rounded base',(-.65,-.40,.085),(4.1,2.04,.17),oak[3],.10)
for i in range(12):
    for j in range(6):
        cube('end grain block',(-2.50+i*.337,-1.235+j*.337,.174),(.329,.329,.015),random.choice(oak),.007)
# Tray walls surround fruit; no unrelated food in the scene.
cube('fruit tray base',(-4.75,-.30,.06),(2.8,1.8,.12),oak[2],.07)
for y in [-1.17,.57]:cube('tray long lip',(-4.75,y,.18),(2.8,.085,.25),oak[5],.035)
for x in [-6.11,-3.39]:cube('tray short lip',(x,-.30,.18),(.085,1.7,.25),oak[5],.035)
# Thick open vessel, with real inner surface. Origin is its resting point.
bowl=root('service_bowl')
lathe('mixing bowl',[(0,0),(.56,0),(.63,.06),(.76,.16),(.93,.39),(1.10,.71),(1.17,.89),(1.17,.95),(1.10,.98),(1.06,.90),(.98,.69),(.83,.41),(.66,.22),(.49,.16),(0,.16)],mint,bowl,segments=72)
lathe('cream bowl rim',[(1.10,.93),(1.16,.93),(1.18,.95),(1.16,.98),(1.10,.98),(1.08,.95),(1.10,.93)],ivory,bowl,segments=72)
bowl.location=(3.9,-.25,.01)
# Proper knife: narrow X thickness, length along Y, cutting edge at local Z=0.
knife=root('chef_knife')
outline=[(-.98,.08),(-.88,.26),(-.62,.37),(.65,.38),(.65,.045),(-.55,0)]
verts=[(x,y,z) for x in [-.025,.025] for y,z in outline];n=len(outline)
faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
mesh=bpy.data.meshes.new('chef blade mesh');mesh.from_pydata(verts,[],faces);mesh.update()
o=bpy.data.objects.new('chef blade',mesh);scene.collection.objects.link(o);o.parent=knife;o.data.materials.append(steel)
b=o.modifiers.new('beveled steel','BEVEL');b.width=.012;b.segments=2;o.modifiers.new('blade normals','WEIGHTED_NORMAL')
cube('honed cutting edge',(0,-.03,.018),(.018,1.27,.026),edge,.008,knife)
cube('knife bolster',(0,.69,.23),(.10,.15,.33),brass,.025,knife)
cube('walnut knife handle',(0,1.05,.26),(.17,.66,.25),handle,.075,knife)
for y in [.87,1.12]:cube('handle rivet',(.087,y,.27),(.015,.065,.065),brass,.025,knife)
knife.location=(-.65,-.40,1.3)
# Reference camera and studio lighting are kept in the editable file, not GLB.
bpy.ops.object.camera_add(location=(0,-12,8));cam=bpy.context.object;cam.name='Kitchen review camera'
cam.rotation_euler=(Vector((0,0,.50))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=14.7;scene.camera=cam
for name,loc,power,size,color in [('large warm key',(-4,-4,7),1300,6,(1,.83,.65)),('soft fill',(5,-1,5),850,5,(.74,.86,1))]:
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((0,0,0))-obj.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Kitchen studio');scene.world.use_nodes=True
next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND').inputs[0].default_value=(.14,.10,.15,1)
scene.render.resolution_x=1600;scene.render.resolution_y=540;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.filepath='D:/AI/Kazi WorkOS/Typeslasher/art-review/kitchen-blender.png'
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_perspective='CAMERA'
print('Created',scene.name,'with',len(scene.objects),'objects; original Scene preserved.')
