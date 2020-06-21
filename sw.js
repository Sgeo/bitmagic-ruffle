self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener("fetch", function(event) {
    if(new URL(event.request.url).pathname.startsWith("/bmcontrol/")) {
        let channel = new BroadcastChannel("bmcontrol");
        channel.postMessage(new URL(event.request.url).pathname);
        event.respondWith(Promise.resolve(new Response(null, {status: 204})));
    }
});