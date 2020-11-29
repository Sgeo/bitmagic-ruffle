export class SkinManager {
    constructor(ruffle, mainPlayer, skinElement) {
        this.ruffle = ruffle;
        
        this.mainPlayer = mainPlayer;
        this.skinPlayer = ruffle.createPlayer();
        skinElement.appendChild(this.skinPlayer);
    }


    load_skin_swf(url) {
        this.skinPlayer.style.width = "640px";
        this.skinPlayer.style.height = "452px";
        this.mainPlayer.style.width = "400px";
        this.mainPlayer.style.height = "300px";
        this.skinPlayer.load({url: url, autoplay: "on"});
    }
}