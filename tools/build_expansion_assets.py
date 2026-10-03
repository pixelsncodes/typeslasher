"""Reference-led, edible whole and complementary cut models for the three new baskets.

Run in Blender with PACK set to garden, market, or pantry. Author Y-up, bake Z-up.
Reference sheets are in design/food-expansion. Geometry, baked interior textures,
and editable material names are preserved in each independent .blend source.
"""
from pathlib import Path
import bpy, bmesh, math, random, json
from mathutils import Vector, Matrix, noise
BASE=Path(__file__).resolve().parent.parent
PACK=globals().get('PACK','garden')
NAMES={'garden':['tomato','cucumber','pepper','radish','beet','mushroom','zucchini','onion'],
       'market':['lemon','raspberry','blueberry','cherry','fig','pomegranate','dragonfruit','apricot'],
       'pantry':['bread','cheese','bagel','croissant','tofu','potato','pumpkin','celery']}[PACK]
# A new scene leaves the saved kitchen source and any open scene intact.
scene=bpy.data.scenes.new('Typeslasher '+PACK+' reference models')
bpy.context.window.scene=scene
for old in list(bpy.data.scenes):
    if old!=scene and old.name.startswith('Typeslasher '):
        for obj in list(old.objects):bpy.data.objects.remove(obj,do_unlink=True)
        bpy.data.scenes.remove(old)
bpy.data.orphans_purge(do_recursive=True)
helper=Path(__file__).with_name('remodel_food_assets.py')
helper_text=helper.read_text(encoding='utf8').split('\nroots=[builder()')[0]
helper_text=helper_text.replace("p=m.node_tree.nodes.get('Principled BSDF')","p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')")
exec(compile(helper_text,str(helper),'exec'))
BASE=Path(BASE)
random.seed(147)
CREAM=mat(PACK+' pale flesh','f7edc9',.65)
DARK=mat(PACK+' tiny dark seeds','24251b',.56)
REDSEED=mat('Ruby pomegranate arils','a90b2d',.23,.26)
PIT=mat('Stone fruit carved pit','97613b',.82)
GILL=mat('Mushroom umber gills','775b42',.76)
RIB=mat('Celery fine pale ribs','bfd78b',.63)
PAINT=mat('Painted '+PACK+' sculpted skin','ffffff',.43,.1,True)
BAKE=mat('Painted bakery crust','ffffff',.62,.06,True)

def sculpt(parent,name,scale,dark,light,shape=None,segments=64,rings=36,material=PAINT):
    o=ellipsoid(parent,name,(0,0,0),scale,material,segments,rings,
        lambda p,j,i:mix(color(dark),color(light),max(0,min(1,.48+.14*p.y+.17*noise.noise(p*19)+.12*noise.noise(p*4)))))
    if shape:
        for v in o.data.vertices:v.co=shape(v.co)
    return o

def stemleaf(r,y,leaf_end=None,green=False):
    tube(r,'Curved botanical stem',[(0,y,0),(.025,y+.14,0),(.11,y+.27,.025)],[.037,.029,.018],LEAF if green else STEM,8)
    if leaf_end:leaf(r,'Fresh botanical leaf',(.03,y+.12,0),leaf_end,.16,serration=.06)

def crown(r,y,radius=.35,number=5):
    for i in range(number):
        a=TAU*i/number;leaf(r,'Pointed calyx',(0,y,0),(radius*math.cos(a),y-.12,radius*math.sin(a)),.065)

