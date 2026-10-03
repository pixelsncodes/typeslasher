"""Sculpted food pack: Y-up authoring, baked Z-up Blender geometry, Y-up GLB.
No external textures. Deterministic vertex colors and PBR materials survive export.
"""
import bpy, bmesh, math, random, os, json
from mathutils import Vector, Matrix, noise
BASE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(BASE,'public','assets','typeslasher-food-pack.glb')
random.seed(27)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
bpy.context.preferences.filepaths.save_version=0
TAU=math.tau

def color(h):
    def linear(v): return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
    return tuple(linear(int(h[i:i+2],16)/255) for i in (0,2,4))
def mix(a,b,t): return tuple(x*(1-t)+y*t for x,y in zip(a,b))
def mat(name,h,rough=.4,coat=0,painted=False):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color(h),1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=m.diffuse_color
    p.inputs['Roughness'].default_value=rough; p.inputs['Coat Weight'].default_value=coat; p.inputs['Coat Roughness'].default_value=.25
    if painted:
        attr=m.node_tree.nodes.new('ShaderNodeVertexColor'); attr.layer_name='Color'; m.node_tree.links.new(attr.outputs['Color'],p.inputs['Base Color'])
    return m
SKIN=mat('Painted fruit skin','ffffff',.37,.12,True)
MATTE=mat('Painted matte produce','ffffff',.54,.04,True)
DOUGH=mat('Golden baked dough','ffffff',.8,0,True)
LEAF=mat('Leaf green','4d922b',.5); VEIN=mat('Leaf vein','8cb64a',.53); STEM=mat('Woody stems','725031',.74)
CHOCOLATE=mat('Dark chocolate','45251c',.37,.08); SEED=mat('Kiwi seeds','251e14',.28)
FLESH=mat('Apple flesh','fff0bc',.62); PEAR_FLESH=mat('Pear flesh','f7edbf',.65); BANANA_FLESH=mat('Banana flesh','fff0b1',.62)
CARROT_FLESH=mat('Carrot interior','e98b24',.57)
GRAPE_SKIN=mat('Painted translucent grape skin','ffffff',.26,.22,True)
GRAPE_FLESH=mat('Painted translucent grape flesh','ffffff',.21,.22,True)
for material,transmission in ((GRAPE_SKIN,.18),(GRAPE_FLESH,.24)):
    p=material.node_tree.nodes.get('Principled BSDF')
    p.inputs['Transmission Weight'].default_value=transmission
    p.inputs['IOR'].default_value=1.38
    p.inputs['Subsurface Weight'].default_value=.08
    p.inputs['Subsurface Radius'].default_value=(1,.45,.3)
    p.inputs['Subsurface Scale'].default_value=.09
CRUMB=mat('Cookie crumb','d99c56',.86); CORN_FLESH=mat('Corn interior','fff1ae',.52); KIWI_FLESH=mat('Kiwi interior','92c42f',.4)
KIWI_PAINT=mat('Painted kiwi flesh','ffffff',.48,.04,True)
KIWI_FUZZ=mat('Kiwi fine brown fuzz','785334',.95)
KERNEL_FLESH=mat('Golden kernel interior','e3b334',.53)
def root(name):
    o=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(o); return o
def mesh(parent,name,verts,faces,material,colors=None):
    data=bpy.data.meshes.new(name); data.from_pydata(verts,[],faces); data.update()
    o=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(o); o.parent=parent; data.materials.append(material)
    for f in data.polygons: f.use_smooth=True
    if colors:
        attr=data.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT')
        for item,c in zip(attr.data,colors): item.color=(*c,1)
    return o
def ellipsoid(parent,name,loc,scale,material,segments=20,rings=12,shade=None):
    verts=[]; colors=[]; faces=[]
    for j in range(rings+1):
        theta=math.pi*j/rings
        for i in range(segments):
            phi=TAU*i/segments; p=Vector((math.sin(theta)*math.cos(phi),math.cos(theta),math.sin(theta)*math.sin(phi)))
            shape=Vector(tuple(math.copysign(abs(v)**.72,v) for v in p)) if name=='Rounded corn kernel' else p
            verts.append(Vector(loc)+Vector(tuple(shape[k]*scale[k] for k in range(3))))
            if shade: colors.append(shade(p,j,i))
    for j in range(rings):
        for i in range(segments):
            a=j*segments+i; b=j*segments+(i+1)%segments; faces.append((a,b,b+segments,a+segments))
    return mesh(parent,name,verts,faces,material,colors or None)
