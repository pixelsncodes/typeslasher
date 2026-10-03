"""Build an independent Fresh picks pack without replacing the approved starter pack."""
from pathlib import Path
import math, random

# Reuse the established geometry/material helpers, stopping before starter generation.
helper=Path(__file__).with_name('remodel_food_assets.py')
exec(compile(helper.read_text(encoding='utf8').split('\nroots=[builder()')[0],str(helper),'exec'))
random.seed(81)
PITH=mat('Citrus pith','f4e8bd',.65)
ORANGE_FLESH=mat('Painted orange flesh','ffffff',.32,.12,True)
LIME_FLESH=mat('Painted lime flesh','ffffff',.34,.1,True)
MANGO_FLESH=mat('Mango golden flesh','f6ad27',.44)
PEACH_FLESH=mat('Peach golden flesh','f4b34f',.52)
PLUM_FLESH=mat('Plum amber flesh','dfb451',.42)
PIT=mat('Painted stone fruit pit','ffffff',.78,0,True)
PIT_CUT=mat('Stone cut interior','b77b42',.78)
ICING=mat('Strawberry icing','f077a3',.28,.22)
DONUT_CRUMB=mat('Donut soft crumb','efc580',.78)
CUT_PAINT=mat('Painted stone fruit flesh','ffffff',.48,.06,True)

def flesh_detail(parent,sign,boundary,material):
    center=sum(boundary,Vector())/len(boundary);N=len(boundary);verts=[];colors=[];faces=[]
    for j in range(11):
        t=max(.0001,j/10)
        for edge in boundary:
            p=center+(edge-center)*t;p.x=-sign*.003
            base='efa727' if material==MANGO_FLESH else 'efc270' if material==PEACH_FLESH else 'e3bd63'
            c=mix(color(base),color('ffe39a'),.10+.12*math.sin(t*math.pi)+.025*noise.noise(p*32))
            if material==PEACH_FLESH:
                distance=(p.y/.5)**2+(p.z/.34)**2
                c=mix(c,color('d35b42'),.42*math.exp(-((distance-1)/.5)**2))
            verts.append(p);colors.append(c)
    for j in range(10):
        for i in range(N):a=j*N+i;b=j*N+(i+1)%N;faces.append((a,b,b+N,a+N))
    obj=mesh(parent,'Soft fruit flesh fibers',verts,faces,CUT_PAINT,colors)
    if sum(f.normal.x for f in obj.data.polygons)*(-sign)<0:
        bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()

def clip(obj,sign,cap_material):
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
    bpy.ops.object.convert(target='MESH');bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    bm=bmesh.new();bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
    bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,plane_co=(0,0,0),plane_no=(1,0,0),clear_outer=sign<0,clear_inner=sign>0)
    edges=[e for e in bm.edges if e.is_boundary and all(abs(v.co.x)<.0001 for v in e.verts)]
    caps=bmesh.ops.holes_fill(bm,edges=edges,sides=0).get('faces',[]) if edges else []
    for f in caps:f.material_index=len(obj.data.materials);f.smooth=False
    if cap_material in (MANGO_FLESH,PEACH_FLESH,PLUM_FLESH):
        for f in caps:flesh_detail(obj.parent,sign,[v.co.copy() for v in f.verts],cap_material)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
    obj.data.materials.append(cap_material)
    if not obj.data.polygons:bpy.data.objects.remove(obj,do_unlink=True)

def citrus(name):
    lime=name=='lime';r=root('food_'+name)
    size=(.89,.79,.79) if lime else (.92,.91,.92)
    dark,light=('32791c','91bb32') if lime else ('df6409','ffa51d')
    body=ellipsoid(r,name+' dimpled peel',(0,0,0),size,MATTE,72,44,
        lambda p,j,i:mix(color(dark),color(light),.5+.16*p.y+.16*noise.noise(p*29)))
    for v in body.data.vertices:
        n=v.co.normalized();v.co*=1+.003*noise.noise(n*65)
    ellipsoid(r,'Dry citrus navel',(0,-size[1],0),(.058,.018,.058),STEM,16,8)
    ellipsoid(r,'Green citrus crown',(0,size[1],0),(.09,.025,.09),LEAF,16,8)
    tube(r,'Citrus stem',[(0,size[1],0),(.04,size[1]+.16,0)],[.025,.019],STEM,7)
    leaf(r,'Citrus leaf',(.03,size[1]+.09,0),(.49,size[1]+.27,.08),.12)
    return r

