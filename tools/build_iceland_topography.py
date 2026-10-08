"""Render real Natural Earth relief/coastline in an Iceland-centred projection.
Run with: python3 tools/build_iceland_topography.py
Requires numpy, scipy, Pillow. No generated/synthetic terrain is introduced.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import map_coordinates, gaussian_filter

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'assets/map-source'
geometry = json.loads((source / 'iceland-coastline.geojson').read_text())['geometry']
polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
lon0, lat0 = np.radians([-18.5, 65])

def project(ring):
    lon, lat = np.radians(np.asarray(ring)).T
    delta = lon-lon0
    k = np.sqrt(2/(1+np.sin(lat0)*np.sin(lat)+np.cos(lat0)*np.cos(lat)*np.cos(delta)))
    return np.column_stack((k*np.cos(lat)*np.sin(delta), -k*(np.cos(lat0)*np.sin(lat)-np.sin(lat0)*np.cos(lat)*np.cos(delta))))

projected = [[project(ring) for ring in polygon] for polygon in polygons]
points = np.concatenate([polygon[0] for polygon in projected])
minimum, maximum = points.min(axis=0), points.max(axis=0)
W, H = 1040, 660
scale = min((W-44)/(maximum[0]-minimum[0]), (H-44)/(maximum[1]-minimum[1]))
centre = (minimum+maximum)/2

def pixel(points):
    return (points-centre)*scale+np.array([W/2, H/2])

mask = Image.new('L', (W*3,H*3))
draw = ImageDraw.Draw(mask)
for polygon in projected:
    draw.polygon([tuple(p) for p in pixel(polygon[0])*3], fill=255)
    for hole in polygon[1:]:
        draw.polygon([tuple(p) for p in pixel(hole)*3], fill=0)

mask = mask.resize((W,H), Image.Resampling.LANCZOS)

# Inverse Lambert azimuthal equal-area projection; sample real georeferenced raster.
yy, xx = np.mgrid[:H,:W]
x=(xx-W/2)/scale+centre[0]
y=-((yy-H/2)/scale+centre[1])
rho=np.maximum(np.hypot(x,y), 1e-12)
c=2*np.arcsin(rho/2)
lat=np.arcsin(np.cos(c)*np.sin(lat0)+y*np.sin(c)*np.cos(lat0)/rho)
lon=lon0+np.arctan2(x*np.sin(c),rho*np.cos(lat0)*np.cos(c)-y*np.sin(lat0)*np.sin(c))
info=json.loads((source/'iceland-relief-georeference.json').read_text())
step=info['pixelDegrees']
rows=(info['north']-np.degrees(lat))/step-.5
cols=(np.degrees(lon)-info['west'])/step-.5
raster=np.asarray(Image.open(source/'iceland-relief-original.png').convert('RGB'), dtype=float)/255
rgb=np.stack([map_coordinates(raster[:,:,i],[rows,cols],order=1,mode='nearest') for i in range(3)],axis=2)

# Colour grading only: luminance, hillshade and snow/ice remain from the source.
luma=rgb @ np.array([.2126,.7152,.0722])
detail=luma-gaussian_filter(luma,2)
value=np.clip((luma-.48)/.5+detail*2,0,1)
dark=np.array([10,34,65]); light=np.array([55,150,166])
colour=dark+(light-dark)*value[:,:,None]
# Source snow/ice is bright, near-neutral land cover, rather than invented glacier outlines.
ice=np.clip((luma-.73)/.2,0,1)*np.clip((rgb[:,:,2]-rgb[:,:,0]+.005)/.04,0,1)
colour=colour*(1-ice[:,:,None])+np.array([207,242,251])*ice[:,:,None]
alpha=np.asarray(mask)
# Coastal highlight follows the actual land mask; it adds light, no geographic features.
edge=np.clip(alpha/255-gaussian_filter(alpha/255,1.4),0,1)
colour=np.clip(colour+edge[:,:,None]*np.array([35,70,80]),0,255)
out=np.dstack((colour.astype('uint8'),alpha))
Image.fromarray(out).save(ROOT/'assets/iceland-topography.png',optimize=True)
print('Created assets/iceland-topography.png from real relief and coastline; transparent sea.')
