let canvas;
let world;
let keyboard = new KeyboardMapping()
let pressedKey = [];
let orientationPauseActive = false;
let touchControlsManager = null;
let fullscreenWrapper = null;
const coarsePointerQuery = window.matchMedia
    ? window.matchMedia("(pointer: coarse)")
    : {
        matches: false,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
    };

document.addEventListener("DOMContentLoaded", () => {
    if (typeof AudioHub !== "undefined") {
        AudioHub.resetSoundControls();
    }
});

/**
 * Bootstraps the game initialization logic once the level scripts are ready.
 */
function init() {
    canvas = document.getElementById("canvas");
    /**
     * Creates the world once all level scripts have been loaded.
     */
    const startGame = () => {
        if (!canvas) return;
        const initialLevelIndex = 0;
        AudioHub.ensureInteractionUnlock();
        world = new World(canvas, keyboard, initialLevelIndex);

        setupStartButton();
        setupSoundControls();
        setupPauseMenu();
        setupFullscreenToggle();
        setupCanvasHudButtons();
        touchControlsManager = setupTouchControls();
        setupOrientationGuard();
        setupImpressumModal();
        setupRestartButtons();
    };

    const readiness = window.LEVEL_FACTORY_READY;
    if (readiness && typeof readiness.then === "function") {
        readiness.then(startGame).catch(error => {
            console.error("[LevelFactory] Unable to bootstrap game", error);
        });
    } else {
        startGame();
    }
}


/**
 * Applies a boolean state to each keyboard action (except PAUSE).
 *
 * @param {string[]} actions
 * @param {boolean} state
 */
function setKeyboardActionsState(actions, state) {
    actions.forEach(action => {
        if (action === "PAUSE") return;
        if (Object.prototype.hasOwnProperty.call(keyboard, action)) {
            keyboard[action] = state;
        }
    });
}

/**
 * Resets the current world, stats, and inputs without reloading the page.
 */
function restartGame(options = {}) {
    const {
        autoStart = true,
        showStartScreen: shouldShowStartScreen = false,
    } = options;
    if (!canvas) return;
    hidePauseOverlay();
    const currentWorld = world;
    orientationPauseActive = false;
    touchControlsManager?.releaseAll();
    resetKeyboardState();
    AudioHub.stopAll();
    if (currentWorld && typeof currentWorld.destroy === "function") {
        currentWorld.destroy();
    }
    world = new World(canvas, keyboard, 0);
    if (shouldShowStartScreen) {
        showStartScreen();
        return;
    }
    if (autoStart) {
        hideStartScreen();
        startWorldSession();
    }
}

/**
 * Starts the current world instance, triggering the intro drop and music.
 *
 * @param {{autoFullscreen?:boolean}} [options]
 */
function startWorldSession(options = {}) {
    if (!world) return;
    if (options.autoFullscreen !== false) {
        maybeEnterPreferredFullscreen();
    }
    world?.heroCharacter?.startIntroDrop();
    world.start();
}

/**
 * Fades out and hides the start screen overlay.
 *
 * @param {HTMLElement} [startScreen=document.getElementById("start-screen")]
 */
function hideStartScreen(startScreen = document.getElementById("start-screen")) {
    if (!startScreen) return;
    startScreen.style.opacity = 0;
    setTimeout(() => {
        startScreen.style.display = "none";
    }, 10);
}

/**
 * Reveals the start screen overlay and resumes the intro music loop.
 *
 * @param {HTMLElement} [startScreen=document.getElementById("start-screen")]
 */
function showStartScreen(startScreen = document.getElementById("start-screen")) {
    if (!startScreen) return;
    startScreen.style.display = "flex";
    requestAnimationFrame(() => {
        startScreen.style.opacity = 1;
    });
    if (typeof AudioHub !== "undefined" && typeof AudioHub.playStartScreenMusic === "function") {
        AudioHub.playStartScreenMusic();
    }
}

/**
 * Placeholder kept so legacy calls remain safe; auto-fullscreen has been removed.
 */
function maybeEnterPreferredFullscreen() { }

/**
 * Clears all keyboard action flags so no lingering input remains after a restart or pause event.
 */
function resetKeyboardState() {
    Object.keys(keyboard).forEach(key => {
        keyboard[key] = false;
    });
}

/**
 * Handles keydown events, toggling pause and marking keyboard actions active.
 *
 * @param {KeyboardEvent} event
 */
window.addEventListener("keydown", (event) => {
    const actions = KeyboardMapping.getActionsForEvent(event);

    if (actions.includes("PAUSE")) {
        if (event.repeat) return;
        event.preventDefault();
        togglePause();
    }

    if (!world) return;
    if (world.isPaused) return;
    if (world.inputLocked) return;

    if (!actions.length) return;

    if (actions.includes("JUMP")) {
        event.preventDefault(); // important to stop scrolling sideways
    }

    setKeyboardActionsState(actions, true);
});

/**
 * Releases keyboard actions when their key is lifted, unless the world locks input.
 *
 * @param {KeyboardEvent} event
 */
window.addEventListener("keyup", (event) => {
    if (world && world.inputLocked) return;

    const actions = KeyboardMapping.getActionsForEvent(event);
    if (!actions.length) return;
    setKeyboardActionsState(actions, false);
});



