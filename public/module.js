window.Module = {
    preRun: [],
    postRun: [],
    print: (function() {
        var element = document.getElementById("output");
        if (element) element.value = ""; // clear browser cache
        return function(text) {
            if (arguments.length > 1)
                text = Array.prototype.slice.call(arguments).join(" ");
            // These replacements are necessary if you render to raw HTML
            //text = text.replace(/&/g, "&amp;");
            //text = text.replace(/</g, "&lt;");
            //text = text.replace(/>/g, "&gt;");
            //text = text.replace('\n', '<br>', 'g');
            console.log(text);
            if (element) {
                element.value += text + "\n";
                element.scrollTop = element.scrollHeight; // focus on bottom
            }
        };
    })(),
    printErr: function(text) {
        if (arguments.length > 1)
            text = Array.prototype.slice.call(arguments).join(" ");
        console.error(text);
    },
    get canvas() {
        return document.getElementById("canvas");
    },
    setStatus: function(text) {
        console.log("setStatus:", text);
    },
    totalDependencies: 0,
    monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        Module.setStatus(
            left
                ? "Preparing... (" +
                      (this.totalDependencies - left) +
                      "/" +
                      this.totalDependencies +
                      ")"
                : "All downloads complete."
        );
    }
};

Module.setStatus("Downloading...");

window.onerror = function(event) {
    // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
    Module.setStatus("Exception thrown, see JavaScript console");
    Module.setStatus = function(text) {
        if (text) Module.printErr("[post-exception status] " + text);
    };
};