def body(name):
    r=root('food_'+name)
    if name=='tomato':
        sculpt(r,'Lobed tomato skin',(.88,.79,.88),'ad261b','ed4e32',lambda p:Vector((p.x*(1+.032*math.cos(6*math.atan2(p.z,p.x))),p.y-.10*math.exp(-((p.x*p.x+p.z*p.z)/.09)) if p.y>0 else p.y,p.z*(1+.032*math.cos(6*math.atan2(p.z,p.x))))))
        crown(r,.86,.51,6);stemleaf(r,.72,green=True)
    elif name in ('cucumber','zucchini'):
        cucumber=name=='cucumber'
        sculpt(r,name+' slender ridged skin',(.40,1.35,.40),'24532a','7d9a36',lambda p:p*(1+.025*math.cos(9*math.atan2(p.z,p.x))+.004*noise.noise(p*55)))
        if cucumber:
            for i in range(110):
                y=random.uniform(-1.1,1.1);a=random.random()*TAU;rad=.402*math.sqrt(max(.01,1-(y/1.35)**2))
                ellipsoid(r,'Cucumber raised speckle',(rad*math.cos(a),y,rad*math.sin(a)),(.014,.022,.014),RIB,8,4)
        tube(r,'Vegetable cut stem',[(0,1.29,0),(.03,1.51,0)],[.085,.07],LEAF,10)
    elif name in ('pepper','pumpkin'):
        pumpkin=name=='pumpkin'; lobes=10 if pumpkin else 4
        # Closed outer/inner profile forms a real hollow shell. Cutting reveals
        # cavity walls, rather than a dark disk pasted onto a solid sphere.
        pts=[(.02,-.82),(.40,-.88),(.78,-.59),(.94,-.12),(.92,.44),(.70,.77),(.25,.73),(.12,.64),(.27,.56),(.60,.61),(.76,.35),(.77,-.10),(.60,-.55),(.26,-.65),(.02,-.62)]
        if pumpkin:pts=[(rr*1.04,yy*.91) for rr,yy in pts]
        o=profile(r,'Hollow ribbed '+name,pts,PAINT,lambda p,a,t:mix(color('c35c13' if pumpkin else 'db9704'),color('f59c24' if pumpkin else 'ffdb37'),.42+.16*math.cos(a)+.10*noise.noise(p*18)),80,3)
        for v in o.data.vertices:
            a=math.atan2(v.co.z,v.co.x); factor=1+(.055 if pumpkin else .13)*math.cos(lobes*a);v.co.x*=factor;v.co.z*=factor
        tube(r,name+' curved green stem',[(0,.63,0),(.05,.91,0),(.17,1.08,.04)],[.095,.073,.048],STEM if pumpkin else LEAF,12)
    elif name in ('radish','beet'):
        beet=name=='beet'; sculpt(r,'Tapered '+name+' root',(.78,.78,.77),'59122d' if beet else 'b91c46','a94752' if beet else 'ed5577',lambda p:Vector((p.x*(1+.14*p.y),p.y,p.z*(1+.14*p.y))))
        tube(r,'Fine root tail',[(0,-.7,0),(.07,-.93,0),(.23,-1.13,.025)],[.09,.036,.004],STEM if beet else CREAM,9)
        for i in range(4):
            x=(i-1.5)*.13;end=(x*2,1.18+(i%2)*.2,.06)
            tube(r,'Leaf stalk',[(x,.69,0),(x*1.5,1,0),end],[.035,.027,.012],mat('Beet burgundy stalk','822638',.65) if beet else LEAF,7)
            if not beet:leaf(r,'Radish serrated leaf',(x*.9,.89,0),(x*2.7,1.54,.12),.16,serration=.22)
    elif name=='onion':
        profile(r,'Layered red onion skin',[(.01,-.85),(.24,-.80),(.62,-.58),(.87,-.1),(.82,.30),(.59,.58),(.25,.80),(.08,1.03),(.01,1.1)],PAINT,lambda p,a,t:mix(color('63233d'),color('c46a8c'),.40+.14*math.sin(47*a+3*p.y)+.13*noise.noise(p*5)),72,4)
        for i in range(8):
            a=TAU*i/8;tube(r,'Dry onion root',[(.12*math.cos(a),-.78,.12*math.sin(a)),(.19*math.cos(a),-.95,.17*math.sin(a))],[.014,.003],STEM,5)
        for i in range(3):tube(r,'Dry onion neck',[(0,.91,0),((i-1)*.12,1.25,(i%2)*.04)],[.038,.009],STEM,7)
    elif name=='mushroom':
        profile(r,'Continuous mushroom cap and stalk',[(.01,-.87),(.27,-.86),(.26,-.35),(.26,.02),(.72,.06),(.87,.26),(.82,.52),(.61,.76),(.26,.88),(.01,.90)],PAINT,lambda p,a,t:mix(color('a98158'),color('f0dfbe'),.35+.17*noise.noise(p*23)+(.45 if p.y<.04 else .02)),72,4)
        for i in range(54):
            a=TAU*i/54;tube(r,'Fine underside gill',[(.28*math.cos(a),.065,.28*math.sin(a)),(.69*math.cos(a),.075,.69*math.sin(a)),(.81*math.cos(a),.18,.81*math.sin(a))],[.009,.012,.006],GILL,4)
    elif name=='lemon':
        sculpt(r,'Pebbled lemon peel',(.81,1.02,.80),'d79909','f6da3d',lambda p:Vector((p.x,p.y*(1+.10*abs(p.y)**4),p.z))*(1+.004*noise.noise(p*80)))
        ellipsoid(r,'Lemon blossom tip',(0,-1.1,0),(.07,.06,.07),PAINT,16,8,lambda p,j,i:color('ddba27'))
        stemleaf(r,1.07,(.47,1.39,.06),True)
    elif name=='raspberry':
        # Individual drupelets arranged on an open cup; the top is genuinely hollow.
        for j in range(7):
            y=-.72+j*.205;rad=.22+.40*math.sin((j+1)/9*math.pi);count=round(rad*34)
            for i in range(count):
                a=TAU*(i+(j%2)*.5)/count
                ellipsoid(r,'Raspberry hollow cup drupelet',(rad*math.cos(a),y,rad*math.sin(a)),(.135,.14,.135),PAINT,14,8,lambda p,k,l:mix(color('a92243'),color('ed6175'),.45+.12*p.y))
        ellipsoid(r,'Raspberry closed cup base',(0,-.78,0),(.21,.12,.21),PAINT,16,10,lambda p,j,i:color('b8324e'))
    elif name=='blueberry':
        sculpt(r,'Blueberry waxy bloom',(.82,.70,.82),'263950','8292b6',lambda p:Vector((p.x,p.y-.12*math.exp(-(p.x*p.x+p.z*p.z)/.12) if p.y>0 else p.y,p.z)))
        calyx=mat('Blueberry dusky crown','33435a',.7)
        for i in range(5):
            a=TAU*i/5;u=Vector((math.cos(a),0,math.sin(a)));v=Vector((-math.sin(a),0,math.cos(a)))
            start=Vector((0,.61,0));points=[start+u*.10-v*.055,start+u*.10+v*.055,start+u*.29+Vector((0,.13,0))]
            o=mesh(r,'Blueberry calyx point',points,[(0,1,2)],calyx);m=o.modifiers.new('Calyx thickness','SOLIDIFY');m.thickness=.012
    elif name in ('cherry','apricot'):
        cherry=name=='cherry';sculpt(r,'Stone fruit '+name+' skin',(.84,.79,.82),'711227' if cherry else 'e37829','d7434d' if cherry else 'ffd06b',lambda p:Vector((p.x,p.y-.095*math.exp(-(p.x*p.x+p.z*p.z)/.08) if p.y>0 else p.y,p.z*(1-.025*math.exp(-(p.x/.05)**2)))))
        if cherry:tube(r,'Long arched cherry stem',[(0,.67,0),(.05,1.13,0),(.30,1.55,.03),(.49,1.68,.05)],[.025,.022,.020,.016],LEAF,8)
        else:stemleaf(r,.69)
    elif name=='fig':
        profile(r,'Fig tapered neck',[(.01,-.82),(.36,-.85),(.70,-.63),(.82,-.21),(.71,.19),(.49,.50),(.25,.80),(.10,.99),(.01,1.04)],PAINT,lambda p,a,t:mix(color('493552'),color('968155'),.27+.17*math.sin(21*a+p.y)+.20*max(0,p.y)),72,4)
        stemleaf(r,1.0)
    elif name=='pomegranate':
        sculpt(r,'Pomegranate leathery skin',(.90,.86,.90),'a42332','e96d61',lambda p:Vector((p.x*(1+.015*math.cos(6*math.atan2(p.z,p.x))),p.y,p.z)))
        crownmat=mat('Pomegranate russet crown','ba583b',.65)
        for i in range(6):
            a=TAU*i/6;tube(r,'Pomegranate pointed crown',[(.13*math.cos(a),.78,.13*math.sin(a)),(.19*math.cos(a),1.05,.19*math.sin(a)),(.29*math.cos(a),1.18,.29*math.sin(a))],[.07,.047,.002],crownmat,8)
    elif name=='dragonfruit':
        sculpt(r,'Dragon fruit magenta rind',(.76,1.08,.75),'a71f60','ee6591')
        for row in range(5):
            y=-.75+row*.38;radius=.76*math.sqrt(1-(y/1.09)**2)
            for i in range(6):
                a=TAU*(i+(row%2)*.5)/6;start=(radius*math.cos(a),y,radius*math.sin(a));end=((radius+.20)*math.cos(a),y+.40,(radius+.20)*math.sin(a))
                leaf(r,'Dragon fruit green tipped scale',start,end,.095,LEAF)
    elif name in ('bread','potato'):
        bread=name=='bread'
        produce=sculpt(r,'Rustic loaf crust' if bread else 'Russet potato skin',(.74,1.12,.66),'a56c29' if bread else '886638','eec07b' if bread else 'cda46c',lambda p:p*(1+.022*noise.noise(p*6)),material=BAKE if bread else MATTE)
        if bread:
            for j in range(3):
                y=-.48+j*.48;pts=[]
                for i in range(25):
                    x=-.47+.94*i/24;yy=y+.20*(i/24-.5)
                    pts.append((x,yy,.66*math.sqrt(1-(x/.74)**2-(yy/1.12)**2)+.017))
                cutter=tube(r,'Temporary bread scoring cutter',pts,[.037*math.sin(math.pi*(i+.5)/25)**.45 for i in range(25)],CREAM,10)
                mod=produce.modifiers.new('Carve baked loaf score','BOOLEAN')
                assert 'DIFFERENCE' in mod.bl_rna.properties['operation'].enum_items.keys()
                mod.operation='DIFFERENCE';mod.object=cutter
                bpy.context.view_layer.objects.active=produce;bpy.ops.object.modifier_apply(modifier=mod.name)
                bpy.data.objects.remove(cutter,do_unlink=True)
        else:
            eye=mat('Potato tiny eyes','795d38',.78)
            for i in range(20):
                y=random.uniform(-.91,.91);a=random.random()*TAU;rr=math.sqrt(1-(y/1.12)**2)
                ellipsoid(r,'Russet eye',(rr*.743*math.cos(a),y,rr*.663*math.sin(a)),(.026,.035,.022),eye,10,5)
    elif name in ('cheese','tofu'):
        bpy.ops.mesh.primitive_cube_add(size=2);o=bpy.context.object;o.name='Golden cheese wedge' if name=='cheese' else 'Soft tofu block';o.parent=r;o.scale=(.75,.82,.62)
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        if name=='cheese':
            for v in o.data.vertices:v.co.z+=.25*v.co.y;v.co.x*=.72 if v.co.y>0 else 1
        m=o.modifiers.new('Soft handmade edges','BEVEL');m.width=.065 if name=='tofu' else .035;m.segments=3
        o.data.materials.append(mat(name+' solid surface','f3cd6a' if name=='cheese' else 'f0e9d3',.62))
        # Fine embedded surface speckles, restrained at the play scale.
        speck=mat(name+' surface pores','cfad59' if name=='cheese' else 'd5cdb7',.8)
        for i in range(65):
            x=random.uniform(-.63,.63);y=random.uniform(-.72,.72);z=.623+(.25*y if name=='cheese' else 0)
            if name=='cheese':x*=.8
            s=random.uniform(.007,.016);ellipsoid(r,'Small '+name+' pore',(x,y,z),(s,s*.75,.002),speck,8,4)
    elif name=='bagel':
        # Torus lies in the XY plane, with a through-hole that remains open after cuts.
        verts=[];faces=[];colors=[];N=72;M=24
        for i in range(N):
            a=TAU*i/N
            for j in range(M):
                b=TAU*j/M;rr=.64+.30*math.cos(b);p=Vector((rr*math.cos(a),rr*math.sin(a),.28*math.sin(b)))
                verts.append(p);colors.append(mix(color('ad672c'),color('e8af59'),.40+.16*noise.noise(p*35)+.18*abs(math.sin(b))))
        for i in range(N):
            for j in range(M):faces.append((i*M+j,((i+1)%N)*M+j,((i+1)%N)*M+(j+1)%M,i*M+(j+1)%M))
        mesh(r,'Bagel with true open center',verts,faces,BAKE,colors)
        sesame=mat('Toasted sesame seeds','e7d09a',.72)
        for i in range(60):
            a=random.random()*TAU;rr=random.uniform(.47,.8);z=.28*math.sqrt(max(0,1-((rr-.64)/.30)**2))
            ellipsoid(r,'Bagel sesame seed',(rr*math.cos(a),rr*math.sin(a),z+.01),(.012,.032,.009),sesame,8,4)
    elif name=='croissant':
        verts=[];faces=[];colors=[];N=64;M=24
        for j in range(N+1):
            t=j/N;a=-1.32+t*2.64;center=Vector((1.0*math.sin(a),.42-.88*math.cos(a),0));n=Vector((math.sin(a),-math.cos(a),0));rad=.032+.37*math.sin(math.pi*t)**.75
            # Rolling layers make a crescent, with tapered tips and a ridged crust.
            layer=1+.042*math.cos(13*math.pi*t)
            for i in range(M):
                b=TAU*i/M;p=center+rad*layer*(n*math.cos(b)+Vector((0,0,.88*math.sin(b))));verts.append(p)
                colors.append(mix(color('92501f'),color('e8aa4c'),.46+.16*noise.noise(p*24)+.18*math.cos(13*math.pi*t)))
        for j in range(N):
            for i in range(M):a=j*M+i;b=j*M+(i+1)%M;faces.append((a,a+M,b+M,b))
        faces.extend([tuple(reversed(range(M))),tuple(N*M+i for i in range(M))]);mesh(r,'Laminated crescent croissant',verts,faces,BAKE,colors)
    elif name=='celery':
        # Single U-section rib following the corrected individual reference.
        verts=[];faces=[];N=40;M=32
        for j in range(N+1):
            t=j/N;y=-1.2+2.4*t;curve=.13*math.sin(t*math.pi);w=.30*(1-.28*t)
            for i in range(M):
                # Outer semicircle and inset inner semicircle joined at channel lips.
                outer=i<M//2;a=math.pi*(i/(M//2-1) if outer else 1-(i-M//2)/(M//2-1));radius=w if outer else w*.72
                verts.append((radius*math.cos(a),y,curve+radius*math.sin(a)))
        for j in range(N):
            for i in range(M):a=j*M+i;b=j*M+(i+1)%M;faces.append((a,b,b+M,a+M))
        faces.extend([tuple(reversed(range(M))),tuple(N*M+i for i in range(M))]);mesh(r,'Celery open crescent channel',verts,faces,mat('Celery tender green rib','a8c96d',.55))
        for i in range(9):
            a=math.pi*i/8;pts=[(.30*(1-.28*j/16)*math.cos(a),-1.2+2.4*j/16,.13*math.sin(j/16*math.pi)+.30*(1-.28*j/16)*math.sin(a)+.006) for j in range(17)]
            tube(r,'Celery lengthwise fiber',pts,[.007]*len(pts),RIB,4)
        for i in range(3):leaf(r,'Celery leafy sprig',(0,1.12,.07),((i-1)*.34,1.55,.12),.13,serration=.25)
    return r

