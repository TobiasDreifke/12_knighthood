/**
 * Immediately loads the initial batch of level scripts sequentially so they exist before the world boots.
 */
(function setupLevelFactory() {
    const levelFiles = [
        "level_01.js",
        "level_02.js",
        "level_03.js",
        "level_04.js",
        "level_05.js",
    ];

    const basePath = "./levels/";
    const head = document.head || document.documentElement;

    /**
     * Loads each level script in order to preserve dependency expectations.
     *
     * @param {string[]} files
     * @returns {Promise<void>}
     */
    function loadScriptSequentially(files) {
        return files.reduce((promise, file) => {
            return promise.then(() => injectScript(file));
        }, Promise.resolve());
    }

    /**
     * Injects a `<script>` tag for a specific level file and resolves when it finishes loading.
     *
     * @param {string} file
     * @returns {Promise<string>}
     */
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
