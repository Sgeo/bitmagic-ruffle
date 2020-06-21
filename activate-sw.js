(async function() {
    let registration = await navigator.serviceWorker.register("/sw.js");
    console.log(registration);
    let update = await registration.update();
    console.log(update);
})();