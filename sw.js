const CACHE='dmspx-live-nav-v4';
const CORE=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;

  const url=new URL(e.request.url);

  const isMap=
  url.hostname.includes('opentopomap.org') ||
  url.hostname.includes('newaydata.com') ||
  url.hostname.includes('nwy-tiles-api.prod.newaydata.com');

  if(isMap){
    e.respondWith(
      caches.open(CACHE).then(async cache=>{
        const saved=await cache.match(e.request);

        try{
          const online=await fetch(e.request);
          if(online && (online.ok || online.type==='opaque')){
            await cache.put(e.request,online.clone());
          }
          return online;
        }catch(err){
          if(saved) return saved;
          throw err;
        }
      })
    );
    return;
  }

  e.respondWith(
    fetch(e.request).catch(()=>caches.match(e.request))
  );
});