def pixel(name,y,z):
    """Baked cross-section anatomy in the common cut plane, not generic skin caps."""
    n=noise.noise(Vector((y*48,z*48,1.7)));a=math.atan2(z,y)
    if name in ('cucumber','zucchini'):
        t=math.sqrt((y/1.35)**2+(z/.40)**2);c=mix(color('edf2c3'),color('abc474'),max(0,(t-.74)*3))
        # Longitudinal rows of small pale seeds along the narrow core.
        for s in (-1,1):
            sy=round(y/.19)*.19;d=((y-sy)/.055)**2+((z-s*.085)/.024)**2
            if d<1 and abs(y)<1.03:c=mix(color('b6be74'),color('faf4d0'),.7+.2*d)
    elif name=='tomato':
        t=math.hypot(y/.79,z/.88);a=math.atan2(z/.88,y/.79);locule=(.5+.5*math.cos(5*a))
        c=color('ef7050')
        if .20<t<.79 and locule>.26:c=mix(color('b73626'),color('dc9a47'),.27+.12*n)
        if t>.91:c=color('b92720')
        for i in range(5):
            aa=TAU*i/5
            for k in range(4):
                r=.43+.08*(k%2);az=aa+(k-1.5)*.18;d=((y/.79-r*math.cos(az))/.033)**2+((z/.88-r*math.sin(az))/.025)**2
                if d<1:c=color('f3d48b')
    elif name in ('radish','potato','blueberry','tofu','cheese'):
        base={'radish':'f5f2df','potato':'f2e5b1','blueberry':'e0e8cc','tofu':'f3ecdb','cheese':'efd172'}[name];c=color(base)
        if name=='blueberry':
            t=math.hypot(y/.70,z/.82);c=mix(c,color('b4679c'),max(0,(t-.77)*3))
            for sy,sz in [(.12,.02),(-.07,.10),(-.08,-.09)]:
                if ((y-sy)/.015)**2+((z-sz)/.01)**2<1:c=color('bcaf70')
        if name in ('tofu','cheese'):
            cell=(math.sin(y*177+math.sin(z*66)*2)*math.sin(z*151))
            c=mix(c,color('c9bc97' if name=='tofu' else 'c59c40'),max(0,(cell-.81)*2.8))
    elif name in ('beet','onion'):
        t=math.hypot(y/(.92 if name=='onion' else .78),z/(.81 if name=='onion' else .77))
        if name=='onion':
            # Fine purple membranes surrounding pale concentric layers.
            ring=max(0,(math.cos(t*65+.6*math.sin(a*2))-.77)/.23)
            c=mix(color('f8e9e6'),color('9b3564'),ring*.76)
        else:c=mix(color('671128'),color('cb405c'),.18+.45*max(0,math.cos(t*54+.4*math.sin(a*3)))**8)
    elif name=='lemon':
        t=math.hypot(y/1.06,z/.80);a=math.atan2(z/.80,y/1.06)
        if t>.92 or t<.085:c=color('f2e8ae')
        else:
            membrane=max(0,(math.cos(a*10)-.987)/.013)
            fiber=(.5+.5*math.sin(a*164+t*37))**8
            c=mix(color('ebbd27'),color('f8dc62'),.36+.24*fiber)
            c=mix(c,color('f5e9b8'),membrane*.8)
    elif name in ('cherry','apricot'):
        apricot=name=='apricot';t=math.hypot(y/.79,z/.82)
        c=mix(color('ed9a37' if apricot else 'a3223b'),color('ffd174' if apricot else 'db5062'),.36+.06*n)
        pit=math.sqrt((y/.34)**2+(z/.22)**2)
        if pit<1.1:c=mix(c,color('b76b2a' if apricot else '6d1725'),.68*max(0,1-pit/1.15))
    elif name=='fig':
        t=math.hypot((y+.12)/.89,z/(.78*max(.35,1-.36*max(0,y))))
        c=color('f2dfad') if t>.89 else mix(color('ab3553'),color('ee9c8c'),.30+.10*n)
        fiber=max(0,math.cos(a*38+t*14))**10
        if t<.85:c=mix(c,color('f6c88c'),fiber*.53)
    elif name=='dragonfruit':
        t=math.hypot(y/1.08,z/.75);c=color('f5eee6') if t<.92 else color('d62c70')
        if t<.87:
            yy=round(y/.09)*.09;zz=round(z/.085)*.085
            oy=.025*math.sin(yy*917+zz*373);oz=.026*math.cos(yy*513-zz*791)
            if ((y-yy-oy)/.013)**2+((z-zz-oz)/.009)**2<1:c=color('27272b')
    elif name=='pomegranate':
        t=math.hypot(y/.86,z/.90);c=color('f3deb7')
        # White membranes between five irregular chambers of ruby arils.
        if t<.85 and t>.13 and abs(math.sin(a*2.5+.16*math.sin(t*8)))>.16:c=color('a62639')
    elif name in ('bread','bagel','croissant'):
        c=mix(color('f0ddaf'),color('d7bf90'),.12+.08*n)
        cellular=noise.noise(Vector((y*24,z*24,4.78)))
        if cellular>.23:c=mix(color('ad9167'),color('e2cfa4'),max(0,1-(cellular-.23)/.35))
        if name=='croissant':c=mix(c,color('c2a277'),max(0,math.cos(math.hypot(y+.44,z)*125))**12*.26)
    elif name in ('pepper','pumpkin'):c=color('ffcd48' if name=='pepper' else 'f9a33a')
    elif name=='mushroom':
        c=mix(color('f1e7d3'),color('d5c7a9'),.13+.04*n)
        if .07<y<.17 and .29<abs(z)<.77:c=mix(color('71563f'),color('ac8f69'),.35+.2*math.sin(z*110))
    elif name=='raspberry':c=mix(color('dd6573'),color('f3b7ad'),.13+.12*n)
    else:c=color('d6e5b1')
    return (*mix(c,color('ffffff'),.015*(n+1)),1)