def citrus_interior(parent,sign,name):
    lime=name=='lime';ry,rz=(.75,.75) if lime else (.865,.875)
    material=LIME_FLESH if lime else ORANGE_FLESH
    dark,light=('83b92d','c8db6c') if lime else ('ef8c12','ffc64a')
    for sector in range(10):
        verts=[];colors=[];faces=[];segments=12;rings=8
        for j in range(rings+1):
            t=.09+.91*j/rings
            for i in range(segments+1):
                a=TAU*(sector+(i/segments)*.958+.021)/10
                verts.append((-sign*(.006+.003*math.sin(t*math.pi)),ry*t*math.cos(a),rz*t*math.sin(a)))
                vesicle=(.5+.5*math.sin(a*145+t*31))**6
                colors.append(mix(color(dark),color(light),.34+.15*math.sin(t*math.pi)+.24*vesicle))
        for j in range(rings):
            for i in range(segments):
                k=j*(segments+1)+i;f=(k,k+1,k+segments+2,k+segments+1)
                faces.append(f if sign>0 else tuple(reversed(f)))
        mesh(parent,'Juicy citrus segment',verts,faces,material,colors)

def stone_fruit(name):
    r=root('food_'+name)
    scale={'plum':(.77,.97,.78),'peach':(.95,.86,.90),'mango':(.80,1.08,.69)}[name]
    def shade(p,j,i):
        if name=='plum':return mix(color('42214f'),color('a35183'),.30+.23*p.y+.08*noise.noise(p*8))
        if name=='peach':return mix(color('f3b955'),color('d8394b'),max(0,.45+.38*p.x+.14*noise.noise(p*6)))
        c=mix(color('f6b42c'),color('da4b28'),max(0,p.x)*.8)
        return mix(c,color('528739'),max(0,p.y-.1)*.64)
    body=ellipsoid(r,name+' sculpted skin',(0,0,0),scale,MATTE if name=='peach' else SKIN,72,44,shade)
    for v in body.data.vertices:
        p=v.co
        if name=='mango':p.x+=.16*(p.y*p.y-.35);p.x*=1-.14*p.y;p.z*=1-.07*p.y
        else:
            seam=math.exp(-(p.x/.055)**2)*max(0,abs(p.z)/scale[2])**4
            p.z*=1-(.11 if name=='peach' else .055)*seam
            p.y-=.025*(p.x/scale[0])
    tube(r,'Fruit stem',[(0,scale[1]-.04,0),(.06,scale[1]+.17,0)],[.038,.023],STEM,8)
    leaf(r,'Fruit leaf',(.03,scale[1]+.06,0),(.55,scale[1]+.22,.08),.12)
    return r

def add_stone(parent,sign,name):
    scale={'plum':(.15,.38,.20),'peach':(.22,.43,.28),'mango':(.10,.68,.28)}[name]
    stone=ellipsoid(parent,name+' pit',(0,0,0),scale,PIT,40,26,
        lambda p,j,i:mix(color('75401f'),color('be8246'),.48+.19*noise.noise(p*12)))
    if name=='peach':
        for v in stone.data.vertices:v.co*=1+.07*noise.noise(v.co*35)
    clip(stone,sign,PIT_CUT)
    # Bring only the exposed pit face just forward of the flesh, avoiding z-fighting.
    for v in stone.data.vertices:
        if abs(v.co.x)<.0001:v.co.x=-sign*.005
    verts=[];colors=[];faces=[];N=64;R=12
    for j in range(R+1):
        t=max(.0001,j/R)
        for i in range(N):
            a=TAU*i/N;ridge=(.5+.5*math.sin(a*17+t*19))
            y=scale[1]*t*math.cos(a);z=scale[2]*t*math.sin(a)
            verts.append((-sign*(.007+.016*math.sin(t*math.pi)*ridge),y,z))
            colors.append(mix(color('b49457' if name=='mango' else '713b20'),color('e4ca8c' if name=='mango' else 'b87b41'),.25+.4*ridge+.12*noise.noise(Vector((y*52,z*52,0)))))
    for j in range(R):
        for i in range(N):
            a=j*N+i;b=j*N+(i+1)%N;f=(a,b,b+N,a+N);faces.append(f if sign>0 else tuple(reversed(f)))
    mesh(parent,'Textured exposed stone',verts,faces,PIT,colors)

