# Iceland home map · real geographic sources

- Relief/land cover: Natural Earth I, `NE1_HR_LC_SR.tif` (21600 × 10800,
  geographic WGS84, 1 arc-minute pixels), satellite-derived land cover and
  shaded relief. Public domain.
  https://www.naturalearthdata.com/downloads/10m-raster-data/10m-natural-earth-1/
  https://github.com/nvkelso/natural-earth-raster/blob/f04832c819e7a203d159dffe93cd9245332d6b33/10m_rasters/NE1_HR_LC_SR/NE1_HR_LC_SR.tif
- Detailed land/coastline: Natural Earth 1:10m Iceland polygon from
  `ne_10m_admin_0_countries.geojson`. Public domain.
  https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson

`iceland-relief-original.png` is the uncoloured source crop (25°W–12°W,
62°N–68°N). Pixel coordinates and raster origin are recorded in the JSON
sidecar. `iceland-coastline.geojson` contains the complete Iceland feature,
including offshore islands and polygon holes, without hand-drawn coastlines.

Rebuild: `python3 tools/build_iceland_topography.py` (Pillow, numpy, scipy).
The output is `assets/iceland-topography.png` (1040 × 660, RGBA).
The script projects the raster and coastline into Lambert azimuthal equal-area,
centred at 65°N, 18.5°W. Blue/turquoise grading preserves source hillshade;
source snow/ice gets a pale blue tone. Coastline highlighting is a stylistic
light effect following the true land mask. Sea is transparent. No invented
mountains, contours, volcano locations or AI geography are used.

This is a regional expedition illustration, not a navigation or geological
survey map. Source resolution is about 0.8 km east–west and 1.9 km north–south
at Iceland; enlarging the image adds no new geographic detail. The raster
shows the source-era ice/land cover, not live glacier extent or volcanic activity.
Only the finished local PNG is required by the app and precached offline.
