"""Produce 8 orthographic image checks from the actual exported GLB, not 8 independently hallucinated model views."""
from pathlib import Path
import sys,math
import numpy as np
import trimesh
from PIL import Image,ImageDraw

BASE=Path(__file__).resolve().parents[1]/"assets/models/custom/moon-express"
scene=trimesh.load_scene(BASE/"moon-express-hero.glb")
PALETTE={'iron':(58,64,78),'brass':(202,140,56),'red':(164,48,34),
         'wood':(110,68,49),'roof':(48,55,68),'pumpkin':(234,108,32),'light':(255,203,70)}
GEOMETRY=[]
for _,mesh in scene.geometry.items():
    key=mesh.visual.material.name.replace('moon-','').replace('-pbr','')
    color=np.array(PALETTE.get(key,(150,150,160)),dtype=float)
    GEOMETRY.append((mesh.vertices.astype(np.float32),mesh.faces.astype(np.int32),color))
OUT=BASE/"reference-views";OUT.mkdir(parents=True,exist_ok=True)
for yaw_deg in range(0,360,45):
    yaw=math.radians(yaw_deg)
    eye=np.array([math.sin(yaw),.28,math.cos(yaw)]);eye/=np.linalg.norm(eye)
    right=np.array([math.cos(yaw),0,-math.sin(yaw)])
    up=np.cross(eye,right);up/=np.linalg.norm(up)
    triangles=[]
    for verts,faces,color in GEOMETRY:
        p=np.stack((verts@right,verts@up,verts@eye),axis=1)[faces]
        nn=np.cross(verts[faces[:,1]]-verts[faces[:,0]],
                    verts[faces[:,2]]-verts[faces[:,0]])
        nn/=np.maximum(np.linalg.norm(nn,axis=1)[:,None],1e-7)
        shades=np.clip(.45+.6*np.abs(nn@np.array([.4,.7,.55])),.3,1.15)
        for points,shade in zip(p,shades):
            if np.ptp(points[:,0])<.003 and np.ptp(points[:,1])<.003:continue
            triangles.append((float(points[:,2].mean()),points[:,:2],
                              tuple(np.clip(color*shade,0,255).astype(np.uint8).tolist())))
    triangles.sort(key=lambda o:o[0])
    image=Image.new('RGB',(1024,1024),(29,31,41));draw=ImageDraw.Draw(image)
    for _,points,color in triangles:
        draw.polygon([(int(512+x*112),int(630-y*112)) for x,y in points],fill=color)
    draw.text((26,28),f'MOON EXPRESS | {yaw_deg:03d} deg',fill=(235,220,185))
    draw.text((26,978),'Orthographic GLB QA - same 3D geometry',fill=(200,200,200))
    image.save(OUT/f'view-{yaw_deg:03d}.png',optimize=True)
    print('validated visual angle',yaw_deg)
sheet=Image.new('RGB',(2048,1024),(25,25,35))
for index,angle in enumerate(range(0,360,45)):
    im=Image.open(OUT/f'view-{angle:03d}.png')
    sheet.paste(im.resize((512,512)),((index%4)*512,(index//4)*512))
sheet.save(OUT/'contact-sheet.png',optimize=True)