def tube(parent,name,points,radii,material,sides=10):
    verts=[]; faces=[]; points=[Vector(p) for p in points]
    for j,p in enumerate(points):
        tangent=(points[min(j+1,len(points)-1)]-points[max(0,j-1)]).normalized()
        ref=Vector((0,0,1)) if abs(tangent.z)<.9 else Vector((1,0,0)); u=tangent.cross(ref).normalized(); v=tangent.cross(u).normalized()
        for i in range(sides): verts.append(p+radii[j]*(u*math.cos(TAU*i/sides)+v*math.sin(TAU*i/sides)))
    for j in range(len(points)-1):
        for i in range(sides):
            a=j*sides+i; b=j*sides+(i+1)%sides; faces.append((a,b,b+sides,a+sides))
    faces.extend([tuple(reversed(range(sides))),tuple((len(points)-1)*sides+i for i in range(sides))])
    return mesh(parent,name,verts,faces,material)
def leaf(parent,name,start,end,width,material=LEAF,serration=0):
    a,b=Vector(start),Vector(end); d=b-a; side=Vector((d.y,-d.x,0)).normalized(); verts=[]; faces=[]; mid=[]
    for j in range(13):
        t=j/12; center=a+d*t+Vector((0,0,min(.16,d.length*.16)*math.sin(math.pi*t))); mid.append(center+Vector((0,0,.012)))
        w=width*math.sin(math.pi*t)**.8*(1-serration*(j%2))
        for k in (-1,0,1): verts.append(center+side*w*k+Vector((0,0,-min(.07,width*.3)*abs(k)*math.sin(math.pi*t))))
    for j in range(12):
        for k in range(2): n=j*3+k; faces.append((n,n+1,n+4,n+3))
    o=mesh(parent,name,verts,faces,material); solid=o.modifiers.new('Leaf thickness','SOLIDIFY'); solid.thickness=.008
    tube(parent,name+' midrib',mid,[.012*(1-j/14) for j in range(13)],VEIN,5)
    for j in (3,5,7,9):
        w=width*math.sin(math.pi*j/12)**.8
        for s in (-1,1): tube(parent,name+' vein',[mid[j-1],mid[j]+side*w*.78*s-Vector((0,0,.028))],[.006,.002],VEIN,4)
    return o
