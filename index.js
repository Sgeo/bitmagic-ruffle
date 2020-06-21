(function() {

    function bmcontrolHandler(url) {
        console.log("bmcontrol:", url);
        if(url === "/bmcontrol/next") {
            setTimeout(function() {
                MAIN_ELEMENT.innerHTML = "";
            }, 0);
        }
    }

    new BroadcastChannel("bmcontrol").addEventListener("message", function(event) {
        bmcontrolHandler(event.data);
    });

    const FILE_SELECTOR = document.querySelector("#file-selector");
    const MAIN_ELEMENT = document.querySelector("#main");

    

    async function bm_to_swf(bm_file) {
        const DECODER = new TextDecoder("windows-1252");
        
        let buffer = await new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = (err) => {
                reject(err);
            };
            reader.readAsArrayBuffer(bm_file);
        });

        let view = new DataView(buffer);
        let header_size = view.getUint32(0x04, false);

        let ext = DECODER.decode(buffer.slice(0x1C, 0x1F));
        if(ext !== "swf") {
            if(ext === "dcr") alert("Sorry, Director BitGames are not supported.");
            else alert(`Sorry, unrecognized extension .${ext}.`);
            throw "Unrecognized format";
        }

        return buffer.slice(header_size);


    }

    FILE_SELECTOR.addEventListener("change", async function(e) {
        MAIN_ELEMENT.innerHTML = "";
        let ruffle = RufflePlayer.newest();
        let player = ruffle.create_player();
        MAIN_ELEMENT.appendChild(player);
        let file = this.files[0];
        if(file) {
            player.play_swf_data(await bm_to_swf(file));
        }
    });

})();