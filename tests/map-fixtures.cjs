// External services are blocked in this cloud workspace. Test their contracts,
// without presenting these synthetic geometries as verified live road routes.
module.exports=async function mapFixtures(ctx, mode=()=> 'ok'){
 await ctx.route('https://tile.openstreetmap.org/**',route=>route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==','base64')}));
 await ctx.route('https://router.project-osrm.org/**',async route=>{
   if(mode()==='error'){await route.fulfill({status:503,body:'Unavailable'});return;}
   const coords=new URL(route.request().url()).pathname.split('/').at(-1).split(';').map(point=>point.split(',').map(Number));
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({code:'Ok',routes:[{distance:123000,geometry:{type:'LineString',coordinates:coords}}]})});
 });
};