def profile(parent,name,points,material,shade,segments=64,steps=3,lobes=0):
    path=[]
    for j in range(len(points)-1):
        p0=Vector(points[max(j-1,0)]); p1=Vector(points[j]); p2=Vector(points[j+1]); p3=Vector(points[min(j+2,len(points)-1)])
        for k in range(steps):
            t=k/steps; path.append(.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
    path.append(Vector(points[-1])); verts=[]; colors=[]; faces=[]
    for j,(radius,y) in enumerate(path):
        for i in range(segments):
            phi=TAU*i/segments; r=max(.001,radius)*(1+lobes*math.cos(5*phi)); p=Vector((r*math.cos(phi),y,r*math.sin(phi)))
            verts.append(p); colors.append(shade(p,phi,j/len(path)))
    for j in range(len(path)-1):
        for i in range(segments):
            a=j*segments+i; b=j*segments+(i+1)%segments; faces.append((a,a+segments,b+segments,b))
    faces.extend([tuple(reversed(range(segments))),tuple((len(path)-1)*segments+i for i in range(segments))])
    return mesh(parent,name,verts,faces,material,colors)
def apple():
    r=root('food_apple')
    def paint(p,phi,t):
        stripe=(.5+.5*math.sin(31*phi+1.7*p.y+.35*math.sin(7*p.y+phi)))**5
        c=mix(color('9b1630'),color('d8333c'),.47+.27*math.sin(phi+.4))
        c=mix(c,color('ee9a48'),stripe*.075+max(0,p.y-.5)*.08)
        return c
    profile(r,'Tapered apple with deep stem well',[(.001,-.89),(.17,-.94),(.44,-.86),(.71,-.62),(.87,-.25),(.94,.16),(.91,.48),(.78,.74),(.58,.89),(.34,.88),(.13,.73),(.035,.64),(.001,.64)],SKIN,paint,segments=80,steps=4,lobes=.014)
    tube(r,'Curved apple stem',[(0,.64,0),(.025,.91,0),(.13,1.15,-.025),(.19,1.23,-.02)],[.058,.053,.039,.028],STEM)
    leaf(r,'Apple leaf',(.05,.99,0),(.73,1.34,.12),.205,serration=.07); return r
def banana():
    r=root('food_banana'); verts=[]; faces=[]; colors=[]; points=[]; sides=20; steps=48
    for j in range(steps+1):
        t=j/steps; theta=-1.15+2.3*t; center=Vector((1.32*math.sin(theta),.65-1.27*math.cos(theta),0)); points.append(center)
        normal=Vector((math.sin(theta),-math.cos(theta),0)); radius=.065+.23*math.sin(math.pi*t)**.65
        for i in range(sides):
            phi=TAU*i/sides; p=center+radius*(1+.055*math.cos(5*phi))*(normal*math.cos(phi)+Vector((0,0,math.sin(phi))))
            verts.append(p); c=mix(color('df9b0b'),color('ffdd3f'),.6+.25*math.sin(phi))
            if t<.07 or t>.96: c=mix(c,color('83913a'),.45)
            colors.append(c)
    for j in range(steps):
        for i in range(sides):
            a=j*sides+i; b=j*sides+(i+1)%sides; faces.append((a,a+sides,b+sides,b))
    faces.extend([tuple(range(sides)),tuple(reversed([steps*sides+i for i in range(sides)]))]); mesh(r,'Tapered ribbed banana',verts,faces,SKIN,colors)
    tube(r,'Banana woody tip',[points[0],points[0]+Vector((-.08,.09,0))],[.07,.046],STEM)
    tube(r,'Banana crown',[points[-1],points[-1]+Vector((.08,.18,0)),points[-1]+Vector((.07,.24,0))],[.095,.072,.055],mat('Banana crown','818c30',.75)); return r
def carrot():
    r=root('food_carrot')
    profile(r,'Organic tapered carrot',[(.001,-1.25),(.06,-1.18),(.14,-.94),(.23,-.62),(.31,-.25),(.38,.17),(.4,.47),(.31,.62),(.04,.65)],MATTE,lambda p,a,t:mix(color('d9510c'),color('ff942a'),.5+.18*math.cos(a)+.15*math.sin(p.y*33)),48,3,.025)
    grooves=mat('Carrot shallow grooves','be4c13',.74)
    for j,(y,rad) in enumerate([(-.86,.16),(-.56,.248),(-.24,.315),(.05,.36),(.35,.393)]):
        start=.65+(j%2)*.3; pts=[(rad*math.cos(start+i*.1),y+.01*math.sin(i*.7),rad*math.sin(start+i*.1)) for i in range(11)]
        tube(r,'Carrot growth line',pts,[.008]*len(pts),grooves,4)
    for i in range(4):
        angle=(i-1.5)*.48; end=(math.sin(angle)*.85,1.3+.18*math.cos(angle),-.08+(i%2)*.2)
        tube(r,'Carrot green stem',[(0,.57,0),(end[0]*.45,.97,end[2]*.5),end],[.035,.025,.008],LEAF,6)
        for j in range(3):
            t=.48+j*.14; center=(end[0]*t,.64+(end[1]-.64)*t,end[2]*t)
            for side in (-1,1): leaf(r,'Carrot leaflet',center,(center[0]+side*(.21-j*.045),center[1]+.16,center[2]),.06,serration=.25)
    return r
def cookie():
    r=root('food_cookie')
    o=profile(r,'Uneven baked cookie',[(.001,-.15),(.55,-.15),(.84,-.1),(.93,0),(.88,.14),(.68,.21),(.32,.25),(.001,.26)],DOUGH,lambda p,a,t:mix(color('9b5728'),color('e9b262'),.6+.12*math.sin(p.x*17+p.z*13)+.08*math.cos(p.z*24)),64,3,.022)
    o.data.transform(Matrix.Rotation(math.pi/2,4,'X'))
    for back in (False,True):
        for i,(x,y) in enumerate([(-.48,.3),(.12,.56),(.48,.19),(-.17,.08),(-.42,-.34),(.21,-.42),(.56,-.32),(-.63,-.02),(.01,-.68)]):
            size=.095+(i%3)*.026; bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,-.15 if back else .22))
            chip=bpy.context.object; chip.name='Embedded chocolate chunk'; chip.scale=(size*1.6,size*1.3,.09); chip.rotation_euler=(.15,-.1,i*.83)
            bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); chip.parent=r; chip.data.materials.append(CHOCOLATE)
            mod=chip.modifiers.new('Melted edges','BEVEL'); mod.width=.028; mod.segments=2
    for i in range(35):
        a=random.random()*TAU; rad=random.uniform(.2,.84); ellipsoid(r,'Baked crumb',(rad*math.cos(a),rad*math.sin(a),.232),(.012,.015,.007),CRUMB,8,4)
    return r
