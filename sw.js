// Unused, needs to be installed in /sw.js, see https://github.com/Sgeo/sgeo.github.io/blob/39a0fb003ffa1a74bdc6b24257d55b6933b6a9b7/sw.js

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