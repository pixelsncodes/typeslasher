"""Independent snack and long-word packs, using the same Blender asset pipeline."""
from pathlib import Path
import sys
helper=Path(__file__).with_name('build_fresh_assets.py')
exec(compile(helper.read_text(encoding='utf8').split('\nroots=[citrus(')[0],str(helper),'exec'))
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
pack=args[0] if args else 'snacks'
assert pack in ('snacks','big')
random.seed(108 if pack=='snacks' else 209)
EGG=mat('Egg shell','eee7d5',.72);WHITE=mat('Egg white interior','fff5d9',.48)
YOLK=mat('Egg golden yolk','e9aa22',.72)
BREAD=mat('Painted baked bread','ffffff',.7,0,True)
SOFT_BREAD=mat('Soft bread crumb','edcd94',.8)
PAPER=mat('Painted paper wrapper','ffffff',.9,0,True)
PAPER_EDGE=mat('Paper cut edge','eee3cd',.85)
FILLING=mat('Berry pie filling','9c2b45',.37,.14)
GOLD=mat('Painted pineapple skin','ffffff',.53,.04,True)
CREAM_GREEN=mat('Fresh green interior','b1d281',.64)
DARK_GREEN=mat('Broccoli cut florets','438245',.72)
BROCCOLI_FLESH=mat('Painted broccoli interior','ffffff',.75,0,True)
CHEESE=mat('Cheddar cheese','eec349',.5)
TOMATO=mat('Tomato filling','d94c35',.38)
AVOCADO_FLESH=mat('Painted avocado flesh','ffffff',.57,0,True)
MELON_FLESH=mat('Painted watermelon flesh','ffffff',.46,.08,True)
STRAW_FLESH=mat('Painted strawberry flesh','ffffff',.48,.06,True)
PINE_FLESH=mat('Painted pineapple flesh','ffffff',.52,.04,True)
PINE_RIND=mat('Pineapple golden rind edge','ad843d',.7)

def baked(p,j=0,i=0):return mix(color('a66327'),color('edbb6f'),.56+.13*noise.noise(p*17)+.12*p.z)
def box(parent,name,location,scale,material,bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1,location=location);o=bpy.context.object;o.name=name;o.parent=parent;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
    if bevel:
        m=o.modifiers.new('Soft baked corners','BEVEL');m.width=bevel;m.segments=3
    return o
def disc(parent,name,sign,ry,rz,material,shade,center_y=0,depth=.007):
    N=96;R=14;verts=[];colors=[];faces=[]
    for j in range(R+1):
        t=max(.0001,j/R)
        for i in range(N):
            a=TAU*i/N;p=Vector((-sign*depth,center_y+ry*t*math.cos(a),rz*t*math.sin(a)))
            verts.append(p);colors.append(shade(p,t,a))
    for j in range(R):
        for i in range(N):
            a=j*N+i;b=j*N+(i+1)%N;f=(a,b,b+N,a+N);faces.append(f if sign>0 else tuple(reversed(f)))
    return mesh(parent,name,verts,faces,material,colors)
def paint_object(o,shade=baked):
    attr=o.data.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT')
    for v,c in zip(o.data.vertices,attr.data):c.color=(*shade(v.co),1)

def egg():
    r=root('food_egg');o=ellipsoid(r,'Intact egg shell',(0,0,0),(.68,.94,.68),EGG,64,40)
    for v in o.data.vertices:v.co.x*=1-.17*v.co.y;v.co.z*=1-.17*v.co.y
    return r
def pie():
    r=root('food_pie')
    profile(r,'Pie crust',[(.001,-.43),(.70,-.43),(.88,-.28),(.96,.18),(.92,.29),(.001,.29)],BREAD,lambda p,a,t:baked(p),64,3)
    ellipsoid(r,'Berry filling under lattice',(0,.30,0),(.83,.04,.83),FILLING,48,12)
    for direction in (0,1):
        for j in range(-3,4):
            offset=j*.22;half=math.sqrt(max(0,.82**2-offset**2))
            o=box(r,'Woven golden pie lattice',(0,.34+direction*.025,offset) if direction==0 else (offset,.34+direction*.025,0),(half*2,.06,.085) if direction==0 else (.085,.06,half*2),BREAD,.025);paint_object(o)
    pts=[(.91*math.cos(TAU*i/96),.30+.027*math.sin(32*TAU*i/96),.91*math.sin(TAU*i/96)) for i in range(97)]
    o=tube(r,'Crimped pie edge',pts,[.08]*97,BREAD,10);paint_object(o)
    return r