def corn():
    r=root('food_corn'); profile(r,'Corn cob',[(.001,-1),(.35,-.9),(.4,-.4),(.4,.3),(.31,.86),(.04,1.05),(.001,1.05)],MATTE,lambda p,a,t:color('e8b63a'),32,2)
    for row in range(11):
        y=-.86+row*.175; taper=(1-.15*abs(y))*(.74 if row==10 else 1)
        for i in range(12):
            phi=TAU*i/12; rad=.37*taper
            ellipsoid(r,'Rounded corn kernel',(rad*math.cos(phi),y,rad*math.sin(phi)),(.122*taper,.091,.122*taper),SKIN,12,8,lambda p,j,k:mix(color('d48b04'),color('f9cb32'),.55+.15*p.y))
    for end,w in [((-.78,.1,.21),.25),((.77,-.03,.08),.24),((-.36,-.42,-.45),.22)]: leaf(r,'Curled corn husk',(0,-1.06,0),end,w,LEAF)
    tube(r,'Corn stalk',[(0,-.95,0),(0,-1.21,0)],[.14,.1],LEAF,10); return r
def grape():
    r=root('food_grape'); palette=['8d1937','a72543','7f1434','b12c49']
    for layer,(y,rad,count,size) in enumerate([(.55,.38,4,.31),(-.07,.40,4,.31),(-.74,.28,3,.28),(-1.32,0,1,.23)]):
        for i in range(count):
            phi=TAU*i/count+[math.pi/4,0,math.pi/6,0][layer]; c=color(palette[(i+layer)%len(palette)])
            def paint(p,j,k):
                # Soft bloom and mottling follow the surface, without a UV grid.
                bloom=.06+.1*max(0,p.y)+.07*noise.noise(p*6)
                return mix(c,color('d16f80'),bloom)
            center=(math.cos(phi)*rad,y,math.sin(phi)*rad)
            berry=ellipsoid(r,'Full grape berry',center,(size,size*1.10,size*.97),GRAPE_SKIN,40,26,paint)
            berry['grape_center']=center
            berry['grape_radius']=size
            # Small branching stalks support the berries through the open gaps.
            tube(r,'Grape pedicel',[(0,y+.23,0),(center[0]*.65,y+.16,center[2]*.65),(center[0],y+size*1.05,center[2])],[.022,.018,.012],STEM,6)
    tube(r,'Branched vine',[(0,.65,0),(0,.9,0),(.18,1.15,-.02),(.32,1.19,-.06)],[.068,.068,.045,.03],STEM)
    tube(r,'Side vine',[(0,.86,0),(-.25,.88,0),(-.38,.73,0)],[.04,.03,.01],STEM)
    leaf(r,'Serrated grape leaf',(-.06,.83,.03),(-.84,1.22,.04),.3,serration=.3); return r

