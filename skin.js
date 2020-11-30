const FWS4 = 0x46575304; // Search manually for Flash since I currently don't know how else to remove the large skin header

export class SkinManager {
    constructor(ruffle, mainPlayer, skinElement) {
        this.ruffle = ruffle;
        
        this.mainPlayer = mainPlayer;
        this.skinPlayer = ruffle.createPlayer();
        skinElement.appendChild(this.skinPlayer);
    }

    async load_skin(url) {
        let buffer = await fetch(url).then(resp => resp.arrayBuffer());
        let view = new DataView(buffer);
        let skinWidth = view.getUint32(0x0C, true);
        let skinHeight = view.getUint32(0x10, true);
        let playerOffsetX = view.getUint32(0x14, true);
        let playerOffsetY = view.getUint32(0x18, true);
        let playerWidth = view.getUint32(0x1C, true);
        let playerHeight = view.getUint32(0x20, true);

        let swfIndex;

        for(swfIndex = 0; swfIndex < buffer.byteLength; swfIndex++) {
            if(view.getUint32(swfIndex, false)===FWS4) {
                break;
            }
        }

        let swfData = buffer.slice(swfIndex);

        this.skinPlayer.style.width = `${skinWidth}px`;
        this.skinPlayer.style.height = `${skinHeight}px`;
        this.mainPlayer.style.width = `${playerWidth}px`;
        this.mainPlayer.style.height = `${playerHeight}px`;

        this.skinPlayer.load({data: swfData});

    }
}