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

    function read_bm_meta(decoder, view) {
        let index = 0x18;
        function read_bm_string() {
            let string_size = view.getUint32(index, false);
            index += 4;
            let string = decoder.decode(view.buffer.slice(index, index + string_size));
            index += string_size;
            return string;
        }
        let extension = read_bm_string();
        let name = read_bm_string();
        let note = read_bm_string();
        let edition = view.getUint32(index, false);
        return {extension, name, note, edition};
    }

    function show_bm_meta(meta) {
        document.getElementById("name").textContent = meta.name;
        document.getElementById("note").textContent = meta.note;
        document.getElementById("edition").textContent = meta.edition;
        document.getElementById("extension").textContent = meta.extension;
    }

    

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

        let meta = read_bm_meta(DECODER, view);
        show_bm_meta(meta);

        let ext = meta.extension;
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
        let player = ruffle.createPlayer();
        MAIN_ELEMENT.appendChild(player);
        let file = this.files[0];
        if(file) {
            player.load({data: await bm_to_swf(file)});
        }
    });

})();