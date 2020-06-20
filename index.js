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

    const FILE_SELECTOR = document.querySelector("#file-selector");
    const MAIN_ELEMENT = document.querySelector("#main");

    FILE_SELECTOR.addEventListener("change", function(e) {
        MAIN_ELEMENT.innerHTML = "";
        let ruffle = RufflePlayer.newest();
        let player = ruffle.create_player();
        MAIN_ELEMENT.appendChild(player);
        let file = this.files[0];
        if(file) {
            let reader = new FileReader();
            reader.onload = function() {
                player.play_swf_data(reader.result);
            };
            reader.readAsArrayBuffer(file);
        }
    });

})();