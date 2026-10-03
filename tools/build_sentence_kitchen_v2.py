"""Run through Blender MCP. Creates an isolated scene; preserves existing scenes.
Coordinates: counter top z=0, board top z=.18. glTF converts Z up to Y up.
"""
import bpy, math, random
from mathutils import Vector
random.seed(14)
# Preserve the first revision as a separate scene while rebuilding editable objects.
for name in ['kitchen_environment','service_bowl','chef_knife']:
    previous=bpy.data.objects.get(name)
    if previous and previous.name in bpy.data.scenes.get('Midnight fruit kitchen', bpy.context.scene).objects:previous.name='v1_'+name
scene=bpy.data.scenes.new('Midnight fruit kitchen - daylight')
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
cube('back wall',(0,3.65,1.72),(14,.18,3.5),grout,.01)
for row in range(6):
    for col in range(25):cube('glazed plum tile',(-6.72+col*.56,3.535,.35+row*.54),(.542,.055,.522),plum,.018)
cube('oak shelf',(0,2.81,2.08),(7.6,1.32,.16),oak[3],.045)
for x in [-2.8,2.8]:cube('shelf bracket',(x,3.10,1.80),(.10,.65,.49),brass,.02)
for x in [-1.50,-.25]:
    for n in range(3):lathe('stacked dishes',[(0,0),(.40,.015),(.53,.08),(.52,.11),(.40,.05),(0,.04)],ivory,loc=(x,2.79,2.17+n*.085),segments=40)
for x,mat in [(1.25,ivory),(2.12,mint)]:
    lathe('storage jar',[(0,0),(.23,0),(.27,.06),(.27,.42),(.23,.47),(0,.47)],mat,loc=(x,2.85,2.17),segments=40)
    lathe('jar lid',[(0,0),(.29,0),(.29,.045),(0,.06)],brass,loc=(x,2.85,2.64),segments=40)
# No pendant lights: illumination comes from an off-camera daylight source.
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
knife.location=(.30,-.65,.24)
knife.rotation_euler=(0,math.pi/2,-.6)

# Materials with packed image textures remain visible in both Blender and glTF.
import os
from mathutils import noise
asset_dir='D:/AI/Kazi WorkOS/Typeslasher/design/kitchen-v2/textures'
os.makedirs(asset_dir,exist_ok=True)
def texture(name,base,kind):
    size=256;image=bpy.data.images.new('Kitchen '+name,width=size,height=size);pixels=[]
    for y in range(size):
        v=y/size
        for x in range(size):
            u=x/size;n=noise.noise_vector(Vector((u*13,v*13,4))).x
            if kind=='wood':
                wave=math.sin(u*220+5*math.sin(v*9)+n*3)
                f=.86+.12*wave+.07*n
            elif kind=='end':
                r=math.sqrt((u-.32)**2+(v-.71)**2)
                f=.91+.09*math.sin(r*180+n*2)+n*.07
            elif kind=='linen':
                f=.88+.06*math.sin(u*math.pi*128)+.06*math.sin(v*math.pi*128)+n*.025
            else:f=.95+n*.085
            pixels.extend([min(1,max(0,c*f)) for c in base]+[1])
    image.pixels.foreach_set(pixels);image.filepath_raw=asset_dir+'/'+name+'.png';image.file_format='PNG';image.save();image.pack();return image
wood_tex=texture('oak-grain',(.43,.245,.105),'wood')
end_tex=texture('end-grain',(.49,.283,.132),'end')
stone_tex=texture('limestone',(.71,.65,.54),'stone')
linen_tex=texture('linen',(.69,.62,.49),'linen')
def apply_texture(mat,img):
    nodes=mat.node_tree.nodes;shader=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
    tex=nodes.new('ShaderNodeTexImage');tex.image=img;mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
apply_texture(cream,stone_tex)
for m in oak:apply_texture(m,wood_tex)
end_oak=material('end grain textured',(.49,.28,.13),.56);apply_texture(end_oak,end_tex)
for o in scene.objects:
    if o.name.startswith('end grain block'):o.data.materials.clear();o.data.materials.append(end_oak)
