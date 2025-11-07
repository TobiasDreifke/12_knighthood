(function setupLevelFactory() {
    const levelFiles = [
        "level_01.js",
        "level_02.js",
        "level_03.js",
        "level_04.js",
        "level_05.js",
        "level_06.js",
        "level_07.js",
        "level_08.js",
        "level_09.js",
        "level_10.js",
    ];

    const basePath = "./levels/";
    const head = document.head || document.documentElement;

    function loadScriptSequentially(files) {
        return files.reduce((promise, file) => {
            return promise.then(() => injectScript(file));
        }, Promise.resolve());
    }

    function injectScript(file) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `${basePath}${file}`;
            script.async = false;
            script.defer = false;
            script.onload = () => resolve(file);
            script.onerror = () => reject(new Error(`Failed to load ${file}`));
            head.appendChild(script);
        });
    }

    window.LEVEL_FACTORY_READY = loadScriptSequentially(levelFiles).catch(error => {
        console.error("[LevelFactory] Failed to load level scripts", error);
        throw error;
    });
})();
