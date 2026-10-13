"""Deterministic Moon Express locomotive build (glTF 2.0, +Y up, +Z forward).
Original procedural meshes; AI concept illustrations are visual references, not mesh inputs.
Run: python tools/generate_moon_express.py
Dependencies: trimesh, numpy, Pillow.
"""
import json, math
from pathlib import Path
import numpy as np
from PIL import Image
import trimesh
from trimesh.transformations import rotation_matrix

BASE=Path(__file__).resolve().parents[1]/"assets/models/custom/moon-express"
BASE.mkdir(parents=True,exist_ok=True)

def pbr_textures(res,folder):
    yy,xx=np.indices((res,res),dtype=np.int32)
    delta=(12*np.sin(xx/21)+5*np.sin(yy/7)).astype(np.int16)
    edges=(xx%263<3)|(yy%511<3)
    rgb=np.empty((res,res,3),dtype=np.uint8)
    rgb[:,:,0]=np.clip(138+delta-35*edges,0,255)
    rgb[:,:,1]=np.clip(43+delta//3-12*edges,0,255)
    rgb[:,:,2]=np.clip(34+delta//4-8*edges,0,255)
    normal=np.empty_like(rgb);normal[:]=[127,127,255];normal[edges]=[133,122,252]
    orm=np.empty_like(rgb)
    orm[:,:,0]=np.where(edges,210,255)
    orm[:,:,1]=np.clip(162+(17*np.sin(xx/45)).astype(np.int16)+25*edges,0,255)
    orm[:,:,2]=200
    folder.mkdir(parents=True,exist_ok=True)
    out={}
    for name,array in [("albedo",rgb),("normal",normal),("orm",orm)]:
        target=folder/(name+".png")
        Image.fromarray(array,"RGB").save(target,optimize=True)
        out[name]=target
    return out

PREVIEW=pbr_textures(512,BASE/"embedded-pbr")
paint=trimesh.visual.material.PBRMaterial(
    name="moon-red-pbr",baseColorFactor=[255]*4,
    baseColorTexture=Image.open(PREVIEW["albedo"]).copy(),
    normalTexture=Image.open(PREVIEW["normal"]).copy(),
    occlusionTexture=Image.open(PREVIEW["orm"]).copy(),
    metallicRoughnessTexture=Image.open(PREVIEW["orm"]).copy(),
    metallicFactor=1.0,roughnessFactor=1.0)
PALETTE={
 "iron":([39,44,54,255],.92,.41),
 "brass":([190,122,44,255],.91,.30),
 "wood":([106,54,40,255],.04,.79),
 "roof":([37,42,53,255],.65,.59),
 "pumpkin":([228,88,22,255],.03,.56),
 "light":([255,170,52,255],.05,.48)}
MATS={}
for n,(color,metal,rough) in PALETTE.items():
    MATS[n]=trimesh.visual.material.PBRMaterial(
        name="moon-"+n,baseColorFactor=np.array(color,dtype=np.uint8),
        metallicFactor=float(metal),roughnessFactor=float(rough),
        emissiveFactor=[.85,.4,.12] if n=="light" else [0,0,0])
MATS["red"]=paint

class Model:
    def __init__(self,hero):
        self.hero=hero;self.scene=trimesh.Scene();self.count=0
    def add(self,object,name,mat):
        object.visual=trimesh.visual.TextureVisuals(
            uv=np.mod(object.vertices[:,[0,2]]*.17,1.0),material=MATS[mat])
        self.scene.add_geometry(object,geom_name=f"{self.count:04d}-{name}")
        self.count+=1
    def box(self,n,scale,pos,mat):
        mesh=trimesh.creation.box(extents=scale)
        mesh.apply_translation(pos);self.add(mesh,n,mat)
    def cylinder(self,n,r,h,pos,mat,axis="z",segments=None):
        mesh=trimesh.creation.cylinder(
            radius=r,height=h,sections=segments or (96 if self.hero else 32))
        if axis=="y":mesh.apply_transform(rotation_matrix(-math.pi/2,[1,0,0]))
        elif axis=="x":mesh.apply_transform(rotation_matrix(math.pi/2,[0,1,0]))
        mesh.apply_translation(pos);self.add(mesh,n,mat)
    def ring(self,n,major,minor,pos,mat,axis="z"):
        mesh=trimesh.creation.torus(
            major_radius=major,minor_radius=minor,
            major_sections=96 if self.hero else 28,
            minor_sections=12 if self.hero else 6)
        if axis=="y":mesh.apply_transform(rotation_matrix(-math.pi/2,[1,0,0]))
        elif axis=="x":mesh.apply_transform(rotation_matrix(math.pi/2,[0,1,0]))
        mesh.apply_translation(pos);self.add(mesh,n,mat)
    def sphere(self,n,r,pos,mat,subdivisions=None):
        mesh=trimesh.creation.icosphere(
            subdivisions=subdivisions if subdivisions is not None
            else (2 if self.hero else 1),radius=r)
        mesh.apply_translation(pos);self.add(mesh,n,mat)
    def rod(self,n,a,b,r,mat):
        a=np.asarray(a);b=np.asarray(b);v=b-a
        mesh=trimesh.creation.cylinder(
            radius=r,height=float(np.linalg.norm(v)),
            sections=14 if self.hero else 8)
        mesh.apply_transform(trimesh.geometry.align_vectors([0,0,1],v))
        mesh.apply_translation((a+b)/2);self.add(mesh,n,mat)
    def build(self):
        self.box("chassis",(2.45,.36,6.2),(0,.72,0),"iron")
        self.box("cowcatcher",(2.3,.20,.42),(0,.43,3.38),"brass")
        for x in np.linspace(-1,1,9):
            self.rod("cowcatcher-rail",[x,.1,3.65],[x,.68,3.1],.055,"iron")
        self.cylinder("boiler",.84,3.8,(0,1.75,.7),"red",segments=144 if self.hero else 48)
        for z in [-1.06,-.25,.64,1.52,2.52]:
            self.ring("boiler-band",.85,.053,(0,1.75,z),"brass")
        self.cylinder("front-rim",.98,.17,(0,1.75,2.68),"iron")
        self.cylinder("pumpkin-face",.83,.08,(0,1.75,2.80),"pumpkin")
        for x in [-.33,.33]:self.sphere("lantern-eye",.19,(x,1.89,2.855),"light")
        self.sphere("lantern-nose",.09,(0,1.60,2.864),"light",1)
        for i in range(7):
            self.box("lantern-grin",(.16,.07,.04),((i-3)*.19,1.43+abs(i-3)*.024,2.88),"light")
        self.cylinder("chimney",.24,1.0,(0,2.86,1.93),"iron","y")
        self.cylinder("chimney-flare",.38,.3,(0,3.40,1.93),"iron","y")
        self.ring("chimney-rim",.34,.055,(0,3.56,1.93),"brass","y")
        for z in [.35,-.65]:
            self.cylinder("steam-dome",.25,.45,(0,2.76,z),"brass","y")
            self.sphere("steam-cap",.27,(0,3.03,z),"brass")
        # Keep passenger cabin open at the +Z end for the ride camera.
        self.box("cabin-floor",(2.32,.16,2),(0,.84,-2.02),"wood")
        self.box("cabin-roof",(2.65,.2,2.18),(0,3.06,-2.04),"roof")
        for x in [-1.15,1.15]:
            for z in [-2.91,-1.08]:
                self.box("cabin-post",(.14,2.08,.14),(x,1.97,z),"wood")
            self.box("cabin-side",(.15,.38,2),(x,1.16,-2.02),"wood")
            self.box("cabin-brass-rail",(.15,.12,2),(x,2.9,-2.02),"brass")
            self.box("window-light",(.2,.27,.2),(x,2.45,-1.09),"light")
        self.box("cabin-rear",(2.32,.58,.13),(0,1.16,-3.03),"wood")
        self.box("passenger-bench",(1.60,.16,.6),(0,1.16,-2.25),"wood")
        for side in [-1,1]:
            x=side*1.11
            for z in [-2.62,-1.45,-.24,1.03,2.23]:
                self.cylinder("drive-wheel",.48,.19,(x,.50,z),"iron","x",96 if self.hero else 28)
                self.ring("wheel-flange",.47,.07,(x+side*.13,.50,z),"brass","x")
                for index in range(12 if self.hero else 6):
                    theta=math.tau*index/(12 if self.hero else 6)
                    self.rod("wheel-spoke",(x+side*.24,.50,z),
                        (x+side*.25,.50+math.sin(theta)*.43,z+math.cos(theta)*.43),.038,"red")
                self.cylinder("wheel-hub",.15,.26,(x+side*.16,.50,z),"brass","x",
                              36 if self.hero else 12)
            self.rod("driving-rod",(x+side*.22,.50,-2.65),
                     (x+side*.22,.50,2.28),.07,"brass")
        for side in [-1,1]:
            for z in [-1.12,.4,1.91]:
                self.rod("boiler-pipe-upright",(side*.97,1.33,z),
                         (side*.97,2.45,z),.045,"brass")
            self.rod("boiler-pipe-long",(side*.97,2.37,-1.05),
                     (side*.97,2.37,2.55),.044,"brass")
        for z in [-1.05,-.25,.64,1.52,2.52]:
            for i in range(32 if self.hero else 8):
                a=math.tau*i/(32 if self.hero else 8)
                self.sphere("individual-rivet",.046,
                    (.90*math.cos(a),1.75+.90*math.sin(a),z),"brass",
                    1 if self.hero else 0)
        for s in [-1,1]:
            for z in np.arange(-2.87,-1.06,.28):
                self.sphere("cabin-rivet",.036,(s*1.23,2.87,float(z)),"brass",
                            1 if self.hero else 0)
        for x in [-1,1]:
            self.cylinder("front-headlamp-base",.15,.25,(x,1.36,2.85),"brass")
            self.sphere("front-headlamp",.18,(x,1.36,3.0),"light")
        return sum(len(part.faces) for part in self.scene.geometry.values())

hi=Model(hero=True);faces=hi.build()
assert faces>=20000,(faces,"hero model must be >=20,000 triangles")
lo=Model(hero=False);low_faces=lo.build()
for model,name in [(hi,"moon-express-hero.glb"),(lo,"moon-express-mobile.glb")]:
    data=model.scene.export(file_type="glb")
    assert data[:4]==b"glTF"
    (BASE/name).write_bytes(data)
maps=pbr_textures(4096,BASE/"textures-4k")
report={
    "id":"moon-express-locomotive","generator":"original procedural geometry",
    "coordinates":"+Y up; +Z forward","hero":{"triangles":faces,"parts":hi.count},
    "mobile":{"triangles":low_faces,"parts":lo.count},
    "maps":{"resolution":4096,"colorSpace":{"albedo":"sRGB","normal":"linear","orm":"linear"},
        "packing":{"occlusion":"R","roughness":"G","metallic":"B"},
        "files":{k:str(v.relative_to(BASE)) for k,v in maps.items()}},
    "qa":{"geometryVerified":True,"pbrMapsGenerated":True,
          "eightViewImagesVerified":False,"liveWebGLVerified":False,
          "rigged":False,"collisionProxyVerified":False},
}
(BASE/"model-report.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps(report))