cloth=material('natural linen',(.69,.62,.49),.88);apply_texture(cloth,linen_tex)
stripe=material('plum woven stripe',(.21,.065,.095),.86)
leaf_mats=[material('leaf '+str(i),(.10+i*.028,.22+i*.035,.038+i*.007),.56) for i in range(4)]
soil=material('potting soil',(.038,.022,.011),.99)

def path(name,points,radius,mat,parent=env):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=12
    spline=curve.splines.new('POLY');spline.points.add(len(points)-1)
    for p,co in zip(spline.points,points):p.co=(*co,1)
    curve.bevel_depth=radius;curve.bevel_resolution=3
    obj=bpy.data.objects.new(name,curve);scene.collection.objects.link(obj);obj.parent=parent;curve.materials.append(mat);return obj

# Back counter: a genuine open sink cutout, not a basin passing through solid stone.
cube('back counter left',(-2.17,2.57,.34),(9.66,1.8,.32),cream,.065)
cube('back counter right',(6.08,2.57,.34),(1.84,1.8,.32),cream,.065)
cube('sink rear rim',(3.90,3.34,.34),(2.45,.26,.32),cream,.05)
cube('sink front rim',(3.90,1.80,.34),(2.45,.26,.32),cream,.05)
cube('sink basin floor',(3.9,2.57,-.04),(2.34,1.4,.12),ivory,.10)
for x in [2.72,5.08]:cube('sink side wall',(x,2.57,.17),(.13,1.40,.46),ivory,.055)
for y in [1.92,3.22]:cube('sink end wall',(3.9,y,.17),(2.4,.12,.46),ivory,.055)
lathe('sink drain',[(0,0),(.12,0),(.12,.012),(0,.012)],steel,loc=(3.9,2.55,.025),segments=32)
# Reference-style rear base cabinets provide the missing depth behind the island.
cube('rear cabinet carcass',(0,2.65,-.30),(13.8,1.63,1.15),mint_dark,.04)
# Hide carcass under the sink floor; its top is below the bowl, preserving the cavity.
scene.objects.get('rear cabinet carcass').location.z=-.64
for x in [-5.88,-3.92,-1.96,0,1.96,3.92,5.88]:
    cube('rear drawer frame',(x,1.79,.07),(1.85,.09,.38),mint,.025)
    cube('rear drawer inset',(x,1.735,.06),(1.59,.04,.20),mint_dark,.015)
    cube('rear brass pull',(x,1.66,.09),(.33,.10,.06),brass,.025)

# Curved brass gooseneck faucet and separate lever.
tap=[(3.90,3.29,.50),(3.90,3.29,1.32)]
for i in range(17):
    a=math.pi*i/16
    tap.append((3.90,3.02+.27*math.cos(a),1.32+.27*math.sin(a)))
tap.extend([(3.90,2.75,1.23)])
path('brass gooseneck faucet',tap,.052,brass)
lathe('faucet mounting foot',[(0,0),(.14,0),(.14,.035),(.07,.08),(0,.08)],brass,loc=(3.9,3.29,.50),segments=32)
path('tap lever',[(4.20,3.28,.50),(4.20,3.28,.70),(4.20,3.12,.77)],.028,brass)
# Soap pump next to the sink.
lathe('soap bottle',[(0,0),(.13,0),(.17,.05),(.17,.42),(.10,.49),(0,.49)],mint_dark,loc=(5.55,3.05,.50),segments=40)
path('soap pump',[(5.55,3.05,1.0),(5.55,3.05,1.15),(5.55,2.85,1.15)],.024,brass)