def muffin():
    r=root('food_muffin')
    profile(r,'Baked muffin',[(.001,-.87),(.45,-.87),(.56,-.4),(.64,.02),(.85,.14),(.87,.36),(.70,.65),(.40,.81),(.001,.86)],BREAD,lambda p,a,t:baked(p),64,3,.025)
    verts=[];faces=[];colors=[];N=80
    for j in range(2):
        for i in range(N):
            a=TAU*i/N;rad=(.49 if j==0 else .685)+.012*(i%2)
            verts.append((rad*math.cos(a),-.88+j*.9,rad*math.sin(a)));colors.append(color('936037' if i%2 else 'c48f58'))
    for i in range(N):faces.append((i,(i+1)%N,(i+1)%N+N,i+N))
    o=mesh(r,'Pleated muffin paper',verts,faces,PAPER,colors);m=o.modifiers.new('Paper thickness','SOLIDIFY');m.thickness=.008
    for i in range(15):
        a=random.random()*TAU;rad=random.uniform(.2,.69);y=.84-.6*rad*rad
        ellipsoid(r,'Muffin chocolate chip',(rad*math.cos(a),y,rad*math.sin(a)),(.07,.06,.065),CHOCOLATE,12,8)
    return r
def waffle():
    r=root('food_waffle');o=box(r,'Golden waffle base',(0,0,0),(1.8,1.8,.16),BREAD,.09);paint_object(o)
    for side in (-1,1):
        for i in range(6):
            n=-.85+i*.34
            for direction in (0,1):
                o=box(r,'Waffle grid ridge',(n,0,side*.115) if direction==0 else (0,n,side*.115),(.085,1.77,.15) if direction==0 else (1.77,.085,.15),BREAD,.025);paint_object(o)
    return r
