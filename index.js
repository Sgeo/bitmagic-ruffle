(function() {

    function bmcontrolHandler(url) {
        console.log("bmcontrol:", url);
        if(url === "/bmcontrol/next") {
            MAIN_ELEMENT.innerHTML = "";
        }
    }

    // The below code assumes that Ruffle implements GetURL via a <form> .submit()
    let realSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function(...args) {
        alert(this.action);
        if(this.action?.startsWith("/bmcontrol/")) {
            bmcontrolHandler(this.action);
        } else {
            realSubmit.call(this, ...args);
        }
    };

    let realOpen = window.open;
    window.open = function(...args) {
        if(args[0]?.startsWith("/bmcontrol/")) {
            bmcontrolHandler(args[0]);
        } else {
            realOpen(this, ...args);
        }
    }

    let realWindow = window;
    window = new Proxy(window, {
        set: function(obj, prop, newval) {
            console.log("Set on window");
            if(prop === "location" && newval?.startsWith?.("/bmcontrol/")) {
                bmcontrolHandler(newval);
            } else {
                realWindow[prop] = newval;
            }
        }
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