# Plants: pot, earth, curved stems and individually shaped leaves.
def plant(name,origin,scale=1,trailing=False):
    px,py,pz=origin
    lathe(name+' ceramic pot',[(0,0),(.22,0),(.31,.08),(.33,.48),(.30,.52),(.25,.49),(.24,.12),(0,.12)],ivory,loc=origin,segments=48)
    lathe(name+' earth',[(0,0),(.265,0),(.265,.015),(0,.015)],soil,loc=(px,py,pz+.47),segments=32)
    for stem in range(8):
        angle=stem*2.4;length=scale*(.6+random.random()*.3)
        points=[]
        for j in range(9):
            t=j/8;spread=.50*t*scale
            z=pz+.46+length*math.sin(t*math.pi*.62)
            if trailing and stem%2==0:z=pz+.46+length*.3*t-length*1.2*t*t
            points.append((px+math.cos(angle)*spread,py+math.sin(angle)*spread,z))
        path(name+' stem',points,.012,leaf_mats[0])
        for j in [3,5,7,8]:
            c=Vector(points[j]);a=angle+(1 if j%2 else -1)*.9
            direction=Vector((math.cos(a)*.27*scale,math.sin(a)*.27*scale,.10*scale))
            side=Vector((-math.sin(a)*.11*scale,math.cos(a)*.11*scale,0))
            verts=[tuple(c),tuple(c+direction*.50+side),tuple(c+direction),tuple(c+direction*.50-side),tuple(c+direction*.5+Vector((0,0,.045)))]
            mesh=bpy.data.meshes.new(name+' leaf');mesh.from_pydata(verts,[],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)]);mesh.update()
            o=bpy.data.objects.new(name+' leaf',mesh);scene.collection.objects.link(o);o.parent=env;o.data.materials.append(random.choice(leaf_mats))
            for f in mesh.polygons:f.use_smooth=True
plant('left herb',(-6.17,2.85,.50),1.15)
plant('shelf trailing herb',(-2.90,2.72,2.17),.82,True)
plant('right trailing herb',(6.24,2.80,.50),1.1,True)

# Leaning paddle boards and crock with wooden spoons.
paddle=cube('leaning oak paddle',(-5.12,3.34,1.11),(.93,.12,1.20),oak[3],.18)
paddle.rotation_euler.y=-.12
cube('paddle board handle',(-5.04,3.34,1.82),(.25,.13,.43),oak[3],.10)
lathe('utensil crock',[(0,0),(.24,0),(.27,.07),(.27,.58),(.23,.61),(.20,.56),(.20,.12),(0,.12)],ivory,loc=(-4.13,2.91,.50),segments=48)
for i in range(3):
    x=-4.24+i*.13;end=(x+(i-1)*.16,2.91,1.56+abs(i-1)*.12)
    path('wood spoon handle',[(x,2.91,.7),end],.035,oak[2])
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=end)
    spoon=bpy.context.object;spoon.name='wood spoon oval';spoon.scale=(.105,.042,.18);spoon.parent=env;spoon.data.materials.append(oak[2])
    for f in spoon.data.polygons:f.use_smooth=True

# Fluting on the jars and bowl catches daylight and makes the pottery less generic.
for x in [1.25,2.12]:
    for i in range(28):
        a=i*2*math.pi/28
        path('jar ceramic rib',[(x+.269*math.cos(a),2.85+.269*math.sin(a),2.25),(x+.269*math.cos(a),2.85+.269*math.sin(a),2.55)],.008,ivory if x<2 else mint)
for i in range(40):
    a=i*2*math.pi/40
    path('bowl flute',[(r*math.cos(a),r*math.sin(a),z) for r,z in [(.69,.15),(.80,.27),(.96,.49),(1.09,.74)]],.015,mint,bowl)

# A folded woven towel drapes over the right front corner.
verts=[];faces=[];cols=20;rows=32
for j in range(rows+1):
    t=j/rows;y=.12-t*2.18
    z=.055 if y>=-1.65 else .055-(abs(y)-1.65)*1.8
    for i in range(cols+1):
        u=i/cols;x=5.66+u*.86
        verts.append((x,y,z+.022*math.sin(u*math.pi*5)*(.6+t)))
for j in range(rows):
    for i in range(cols):
        a=j*(cols+1)+i;faces.append((a,a+1,a+cols+2,a+cols+1))
