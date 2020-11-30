const FWSx = 0x46575300; // Search manually for Flash since I currently don't know how else to remove the large skin header

const SKINS = {
    "BitPlayer Small": "skins/Default.bmm",
    "BitPlayer Medium": "skins/Medium.bmm",
    "BitPlayer Large": "skins/Large.bmm",
    "Daniman": "skins/Daniman.bmm",
    "Dick and Dunn": "skins/DickDunn.bmm",
    "Leopard": "skins/Leopard.bmm",
    "Mellow Yellow": "skins/Mellow_yellow.bmm",
    "Metal skin": "skins/Metal_skin.bmm",
    "Progress from Above": "skins/PFA.bmm",
    "Sarbakan": "skins/Sarbakan.bmm",
    "Skin Template": "skins/Skin template.bmm",
    "Stamps": "skins/Stamps.bmm",
    "Watch": "skins/Watch.bmm",
    "Zebra": "skins/Zebra.bmm"
};

export class SkinManager {
    constructor(ruffle, mainPlayer, skinElement) {
        this.ruffle = ruffle;
        
        this.mainPlayer = mainPlayer;
        this.skinPlayer = ruffle.createPlayer();
        skinElement.appendChild(this.skinPlayer);

        let skinSelectorList = document.querySelector("#skin-selector ul");
        for(let [name, url] of Object.entries(SKINS)) {
            let li = document.createElement("li")
            let button = document.createElement("button");
            button.textContent = name;
            button.addEventListener("click", (e) => {
                this.load_skin(url);
            });
            li.appendChild(button);
            skinSelectorList.appendChild(li);

        }
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
            if((view.getUint32(swfIndex, false)&0xFFFFFF00)===FWSx) {
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