def donut():
    r=root('food_donut');verts=[];colors=[];faces=[];N=96;M=28
    def surface(u,v,extra=0):
        minor=.31*(1+.027*math.sin(5*u)+.017*math.cos(9*u));major=.69
        rad=major+(minor+extra)*math.cos(v)
        return (rad*math.cos(u),rad*math.sin(u),(minor*.8+extra)*math.sin(v))
    for i in range(N):
        u=TAU*i/N
        for j in range(M):
            v=TAU*j/M;verts.append(surface(u,v))
            colors.append(mix(color('a75620'),color('edb45f'),.48+.24*math.sin(v)+.09*math.sin(7*u)))
    for i in range(N):
        for j in range(M):faces.append((i*M+j,((i+1)%N)*M+j,((i+1)%N)*M+(j+1)%M,i*M+(j+1)%M))
    mesh(r,'Golden baked donut ring',verts,faces,DOUGH,colors)
    verts=[];faces=[];M=18
    for i in range(N):
        u=TAU*i/N;drip=.16+.13*math.sin(7*u)+.09*math.cos(11*u)
        for j in range(M+1):verts.append(surface(u,-drip+(math.pi+2*drip)*j/M,.018))
    for i in range(N):
        for j in range(M):
            a=i*(M+1)+j;b=((i+1)%N)*(M+1)+j;faces.append((a,b,b+1,a+1))
    glaze=mesh(r,'Dripping strawberry icing',verts,faces,ICING)
    solid=glaze.modifiers.new('Icing thickness','SOLIDIFY');solid.thickness=.012
    sprinkle_mats=[mat('Sugar sprinkle '+str(i),c,.45) for i,c in enumerate(['fff1bd','f7cf3d','70cbb8','ab73db','ed5b57'])]
    for i in range(60):
        u=random.random()*TAU;v=random.uniform(.35,2.8);p=Vector(surface(u,v,.035));a=random.random()*TAU
        d=Vector((math.cos(a),math.sin(a),0))*.039
        tube(r,'Sugar sprinkle',[p-d,p+d],[.013,.013],sprinkle_mats[i%5],6)
    return r

roots=[citrus('orange'),citrus('lime'),stone_fruit('plum'),stone_fruit('mango'),stone_fruit('peach'),donut()]
interiors={'orange':PITH,'lime':PITH,'plum':PLUM_FLESH,'mango':MANGO_FLESH,'peach':PEACH_FLESH,'donut':DONUT_CRUMB}
for parent in roots:
    name=parent.name.removeprefix('food_')
    for obj in list(parent.children):
        bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
        bpy.ops.object.convert(target='MESH');bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
    for sign,suffix in ((-1,'left'),(1,'right')):
        half=root(parent.name+'_'+suffix)
        for obj in list(parent.children):
            copy=obj.copy();copy.data=obj.data.copy();bpy.context.collection.objects.link(copy);copy.parent=half
            own=obj.data.materials[0]
            cap=interiors[name] if own in (SKIN,MATTE,DOUGH) else own
            clip(copy,sign,cap)
        if name in ('orange','lime'):citrus_interior(half,sign,name)
        elif name in ('plum','mango','peach'):add_stone(half,sign,name)

all_roots=[o for o in bpy.context.scene.objects if o.parent is None]
for parent in all_roots:
    for obj in parent.children:obj.data.transform(Matrix.Rotation(math.pi/2,4,'X'));obj.data.update()
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parent.children:obj.select_set(True)
    bpy.context.view_layer.objects.active=list(parent.children)[0];bpy.ops.object.join()
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='MATERIAL');bpy.ops.object.mode_set(mode='OBJECT')
    for obj in parent.children:
        if not obj.data.polygons:continue
        used=obj.data.materials[obj.data.polygons[0].material_index];obj.data.materials.clear();obj.data.materials.append(used)
        for p in obj.data.polygons:p.material_index=0
bpy.ops.object.select_all(action='SELECT')
output=Path(BASE)/'public/assets/typeslasher-fresh-pack.glb'
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,export_materials='EXPORT',export_apply=True,export_extras=True,export_vertex_color='MATERIAL')
bpy.ops.wm.save_as_mainfile(filepath=str(Path(BASE)/'typeslasher-fresh.blend'))
print('Fresh picks exported:',output.stat().st_size,'bytes')