def cutmat(name):
    # Packed PNG textures are actual portable material detail, not Blender-only nodes.
    im=bpy.data.images.new(name+' anatomical cut texture',width=256,height=256,alpha=True)
    data=[]
    for j in range(256):
        z=(j/255*2-1)*1.65
        for i in range(256):data.extend(pixel(name,(i/255*2-1)*1.65,z))
    im.pixels.foreach_set(data);im.update();im.pack()
    m=mat(name+' detailed cut flesh','ffffff',.54)
    p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im
    m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color']);return m

def clean(o):
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH');bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    if bm.calc_volume(signed=True)<0:bmesh.ops.reverse_faces(bm,faces=list(bm.faces))
    bm.to_mesh(o.data);bm.free()

def split(o,r,sign,material):
    bm=bmesh.new();bm.from_mesh(o.data)
    bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,plane_co=(0,0,0),plane_no=(1,0,0),clear_outer=sign<0,clear_inner=sign>0)
    if not bm.faces:bm.free();return
    edges=[e for e in bm.edges if e.is_boundary and all(abs(v.co.x)<.00001 for v in e.verts)]
    caps=bmesh.ops.holes_fill(bm,edges=edges,sides=0).get('faces',[]) if edges else []
    uv=bm.loops.layers.uv.verify()
    for f in caps:
        f.material_index=len(o.data.materials);f.smooth=False
        for l in f.loops:l[uv].uv=((l.vert.co.y/1.65+1)/2,(l.vert.co.z/1.65+1)/2)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    if bm.calc_volume(signed=True)<0:bmesh.ops.reverse_faces(bm,faces=list(bm.faces))
    data=bpy.data.meshes.new(o.name+' complementary cut');bm.to_mesh(data);bm.free()
    for m in o.data.materials:data.materials.append(m)
    data.materials.append(material)
    copy=bpy.data.objects.new(o.name+' half',data);bpy.context.collection.objects.link(copy);copy.parent=r