mesh=bpy.data.meshes.new('woven towel mesh');mesh.from_pydata(verts,[],faces);mesh.update()
towel=bpy.data.objects.new('folded striped linen towel',mesh);scene.collection.objects.link(towel);towel.parent=env
mesh.materials.append(cloth);mesh.materials.append(stripe)
uv=mesh.uv_layers.new(name='UVMap')
for face in mesh.polygons:
    face.material_index=1 if face.index%cols in [2,3,16,17] else 0;face.use_smooth=True
    for li in face.loop_indices:
        vi=mesh.loops[li].vertex_index;uv.data[li].uv=(vi%(cols+1)/cols,vi//(cols+1)/rows)
# Load the project's actual sculpted fruit, avoiding stand-in spheres in the Blender review.
review=bpy.data.collections.new('Review fruit - game supplies these dynamically');scene.collection.children.link(review)
def fruit(kind,loc,size=1.0,half=''):
    filename='typeslasher-fresh.blend' if kind in ['orange','mango'] else 'typeslasher-foods.blend'
    name='food_'+kind+half
    with bpy.data.libraries.load('D:/AI/Kazi WorkOS/Typeslasher/'+filename,link=False) as (src,dst):
        source_names=list(src.objects);root_index=source_names.index(name);dst.objects=list(source_names)
    loaded=[o for o in dst.objects if o]
    # All mesh children have the same food prefix; only the requested root's descendants are included.
    rootfood=dst.objects[root_index]
    children=[rootfood]+list(rootfood.children_recursive)
    for o in children:review.objects.link(o);o.hide_set(False);o.hide_render=False
    bpy.context.view_layer.update()
    pts=[o.matrix_world@Vector(v) for o in children if o.type=='MESH' for v in o.bound_box]
    mins=Vector(tuple(min(p[i] for p in pts) for i in range(3)));maxs=Vector(tuple(max(p[i] for p in pts) for i in range(3)))
    k=size/max(maxs-mins);rootfood.scale=(k,k,k)
    rootfood.location=Vector(loc)-Vector(((mins.x+maxs.x)/2*k,(mins.y+maxs.y)/2*k,mins.z*k))
    return rootfood
for i,kind in enumerate(['apple','kiwi','pear','orange','mango','apple','kiwi','orange']):
    fruit(kind,(-5.62+(i%3)*.83,-.83+(i//3)*.56,.12),.77)
fruit('apple',(-.90,-.45,.19),1.05)
for i,kind in enumerate(['kiwi','orange','apple','mango']):
    fruit(kind,(3.9+math.cos(i*2.4)*.40,-.25+math.sin(i*2.4)*.35,.53+(i%2)*.12),.61,'_left')

# Reference camera and studio lighting are kept in the editable file, not GLB.
bpy.ops.object.camera_add(location=(0,-13,8.5));cam=bpy.context.object;cam.name='Kitchen review camera'
cam.rotation_euler=(Vector((0,.75,.80))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=14.8;scene.camera=cam
for name,loc,power,size,color in [('window daylight',(-5,-3,7),1050,4.5,(1,.94,.83)),('sky bounce',(4,0,5),260,5,(.79,.88,1))]:
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((0,0,0))-obj.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Kitchen studio');scene.world.use_nodes=True
next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND').inputs[0].default_value=(.42,.50,.62,1)
scene.render.resolution_x=1600;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.filepath='D:/AI/Kazi WorkOS/Typeslasher/art-review/kitchen-daylight-v2.png'
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_perspective='CAMERA'
print('Created',scene.name,'with',len(scene.objects),'objects; original Scene preserved.')
# Shelf and props clearance validation in world coordinates.
bpy.context.view_layer.update()
def bounds(obj):
    pts=[obj.matrix_world@Vector(v) for v in obj.bound_box]
    return {'min':[min(v[i] for v in pts) for i in range(3)],'max':[max(v[i] for v in pts) for i in range(3)]}
for obj in scene.objects:
    if obj.name.startswith(('stacked dishes','storage jar','jar lid')):
        b=bounds(obj)
        assert b['max'][1]<3.50, (obj.name,'wall overlap',b)
        assert b['min'][1]>2.15 and b['max'][1]<3.47, (obj.name,'shelf overhang',b)
print('Shelf dish and jar bounds fit within shelf depth; wall clearance verified.')