def grape_cut_flesh(parent,sign,boundary,berry):
    """A watertight, softly bulged cut face with a blush gradient and faint fibers."""
    center=sum(boundary,Vector())/len(boundary);n=len(boundary);rings=12
    berry_center=Vector(berry['grape_center']);radius=berry['grape_radius']
    verts=[];colors=[];faces=[]
    for j in range(rings+1):
        t=max(.0001,j/rings)
        for edge in boundary:
            p=center+(edge-center)*t
            p.x=-sign*.006*(1-t*t)
            a=math.atan2(p.z-center.z,p.y-center.y)
            edge_t=t**3
            c=mix(color('d17c88'),color('ae405a'),edge_t*.7)
            # Veins vary in angle and strength, avoiding a regular sliced-kiwi pattern.
            fiber=(.5+.5*math.sin(19*a+3*t+1.5*math.sin(7*a)))**14
            c=mix(c,color('edb4a2'),fiber*.22*(1-t))
            mottling=noise.noise(Vector((p.y*48,p.z*48,berry_center.y*7)))
            c=mix(c,color('df9b9e'),.11+.07*mottling)
            # A pale central membrane runs lengthwise, clearest on central cuts.
            membrane=berry_center.z+.012*math.sin((p.y-berry_center.y)*13+berry_center.y*4)
            vein=math.exp(-((p.z-membrane)/.016)**2)*max(0,1-abs(p.y-berry_center.y)/(radius*1.1))
            vein*=max(0,1-abs(berry_center.x)/radius)
            c=mix(c,color('e9b99d'),vein*.46)
            verts.append(p);colors.append(c)
    for j in range(rings):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    face=mesh(parent,'Juicy grape cut flesh',verts,faces,GRAPE_FLESH,colors)
    # The bisect boundary winding is not guaranteed; orient the face explicitly.
    face.data.update()
    if sum(p.normal.x for p in face.data.polygons)*(-sign)<0:
        bm=bmesh.new();bm.from_mesh(face.data)
        bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(face.data);bm.free()
def kiwi():
    r=root('food_kiwi')
    # An intact brown oval. Flesh and seeds belong only to the sliced roots.
    scale=Vector((1.05,.72,.70))
    ellipsoid(r,'Uncut oval kiwi skin',(0,0,0),scale,MATTE,80,48,
        lambda p,j,i:mix(color('634329'),color('a77d45'),.38+.16*noise.noise(p*31)+.13*noise.noise(p*7)+.08*p.y))
    fuzz_verts=[];fuzz_faces=[]
    for i in range(440):
        y=1-2*(i+.5)/440; phi=i*math.pi*(3-math.sqrt(5)); radius=math.sqrt(1-y*y)
        n=Vector((radius*math.cos(phi),y,radius*math.sin(phi)))
        p=Vector(tuple(n[k]*scale[k] for k in range(3)))
        normal=Vector(tuple(n[k]/scale[k] for k in range(3))).normalized()
        tip=p+normal*(.013+.009*(i%3)/2)
        u=normal.cross(Vector((0,1,0))).normalized();v=normal.cross(u).normalized();base=len(fuzz_verts)
        for point,radius in ((p,.0028),(tip,.0007)):
            for side in range(3):fuzz_verts.append(point+radius*(u*math.cos(TAU*side/3)+v*math.sin(TAU*side/3)))
        for side in range(3):fuzz_faces.append((base+side,base+(side+1)%3,base+(side+1)%3+3,base+side+3))
        fuzz_faces.extend([(base+2,base+1,base),(base+3,base+4,base+5)])
    mesh(r,'Fine kiwi hair',fuzz_verts,fuzz_faces,KIWI_FUZZ)
    for sign in (-1,1):
        ellipsoid(r,'Dry kiwi blossom scar',(sign*1.046,0,0),(.012,.10,.085),STEM,20,12)
    return r