roots=[]
for name in NAMES:
    r=body(name);roots.append(r)
    for o in list(r.children):clean(o)
    cm=cutmat(name)
    for sign,suffix in ((-1,'left'),(1,'right')):
        half=root(r.name+'_'+suffix);roots.append(half)
        for o in list(r.children):
            material=o.data.materials[0]
            exterior_only=any(s in o.name.lower() for s in ['stem','leaf','calyx','crown','root tail','dry onion neck','seed','eye','pore','fiber','speckle','gill'])
            split(o,half,sign,material if exterior_only else cm)
        if name in ('cherry','apricot') and sign<0:
            pit=ellipsoid(half,'Single intact stone',(-.018,0,0),(.14,.30,.19),PIT,32,20)
            # A small raised cut detail makes the single retained stone visible.
            for v in pit.data.vertices:v.co.x=min(.008,v.co.x+.045)
            for j in range(7):
                z=(j-3)*.035;tube(half,'Carved stone groove',[(.009,-.20,z),(.011,0,z),(.009,.20,z)],[.003,.004,.002],STEM,5)
        if name=='pomegranate':
            for i in range(85):
                a=i*2.39996;rr=.16+.63*math.sqrt((i+.5)/85);y=.86*rr*math.cos(a);z=.90*rr*math.sin(a)
                if abs(math.sin(a*2.5+.16*math.sin(rr*8)))<.18:continue
                seed=ellipsoid(half,'Ruby aril in white chamber',(-sign*.003,y,z),(.033,.070,.053),REDSEED,12,8)
                for v in seed.data.vertices:v.co.x=sign*max(-.024,sign*v.co.x)
        if name in ('pepper','pumpkin'):
            membrane=mat(name+' seed membrane','ece3b3',.63)
            for j in range(18 if name=='pumpkin' else 23):
                y=-.40+j*.045 if name=='pumpkin' else .43-(j//5)*.055;z=(j%5-2)*.052
                ellipsoid(half,name+' cavity seed',(sign*(.16+(j%3)*.065),y,z),(.033,.053,.023),CREAM,10,6)
            tube(half,'Inner seed placenta',[(sign*.13,.55,0),(sign*.16,.17,0),(sign*.22,-.32,0)],[.10,.09,.04],membrane,12)

# Bake coordinates and merge by material to keep runtime draw calls modest.
report={}
for r in roots:
    for o in list(r.children):clean(o);o.data.transform(Matrix.Rotation(math.pi/2,4,'X'));o.data.update()
    bpy.ops.object.select_all(action='DESELECT');children=list(r.children)
    for o in children:o.select_set(True)
    bpy.context.view_layer.objects.active=children[0];bpy.ops.object.join()
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='MATERIAL');bpy.ops.object.mode_set(mode='OBJECT')
    for o in list(r.children):
        used=o.data.materials[o.data.polygons[0].material_index];o.data.materials.clear();o.data.materials.append(used)
        for f in o.data.polygons:f.material_index=0
        o.name=r.name+' '+used.name
    report[r.name]={'triangles':sum(sum(len(f.vertices)-2 for f in o.data.polygons) for o in r.children),
                    'materials':[o.data.materials[0].name for o in r.children]}