def pretzel():
    r=root('food_pretzel')
    controls=[(-.56,-.59,.08),(-.2,-.25,.20),(.27,.27,.20),(.55,.65,0),(.86,.6,0),(1,.15,0),(.80,-.43,0),(.36,-.70,0),(-.36,-.70,0),(-.80,-.43,0),(-1,.15,0),(-.86,.6,0),(-.55,.65,0),(-.27,.27,-.17),(.2,-.25,-.17),(.56,-.59,.07)]
    points=[]
    for j in range(len(controls)-1):
        a,b,c,d=[Vector(controls[k]) for k in (max(0,j-1),j,j+1,min(len(controls)-1,j+2))]
        for k in range(7):
            t=k/7;points.append(.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
    points.append(Vector(controls[-1]));o=tube(r,'Twisted baked pretzel',points,[.14]*len(points),BREAD,16)
    paint_object(o,lambda p:mix(color('8f4318'),color('cf853b'),.5+.15*noise.noise(p*9)))
    salt=mat('Pretzel salt','fff1cd',.7)
    for i in range(34):
        p=points[(i*17)%len(points)]+Vector((random.uniform(-.06,.06),random.uniform(-.04,.04),.137))
        box(r,'Salt crystal',p,(.028,.025,.018),salt,.003)
    return r
def popcorn_piece(parent,p,scale):
    center=Vector(p)
    o=ellipsoid(parent,'Popped corn',center,(.18*scale,.16*scale,.18*scale),BREAD,20,12,lambda p,j,i:mix(color('dfbb72'),color('fff0bd'),.70+.14*p.y))
    for v in o.data.vertices:
        d=v.co-center;a=math.atan2(d.z,d.x)
        v.co=center+d*(1+.16*math.sin(a*3+.7)+.12*noise.noise(d*23))
def popcorn():
    r=root('food_popcorn');verts=[];colors=[];faces=[];N=20
    for side in range(4):
        base=len(verts)
        for row in range(2):
            size=.54+row*.19;y=-.95+row*1.23
            for i in range(N+1):
                t=-1+2*i/N;x=t*size;z=size
                p=Matrix.Rotation(side*math.pi/2,4,'Y')@Vector((x,y,z));verts.append(p);colors.append(color('e6535b' if (i//2)%2 else 'fff0d0'))
        for i in range(N):faces.append((base+i,base+i+1,base+N+2+i,base+N+1+i))
    o=mesh(r,'Striped popcorn carton',verts,faces,PAPER,colors);m=o.modifiers.new('Carton wall thickness','SOLIDIFY');m.thickness=.025
    box(r,'Carton base',(0,-.94,0),(1.09,.04,1.09),PAPER_EDGE,.01)
    for layer in range(3):
        for i in range(3):
            for j in range(3):popcorn_piece(r,((i-1)*(.34+layer*.035),-.40+layer*.38+random.uniform(-.025,.025),(j-1)*(.34+layer*.035)),random.uniform(.9,1.05))
    for i in range(5):popcorn_piece(r,(random.uniform(-.35,.35),.52,random.uniform(-.35,.35)),1.1)
    return r

def avocado():
    r=root('food_avocado')
    o=profile(r,'Bumpy avocado skin',[(.001,-.98),(.30,-.96),(.66,-.70),(.76,-.30),(.68,.14),(.44,.62),(.30,.88),(.001,1)],MATTE,lambda p,a,t:mix(color('183d24'),color('467345'),.4+.24*noise.noise(p*36)),72,4)
    for v in o.data.vertices:v.co*=1+.006*noise.noise(v.co*60)
    return r
def broccoli():
    r=root('food_broccoli');stem=mat('Broccoli stalk','80af61',.63)
    tube(r,'Broccoli main stalk',[(0,-1.05,0),(0,-.45,0),(0,.20,0)],[.22,.27,.20],stem,14)
    for i,(x,y,z,s) in enumerate([(-.55,.30,0,.46),(.48,.32,0,.49),(0,.62,0,.54),(0,.38,-.4,.40)]):
        tube(r,'Broccoli branch',[(0,-.35,0),(x*.55,.02,z*.55),(x,y,z)],[.13,.12,.1],stem,10)
        ellipsoid(r,'Broccoli crown',(x,y,z),(s,s*.72,s),MATTE,20,12,lambda p,j,k:mix(color('235c30'),color('4e904a'),.5+.15*p.y))
        for k in range(25):
            theta=math.acos(1-2*(k+.5)/25);phi=k*2.4
            d=Vector((math.sin(theta)*math.cos(phi),math.cos(theta)*.72,math.sin(theta)*math.sin(phi)))*s
            ellipsoid(r,'Broccoli florets',Vector((x,y,z))+d,(.115,.105,.115),MATTE,10,7,lambda p,j,l:mix(color('286234'),color('60984d'),.5+.2*p.y))
    return r
def triangular_layer(parent,name,z,thickness,material,inset=0):
    xy=[(-.92+inset,-.78+inset),(.92-inset,-.78+inset),(-.92+inset,1.02-inset)]
    verts=[(x,y,z+d*thickness/2) for d in (-1,1) for x,y in xy]
    o=mesh(parent,name,verts,[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],material)
    m=o.modifiers.new('Soft sandwich edges','BEVEL');m.width=.045;m.segments=3
    return o
def sandwich():
    r=root('food_sandwich');crust=mat('Bread crust','b77b3f',.75)
    for z in (-.25,.25):
        triangular_layer(r,'Sandwich bread crust',z,.28,crust)
        triangular_layer(r,'Sandwich bread face',z+(1 if z>0 else -1)*.143,.025,SOFT_BREAD,.065)
    triangular_layer(r,'Cheese triangle',-.07,.10,CHEESE,.02)
    triangular_layer(r,'Lettuce triangle',.015,.10,LEAF,-.035)
    for x,y in [(-.55,-.32),(-.45,.30),(.1,-.42)]:ellipsoid(r,'Tomato slice',(x,y,.075),(.34,.34,.065),TOMATO,24,12)
    for i in range(16):
        x=random.uniform(-.78,.45);y=random.uniform(-.65,.7)
        if x+y<.1:ellipsoid(r,'Bread crumb pore',(x,y,.408),(.016,.013,.002),crust,8,4)
    return r
def pineapple():
    r=root('food_pineapple');N=160;M=88;verts=[];faces=[];colors=[]
    # A continuous embossed rind: raised hexagonal eyes, recessed seams,
    # and small brown centers survive both rotation and a genuine bisect.
    for j in range(M+1):
        t=math.pi*j/M;y=-.15+.88*math.cos(t)
        for i in range(N):
            a=TAU*i/N;u=i/N*14;v=(y+1.03)/1.76*10
            candidates=[]
            for row in range(math.floor(v)-1,math.floor(v)+2):
                dx=(u-(row%2)*.5+.5)%1-.5;dy=(v-row)*.84
                d=max(abs(dx),abs(dx)*.5+abs(dy)*.866)/.5
                candidates.append((d,dx,dy,row))
            d,dx,dy,row=min(candidates);d=min(1,d)
            ridge=max(0,1-d**5);eye=math.exp(-((dx/.09)**2+(dy/.105)**2))
            radius=.68*max(0,math.sin(t))**.48*(1+.035*math.cos(t))
            radius+=(.038*ridge-.014*eye)*math.sin(t)
            p=Vector((radius*math.cos(a),y,radius*math.sin(a)));verts.append(p)
            c=mix(color('625528'),color('d8a13b'),min(1,ridge*1.3))
            c=mix(c,color('f0bd55'),max(0,.25+.24*dy)+.07*noise.noise(p*39))
            c=mix(c,color('6a4123'),eye*.85)
            colors.append(c)
    for j in range(M):
        for i in range(N):
            a=j*N+i;b=j*N+(i+1)%N;faces.append((a,b,b+N,a+N))
    mesh(r,'Embossed pineapple eyes and rind',verts,faces,GOLD,colors)
    crown=mat('Painted pineapple crown','ffffff',.58,.02,True)
    # Three overlapping whorls of narrow, cupped blades, with a central fold.
    for layer,count in enumerate((9,8,6)):
        for i in range(count):
            a=TAU*(i+.37*layer)/count;out=Vector((math.cos(a),0,math.sin(a)));side=Vector((-math.sin(a),0,math.cos(a)))
            verts=[];faces=[];colors=[];L=12;W=4
            reach=(.79,.51,.25)[layer]*(1+.08*math.sin(i*4.1));height=(.48,.85,1.13)[layer]*(1+.055*math.cos(i*2.3))
            for j in range(L+1):
                t=j/L;center=out*(.055+reach*t**1.45)+Vector((0,.61+height*(1.25*t-.25*t*t),0))
                width=(.10,.09,.073)[layer]*math.sin(math.pi*(.10+.90*t))**.8
                for k in range(W+1):
                    q=k/W*2-1;p=center+side*q*width+Vector((0,.038*(1-q*q)*math.sin(math.pi*t),0))
                    verts.append(p);shade=.22+.26*t+.16*abs(q)+.07*math.sin(i*2.1)
                    colors.append(mix(color('164d38'),color('8da64d'),shade))
            for j in range(L):
                for k in range(W):
                    b=j*(W+1)+k;faces.append((b,b+1,b+W+2,b+W+1))
            o=mesh(r,'Curved pineapple crown blade',verts,faces,crown,colors)
            solid=o.modifiers.new('Leaf thickness','SOLIDIFY');solid.thickness=.009
    return r

def pineapple_interior(parent,sign):
    N=128;R=20;verts=[];faces=[];colors=[]
    for j in range(R+1):
        t=max(.0001,j/R)
        for i in range(N):
            a=TAU*i/N;y=-.15+.845*math.cos(a)*t
            z=.65*math.copysign(abs(math.sin(a))**.48,math.sin(a))*t
            p=Vector((-sign*.009,y,z));verts.append(p)
            core=math.exp(-(abs(z)/.105)**6)
            fibers=.5+.5*math.sin(z*210+.8*math.sin(y*18))
            flesh=mix(color('e8b039'),color('f8d57a'),.42+.12*fibers+.07*noise.noise(p*48))
            colors.append(mix(flesh,color('f4e3b1'),core*.83))
    for j in range(R):
        for i in range(N):
            a=j*N+i;b=j*N+(i+1)%N;f=(a,b,b+N,a+N);faces.append(f if sign>0 else tuple(reversed(f)))
    mesh(parent,'Pineapple juicy flesh and fibrous core',verts,faces,PINE_FLESH,colors)
def strawberry_point(t,a):
    radius=.91*max(0,math.sin(t))**.82*(.78+.22*math.cos(t))
    y=.82*math.cos(t)-(.095*math.exp(-(radius/.23)**2) if t<math.pi/2 else 0)
    return Vector((radius*math.cos(a),y,radius*math.sin(a)))

def strawberry():
    r=root('food_strawberry');N=72;M=44;verts=[];faces=[];colors=[]
    point=strawberry_point
    for j in range(M+1):
        for i in range(N):
            p=point(math.pi*j/M,TAU*i/N);verts.append(p);colors.append(mix(color('c9243c'),color('f45960'),.55+.08*noise.noise(p*8)))
    for j in range(M):
        for i in range(N):a=j*N+i;b=j*N+(i+1)%N;faces.append((a,b,b+N,a+N))
    mesh(r,'Heart shaped strawberry',verts,faces,SKIN,colors)
    seedmat=mat('Strawberry golden seeds','dfb858',.55)
    for row in range(8):
        t=.43+row*.29;count=max(6,round(16*math.sin(t)))
        for i in range(count):
            a=TAU*(i+(row%2)*.5)/count;p=point(t,a);n=Vector((math.cos(a),0,math.sin(a)))
            seed=ellipsoid(r,'Strawberry seed',p+n*.006,(.018,.030,.012),seedmat,10,6)
            seed.data.transform(Matrix.Translation(p)@Matrix.Rotation(math.pi/2-a,4,'Y')@Matrix.Translation(-p))
    for i in range(6):
        a=TAU*i/6;leaf(r,'Strawberry crown',(0,.78,0),(.57*math.cos(a),.63,.57*math.sin(a)),.14,normal=(0,1,0))
    tube(r,'Strawberry stem',[(0,.74,0),(.07,1.0,0)],[.04,.025],LEAF,8)
    return r
def watermelon():
    r=root('food_watermelon')
    def shade(p,j,i):
        a=math.atan2(p.z,p.y);stripe=(.5+.5*math.sin(11*a+1.2*p.x+.22*math.sin(p.x*18)))**3
        return mix(color('245533'),color('8db455'),.1+.75*stripe+.05*noise.noise(p*38))
    ellipsoid(r,'Striped whole watermelon',(0,0,0),(1.12,.79,.80),MATTE,80,48,shade)
    for sign in (-1,1):ellipsoid(r,'Watermelon dry end',(sign*1.115,0,0),(.014,.06,.06),STEM,16,8)
    return r

builders=[egg,pie,muffin,waffle,pretzel,popcorn] if pack=='snacks' else [avocado,broccoli,sandwich,pineapple,strawberry,watermelon]
pineapple_only='--only-pineapple' in args
if pineapple_only:
    assert pack=='big'
    builders=[pineapple]
roots=[builder() for builder in builders]
for parent in roots:
    name=parent.name.removeprefix('food_')
    if name=='broccoli':
        # One continuous edible volume prevents intersecting disks and exposed
        # internal branch triangles when the crown is sliced.
        bpy.ops.object.select_all(action='DESELECT')
        for obj in parent.children:obj.select_set(True)
        bpy.context.view_layer.objects.active=list(parent.children)[0];bpy.ops.object.join();obj=bpy.context.object
        obj.name='Continuous broccoli crown and stalk'
        m=obj.modifiers.new('Merge florets and stalk','REMESH');m.mode='VOXEL';m.voxel_size=.047;m.use_smooth_shade=True
        bpy.ops.object.modifier_apply(modifier=m.name)
        m=obj.modifiers.new('Efficient broccoli surface','DECIMATE');m.ratio=.55;bpy.ops.object.modifier_apply(modifier=m.name)
        obj.data.materials.clear();obj.data.materials.append(MATTE)
        for p in obj.data.polygons:p.material_index=0;p.use_smooth=True
        for attribute in list(obj.data.color_attributes):obj.data.color_attributes.remove(attribute)
        paint_object(obj,lambda p:mix(color('89b568'),color('36723b'),max(0,min(1,(p.y+.12)/.35))*(.87+.1*noise.noise(p*21))))
    for obj in list(parent.children):
        bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
        bpy.ops.object.convert(target='MESH');bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        if name=='pie':obj.data.transform(Matrix.Rotation(.42,4,'X'))
        bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
    for sign,suffix in ((-1,'left'),(1,'right')):
        half=root(parent.name+'_'+suffix)
        for obj in list(parent.children):
            copy=obj.copy();copy.data=obj.data.copy();bpy.context.collection.objects.link(copy);copy.parent=half;own=obj.data.materials[0]
            cap=own
            if own==PAPER:cap=PAPER_EDGE
            elif own in (BREAD,):cap=SOFT_BREAD
            elif name=='egg':cap=WHITE
            elif name=='pineapple' and own==GOLD:cap=PINE_RIND
            elif name in ('avocado','watermelon','pineapple','strawberry') and own in (MATTE,SKIN,GOLD):cap=PITH
            elif name=='broccoli':cap=BROCCOLI_FLESH
            clip(copy,sign,cap)
        if name=='egg':
            disc(half,'Egg yolk cut',sign,.34,.34,YOLK,lambda p,t,a:color('e9aa22'),center_y=-.12)
        elif name=='pie':
            verts=[Matrix.Rotation(.42,4,'X')@Vector((-sign*.008,y,z)) for y,z in [(-.32,-.69),(-.32,.69),(.24,.79),(.24,-.79)]]
            mesh(half,'Visible pie filling',verts,[(0,1,2,3) if sign<0 else (3,2,1,0)],FILLING)
        elif name=='avocado':
            # Follow the pear-shaped boundary rather than placing a circular cut on it.
            for obj in list(half.children):
                if obj.type!='MESH' or 'skin' not in obj.name:continue
                points=[v.co.copy() for v in obj.data.vertices if abs(v.co.x)<.0001]
                if points:
                    points.sort(key=lambda p:math.atan2(p.z,p.y))
                    center=sum(points,Vector())/len(points);verts=[Vector((-sign*.007,center.y,center.z))];colors=[color('e1db92')]
                    for p in points:verts.append(Vector((-sign*.007,p.y*.96,p.z*.94)));colors.append(color('91b850'))
                    faces=[(0,i+1,(i+1)%len(points)+1) for i in range(len(points))]
                    o=mesh(half,'Avocado creamy flesh',verts,faces,AVOCADO_FLESH,colors)
                    if sum(f.normal.x for f in o.data.polygons)*(-sign)<0:
                        bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
            disc(half,'Avocado stone cut',sign,.34,.32,PIT,lambda p,t,a:mix(color('774526'),color('b87e43'),.4+.2*noise.noise(p*30)),center_y=-.30,depth=.014)
        elif name=='pineapple':
            pineapple_interior(half,sign)
        elif name=='watermelon':
            disc(half,'Watermelon pink interior',sign,.72,.73,MELON_FLESH,lambda p,t,a:mix(color('de3548'),color('f67a80'),.18+.1*noise.noise(p*31)))
            for i in range(24):
                a=TAU*i/24;rad=.45+(i%3)*.065
                ellipsoid(half,'Watermelon seed',(-sign*.019,math.cos(a)*rad,math.sin(a)*rad),(.009,.028,.017),SEED,10,6)
        elif name=='strawberry':
            verts=[];faces=[];colors=[];N=80;R=12
            for j in range(R+1):
                t=max(.0001,j/R)
                for i in range(N):
                    a=TAU*i/N;p=strawberry_point(math.acos(math.cos(a)),math.pi/2)
                    y=p.y*.97*t;z=math.copysign(p.z,math.sin(a))*.95*t
                    verts.append((-sign*.008,y,z));core=math.exp(-(z/(.05+.14*max(0,y+.8)))**2)
                    colors.append(mix(color('ed626c'),color('f6c6a8'),core*.72))
            for j in range(R):
                for i in range(N):a=j*N+i;b=j*N+(i+1)%N;f=(a,b,b+N,a+N);faces.append(f if sign>0 else tuple(reversed(f)))
            mesh(half,'Strawberry soft core',verts,faces,STRAW_FLESH,colors)

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
if pineapple_only:
    # Reuse the saved meshes for the other five foods without remodeling them.
    for material in list(bpy.data.materials):
        if material.users==0:bpy.data.materials.remove(material)
    with bpy.data.libraries.load(str(Path(BASE)/'typeslasher-big.blend'),link=False) as (old,loaded):
        loaded.objects=old.objects
    for obj in loaded.objects:
        top=obj
        while top.parent:top=top.parent
        if not top.name.startswith('food_pineapple'):
            bpy.context.collection.objects.link(obj)
    for obj in loaded.objects:
        if not obj.users_collection:bpy.data.objects.remove(obj,do_unlink=True)
    # Appended objects are local; release the source-library handle before save.
    for library in list(bpy.data.libraries):bpy.data.libraries.remove(library)
bpy.ops.object.select_all(action='SELECT')
output=Path(BASE)/f'public/assets/typeslasher-{pack}-pack.glb'
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,export_materials='EXPORT',export_apply=True,export_extras=True,export_vertex_color='MATERIAL')
bpy.ops.wm.save_as_mainfile(filepath=str(Path(BASE)/f'typeslasher-{pack}.blend'))
print(pack,'exported:',output.stat().st_size,'bytes')