def kiwi_cut_detail(parent,sign):
    verts=[];colors=[];faces=[];segments=96;rings=14
    for j in range(rings+1):
        t=max(.0001,j/rings)
        for i in range(segments):
            a=TAU*i/segments
            verts.append((-sign*.003,t*.695*math.cos(a),t*.675*math.sin(a)))
            fiber=(.5+.5*math.cos(48*a+t*3))**8
            if t<.19: c=mix(color('dce5a1'),color('c4d984'),t/.19)
            else: c=mix(color('3b7b16'),color('9ecf32'),.32+.31*math.sin(t*math.pi)+.27*fiber)
            colors.append(c)
    for j in range(rings):
        for i in range(segments):
            n=j*segments+i;next=j*segments+(i+1)%segments
            f=(n,next,next+segments,n+segments);faces.append(f if sign>0 else tuple(reversed(f)))
    flesh=mesh(parent,'Radial kiwi cut flesh',verts,faces,KIWI_PAINT,colors)
    for f in flesh.data.polygons:f.use_smooth=False
    for i in range(30):
        a=TAU*i/30;rad=.34+(i%2)*.045;center=Vector((-sign*.011,math.cos(a)*rad,math.sin(a)*rad*.97))
        seed=ellipsoid(parent,'Kiwi cut seed',center,(.010,.038,.019),SEED,10,6)
        seed.data.transform(Matrix.Translation(center)@Matrix.Rotation(a,4,'X')@Matrix.Translation(-center))
def pear():
    r=root('food_pear')
    def paint(p,a,t):
        c=mix(color('7eaa24'),color('dfd949'),.48+.28*math.sin(a+.8)); c=mix(c,color('d69a39'),max(0,math.cos(a-.6))**8*max(0,1-abs(p.y+.2))*.3)
        return c
    profile(r,'Continuous pear shoulders',[(.001,-.88),(.3,-.91),(.62,-.73),(.76,-.4),(.73,-.03),(.54,.34),(.36,.62),(.29,.87),(.21,1.02),(.035,1.04),(.001,1.03)],MATTE,paint,64,3,.015)
    tube(r,'Bent pear stem',[(0,1.02,0),(.045,1.2,0),(.02,1.4,-.04)],[.052,.046,.028],STEM)
    leaf(r,'Pear leaf',(.03,1.16,0),(.65,1.36,.03),.155,serration=.09); return r