bpy.ops.object.select_all(action='DESELECT')
for r in roots:
    r.select_set(True)
    for o in r.children:o.select_set(True)
output=BASE/f'public/assets/typeslasher-{PACK}-pack.glb'
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,export_materials='EXPORT',export_apply=True,export_extras=True,export_vertex_color='MATERIAL')
for r in roots:
    coll=bpy.data.collections.new(r.name);scene.collection.children.link(coll)
    for o in [r]+list(r.children):
        for old in list(o.users_collection):old.objects.unlink(o)
        coll.objects.link(o);o.hide_set(r.name!='food_'+NAMES[0])
# Keep only this asset scene in the saved source. Other open scenes were untouched
# during authoring, and their original .blend files remain separately saved.
for other in list(bpy.data.scenes):
    if other!=scene:bpy.data.scenes.remove(other)
reference={'garden':'salad','market':'fruit','pantry':'pantry'}[PACK]
for filename in [reference+'-whole-and-cut.png']+(['celery-whole-and-cut.png'] if PACK=='pantry' else []):
    im=bpy.data.images.load(str(BASE/'design/food-expansion'/filename),check_existing=True);im.use_fake_user=True;im.pack()
scene['reference_folder']='design/food-expansion';scene['foods']=','.join(NAMES)
bpy.data.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/f'typeslasher-{PACK}.blend'))
(BASE/'art-review'/f'{PACK}-mesh-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'pack':PACK,'foods':NAMES,'bytes':output.stat().st_size,'roots':len(roots)}))
