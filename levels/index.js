/**
 * Registers all available level builder factories once the loader signals readiness.
 */
(function initializeGameLevels() {
    const registerLevels = () => {
        const builders = [
            createLevel01,
            createLevel02,
            createLevel03,
            createLevel04,
            createLevel05,
        ].filter(fn => typeof fn === "function");

        window.GAME_LEVEL_BUILDERS = builders;
        window.GAME_LEVELS = builders.map(builder => builder());
    };

    const readiness = window.LEVEL_FACTORY_READY;
    if (readiness && typeof readiness.then === "function") {
        readiness.then(registerLevels).catch(error => {
            console.error("[LevelFactory] Unable to initialize levels", error);
        });
    } else {
        registerLevels();
    }
})();
