let skinPlayer = null;

export function load_skin() {

}

export function load_skin_swf(ruffle, mainPlayer, skinElement, url) {
    if(!skinPlayer) {
        skinPlayer = ruffle.createPlayer();
        skinElement.appendChild(skinPlayer);
    }
    skinPlayer.style.width = "640px";
    skinPlayer.style.height = "452px";
    mainPlayer.style.width = "400px";
    mainPlayer.style.height = "300px";
    skinPlayer.load({url: url, autoplay: "on"});
}