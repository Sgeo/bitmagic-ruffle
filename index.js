
import { SkinManager } from "./skin.js";

let skinManager = null;

const RUFFLE = RufflePlayer.newest();

let currentBMPlayer = null;

let introBM = null;

let replayTarget = null; // The most recently played non-intro file



async function intro() {
    if(currentBMPlayer) {
        currentBMPlayer.pause();
    }
    if(!introBM) {
        introBM = await fetch("Intro.bm").then(resp => resp.blob());
    }
    play_bm(introBM);
}


let paused = false;
function bmcontrolHandler(url) {
    console.log("bmcontrol:", url);
    if(url === "/bmcontrol/next" || url === "/bmcontrol/button/index") {
        intro();
    } else if(url === "/bmcontrol/button/pause") {
        if(paused) {
            currentBMPlayer?.play();
        } else {
            currentBMPlayer?.pause();
        }
        paused = !paused;
    } else if(url === "/bmcontrol/button/restart") {
        if(replayTarget) {
            play_bm(replayTarget);
        }
    } else if(url.startsWith("/bmcontrol/setskin/")) {
        let urlName = url.slice("/bmcontrol/setskin/".length);
        let name = decodeURIComponent(urlName);
        skinManager?.load_skin_by_name(name);
    }
}

new BroadcastChannel("bmcontrol").addEventListener("message", function(event) {
    bmcontrolHandler(event.data);
});

const FILE_SELECTOR = document.querySelector("#file-selector");
const MAIN_ELEMENT = document.querySelector("#main");
const SKIN_ELEMENT = document.querySelector("#skin");

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

async function play_bm(file) {
    if(!currentBMPlayer) {
        currentBMPlayer = RUFFLE.createPlayer();
        MAIN_ELEMENT.appendChild(currentBMPlayer);
    }
    if(file !== introBM) {
        replayTarget = file;
    }
    currentBMPlayer.load({data: await bm_to_swf(file)});
    if(!skinManager) {
        skinManager = new SkinManager(RUFFLE, currentBMPlayer, SKIN_ELEMENT);
        skinManager.load_skin("skins/Default.bmm");
    }
    
}

FILE_SELECTOR.addEventListener("change", function(e) {
    let file = this.files[0];
    if(file) {
        play_bm(file);
    }
});

document.body.addEventListener("dragover", function(e) {
    e.preventDefault();
});
document.body.addEventListener("drop", function(e) {
    let file = e.dataTransfer.items?.[0]?.getAsFile();
    if(file) {
        e.preventDefault();
        play_bm(file);
    }
});

intro();


