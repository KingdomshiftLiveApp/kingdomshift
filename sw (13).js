// Robust SW: never blocks loading. Network-first with fast fallback.
const CACHE='ks-live-2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const ks=await caches.keys();
    await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    try{
      const resp=await fetch(e.request);
      if(resp&&resp.status===200&&e.request.url.startsWith('http')){
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      }
      return resp;
    }catch(err){
      const cached=await caches.match(e.request);
      return cached||Response.error();
    }
  })());
});