roots=[builder() for builder in (apple,banana,carrot,cookie,corn,grape,kiwi,pear)]
GRAPE_RIND=mat('Grape cut ruby skin','99253f',.28,.18)
BANANA_RIND=mat('Banana cut peel','e9ba28',.59)
APPLE_RIND=mat('Apple cut red skin','b72835',.48)
CARROT_CORE=mat('Carrot lighter interior core','f3b348',.61)
for parent,interior in zip(roots,[FLESH,BANANA_FLESH,CARROT_FLESH,CRUMB,CORN_FLESH,GRAPE_FLESH,KIWI_FLESH,PEAR_FLESH]):
    originals=[]
    for obj in list(parent.children_recursive):
        bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active=obj
        bpy.ops.object.convert(target='MESH'); bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        bm=bmesh.new(); bm.from_mesh(obj.data); bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00005); bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces)); bm.to_mesh(obj.data); bm.free(); originals.append(obj)
    for sign,suffix in ((-1,'left'),(1,'right')):
        half=root(parent.name+'_'+suffix)
        for object_index,obj in enumerate(originals):
            cut_material=interior
            if obj.data.materials[0] in (LEAF,VEIN,STEM,CHOCOLATE,KIWI_FUZZ) or 'crown' in obj.name.lower():
                cut_material=obj.data.materials[0]
            elif 'corn kernel' in obj.name.lower():cut_material=KERNEL_FLESH
            rind=GRAPE_RIND if parent.name=='food_grape' and 'berry' in obj.name else BANANA_RIND if 'ribbed banana' in obj.name else APPLE_RIND if 'Tapered apple' in obj.name else None
            bm=bmesh.new(); bm.from_mesh(obj.data)
            bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.00001,plane_co=(0,0,0),plane_no=(1,0,0),clear_outer=sign<0,clear_inner=sign>0)
            if not bm.faces: bm.free(); continue
            boundaries=[e for e in bm.edges if e.is_boundary and all(abs(v.co.x)<.0001 for v in e.verts)]
            caps=bmesh.ops.holes_fill(bm,edges=boundaries,sides=0).get('faces',[]) if boundaries else []
            for face in caps:
                face.material_index=len(obj.data.materials); face.smooth=False
            if rind:
                # A thin skin ring surrounds the correct flesh material.
                for face in caps:
                    outer=list(face.verts); center=face.calc_center_median()
                    thickness=.975 if rind==GRAPE_RIND else .80 if rind==BANANA_RIND else .98
                    inner=[bm.verts.new(center+(v.co-center)*thickness) for v in outer]
                    bm.faces.remove(face)
                    if rind==GRAPE_RIND:
                        grape_cut_flesh(half,sign,[v.co.copy() for v in inner],obj)
                    else:
                        flesh=bm.faces.new(inner); flesh.material_index=len(obj.data.materials)
                    for i in range(len(outer)):
                        rim=bm.faces.new((outer[i],outer[(i+1)%len(outer)],inner[(i+1)%len(inner)],inner[i]))
                        rim.material_index=len(obj.data.materials)+1
            bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
            data=bpy.data.meshes.new(obj.name+' cut'); bm.to_mesh(data); bm.free()
            for material in obj.data.materials: data.materials.append(material)
            data.materials.append(cut_material)
            if rind: data.materials.append(rind)
            copy=bpy.data.objects.new(obj.name+' '+suffix,data); bpy.context.collection.objects.link(copy); copy.parent=half
        if parent.name=='food_kiwi':kiwi_cut_detail(half,sign)
        if parent.name=='food_carrot':
            yz=[(-1.15,0),(-.65,.035),(0,.09),(.50,.12),(.58,0),(.50,-.12),(0,-.09),(-.65,-.035)]
            face=tuple(range(len(yz)))
            mesh(half,'Carrot central interior', [(-sign*.004,y,z) for y,z in yz], [face if sign>0 else tuple(reversed(face))],CARROT_CORE)
        if parent.name in ('food_apple','food_pear'):
            core=mat(parent.name+' seed core '+suffix,'e6d19a',.7)
            ellipsoid(half,'Seed core',(-sign*.006,-.02,0),(.009,.4,.13),core,20,12)
            for z in (-.12,.12):
                ellipsoid(half,'Apple or pear pip',(-sign*.023,.04,z),(.014,.083,.036),STEM,12,8)
all_roots=[o for o in bpy.context.scene.objects if o.parent is None]
conversion=Matrix.Rotation(math.pi/2,4,'X')
for parent in all_roots:
    for obj in parent.children_recursive: obj.data.transform(conversion); obj.data.update()
for parent in all_roots:
    bpy.ops.object.select_all(action='DESELECT'); children=list(parent.children)
    for obj in children: obj.select_set(True)
    if children:
        bpy.context.view_layer.objects.active=children[0]; bpy.ops.object.join(); bpy.context.object.name=parent.name+'_mesh'
        # Blender 5.2's exporter loses a second painted material's color channel
        # on a joined mesh. One primitive per material keeps the exact colors.
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='MATERIAL'); bpy.ops.object.mode_set(mode='OBJECT')
        for piece in list(parent.children):
            if not piece.data.polygons: continue
            used=piece.data.materials[piece.data.polygons[0].material_index]
            piece.data.materials.clear(); piece.data.materials.append(used)
            for poly in piece.data.polygons: poly.material_index=0
os.makedirs(os.path.dirname(OUT),exist_ok=True); bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_materials='EXPORT',export_apply=True,export_extras=True,export_vertex_color='MATERIAL')
report={p.name:sum(len(o.data.polygons) for o in p.children if o.type=='MESH') for p in all_roots}
os.makedirs(os.path.join(BASE,'art-review'),exist_ok=True)
with open(os.path.join(BASE,'art-review','mesh-report.json'),'w') as f: json.dump(report,f,indent=2)
for parent in all_roots:
    collection=bpy.data.collections.new(parent.name); bpy.context.scene.collection.children.link(collection)
    for obj in [parent]+list(parent.children):
        for previous in list(obj.users_collection): previous.objects.unlink(obj)
        collection.objects.link(obj); obj.hide_set(parent.name!='food_apple')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BASE,'typeslasher-foods.blend'))
print('Exported',OUT,os.path.getsize(OUT),'bytes')
