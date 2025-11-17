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
 * Wires the start screen button to unlock audio, hide the overlay, and launch the world.
 */
function setupStartButton() {
    const startScreen = document.getElementById("start-screen");
    const startButton = document.getElementById("start-button");

    startButton.addEventListener("click", () => {
        AudioHub.unlock();
        AudioHub.playGameplayMusic();
        hideStartScreen(startScreen);
        maybeEnterPreferredFullscreen();
        setTimeout(() => startWorldSession({ autoFullscreen: false }), 10);
    });

    requestAnimationFrame(() => AudioHub.playStartScreenMusic());
}

/**
 * Hooks all restart buttons so they reset the game without a page reload.
 */
function setupRestartButtons() {
    const restartIds = ["restart-button", "gameover-restart-button"];
    restartIds.forEach(id => {
        const button = document.getElementById(id);
        if (!button) return;
        button.addEventListener("click", () => restartGame());
    });
}

/**
 * Sets up event handlers for all mute/volume controls in the UI.
 */
function setupSoundControls() {
    const controls = collectSoundControls();
    if (!controls) return;
    const { volumeSliders, muteButtons } = controls;
    const syncSliders = createSliderSync(volumeSliders);
    const updateMute = () => updateMuteButtons(muteButtons);
    bindVolumeSliders(volumeSliders, syncSliders, updateMute);
    bindMuteButtons(muteButtons, syncSliders, updateMute);
    syncSliders(AudioHub.isMuted ? "0" : String(AudioHub.masterVolume));
    updateMute();
}

/**
 * Collects available mute buttons and volume sliders in the DOM.
 *
 * @returns {{volumeSliders:HTMLInputElement[],muteButtons:HTMLButtonElement[]}|null}
 */
function collectSoundControls() {
    const volumeSliders = Array.from(document.querySelectorAll(".sound_volume"));
    const muteButtons = Array.from(document.querySelectorAll(".sound_mute"));
    if (!volumeSliders.length && !muteButtons.length) return null;
    return { volumeSliders, muteButtons };
}

/**
 * Returns a helper that syncs all sliders to a single value.
 *
 * @param {HTMLInputElement[]} volumeSliders
 * @returns {(value:string) => void}
 */
function createSliderSync(volumeSliders) {
    return value => {
        volumeSliders.forEach(slider => {
            if (slider instanceof HTMLInputElement) {
                slider.value = value;
            }
        });
    };
}

/**
 * Updates all mute buttons so they reflect the current AudioHub state.
 *
 * @param {HTMLButtonElement[]} muteButtons
 */
function updateMuteButtons(muteButtons) {
    muteButtons.forEach(button => {
        const isMuted = AudioHub.isMuted;
        button.textContent = isMuted ? "Unmute" : "Mute";
        button.setAttribute("aria-pressed", String(isMuted));
        button.classList.toggle("is-muted", isMuted);
    });
}

/**
 * Attaches input listeners to sync slider movement with the AudioHub volume.
 *
 * @param {HTMLInputElement[]} sliders
 * @param {(value:string) => void} sync
 * @param {() => void} updateMute
 */
function bindVolumeSliders(sliders, sync, updateMute) {
    sliders.forEach(slider => {
        if (!(slider instanceof HTMLInputElement)) return;
        slider.value = AudioHub.isMuted ? "0" : String(AudioHub.masterVolume);
        slider.addEventListener("input", event => {
            const input = event.target;
            if (!(input instanceof HTMLInputElement)) return;
            const value = parseFloat(input.value);
            AudioHub.setVolume(value);
            sync(String(AudioHub.masterVolume));
            updateMute();
        });
    });
}

/**
 * Hooks mute buttons so they toggle AudioHub and keep UI in sync.
 *
 * @param {HTMLButtonElement[]} buttons
 * @param {(value:string) => void} sync
 * @param {() => void} updateMute
 */
function bindMuteButtons(buttons, sync, updateMute) {
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const { isMuted, volume } = AudioHub.toggleMute();
            const sliderValue = isMuted ? "0" : String(volume);
            sync(sliderValue);
            updateMute();
        });
    });
}

/**
 * Enables fullscreen buttons if the browser supports the API.
 */
function setupFullscreenToggle() {
    const context = collectFullscreenContext();
    if (!context) return;
    fullscreenWrapper = context.wrapper;
    if (!ensureFullscreenSupport(context)) return;
    const isActive = () => document.fullscreenElement === context.wrapper;
    const updateButtons = () => updateFullscreenButtons(context.buttons, isActive());
    bindFullscreenButtons(context.buttons, context.wrapper, isActive);
    bindFullscreenChange(context.wrapper, updateButtons, isActive);
    updateButtons();
}

/**
 * Collects fullscreen buttons and wrapper for toggling the canvas container.
 *
 * @returns {{buttons:HTMLButtonElement[],wrapper:HTMLElement}|null}
 */
function collectFullscreenContext() {
    const buttons = Array.from(document.querySelectorAll(".fullscreen_toggle"));
    const wrapper = document.querySelector(".game_screen_wrapper");
    if (!buttons.length || !wrapper) return null;
    return { buttons, wrapper };
}

/**
 * Disables fullscreen controls when the browser does not support the API.
 *
 * @param {{buttons:HTMLButtonElement[],wrapper:HTMLElement}} param0
 * @returns {boolean}
 */
function ensureFullscreenSupport({ buttons, wrapper }) {
    const supportsBrowserFullscreen = typeof wrapper.requestFullscreen === "function" && typeof document.exitFullscreen === "function";
    if (document.fullscreenEnabled || supportsBrowserFullscreen) return true;
    buttons.forEach(button => {
        button.disabled = true;
        button.title = "Fullscreen not supported in this browser";
    });
    return false;
}

/**
 * Hooks HUD buttons rendered on top of the canvas (pause, etc.).
 */
function setupCanvasHudButtons() {
    const pauseButton = document.getElementById("ingame-pause-button");
    pauseButton?.addEventListener("click", () => togglePause());
}

/**
 * Updates the aria-pressed/text state of fullscreen buttons.
 *
 * @param {HTMLButtonElement[]} buttons
 * @param {boolean} active
 */
function updateFullscreenButtons(buttons, active) {
    buttons.forEach(button => {
        button.textContent = active ? "Exit Fullscreen" : "Fullscreen";
        button.setAttribute("aria-pressed", String(active));
    });
}

/**
 * Hooks all fullscreen buttons to request/exit fullscreen mode.
 *
 * @param {HTMLButtonElement[]} buttons
 * @param {HTMLElement} wrapper
 * @param {() => boolean} isActive
 */
function bindFullscreenButtons(buttons, wrapper, isActive) {
    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            try {
                if (isActive()) {
                    if (document.exitFullscreen) await document.exitFullscreen();
                } else if (wrapper.requestFullscreen) {
                    await wrapper.requestFullscreen();
                }
            } catch (error) {
                console.error("Fullscreen toggle failed:", error);
            }
        });
    });
}

/**
 * Syncs wrapper styles and button states when fullscreen mode changes.
 *
 * @param {HTMLElement} wrapper
 * @param {() => void} updateButtons
 * @param {() => boolean} isActive
 */
function bindFullscreenChange(wrapper, updateButtons, isActive) {
    document.addEventListener("fullscreenchange", () => {
        wrapper.classList.toggle("is-fullscreen", isActive());
        updateButtons();
    });
}

/**
 * Enables the on-screen touch controls for smaller viewports.
 *
 * @returns {{setVisible:(state:boolean) => void, releaseAll:() => void}|null}
 */
function setupTouchControls() {
    const container = document.getElementById("touch-controls");
    if (!container) return null;

    const controlBindings = {
        pause: "PAUSE",
        down: "DOWN",
        left: "LEFT",
        right: "RIGHT",
        jump: "JUMP",
        attack: "ATTACK",
        throwholy: "THROWHOLY",
        throwdark: "THROWDARK",
    };

    const activeControls = new Set();

    const setKeyState = (control, isActive) => {
        const key = controlBindings[control];
        if (!key) return;
        if (!keyboard) return;
        if (!world || !world.hasStarted) {
            if (!isActive) keyboard[key] = false;
            return;
        }
        if (world.inputLocked && isActive) return;
        keyboard[key] = isActive;
    };

    const handleActivate = (event) => {
        event.preventDefault();
        const button = event.currentTarget;
        const control = button.dataset.control;
        if (!control) return;
        if (control === "pause") {
            togglePause();
            return;
        }
        activeControls.add(control);
        setKeyState(control, true);
        if (button.setPointerCapture) {
            button.setPointerCapture(event.pointerId);
        }
    };

    const handleDeactivate = (event) => {
        const button = event.currentTarget;
        const control = button.dataset.control;
        if (!control || control === "pause") return;
        activeControls.delete(control);
        setKeyState(control, false);
        if (button.releasePointerCapture) {
            button.releasePointerCapture(event.pointerId);
        }
    };

    container.querySelectorAll("[data-control]").forEach(button => {
        button.addEventListener("pointerdown", handleActivate, { passive: false });
        ["pointerup", "pointercancel", "pointerleave"].forEach(action => {
            button.addEventListener(action, handleDeactivate);
        });
    });

    const releaseAll = () => {
        activeControls.forEach(control => setKeyState(control, false));
        activeControls.clear();
    };

    return {
        setVisible(visible) {
            container.classList.toggle("visible", !!visible);
            if (!visible) {
                releaseAll();
            }
        },
        releaseAll,
    };
}

/**
 * Initializes the legal notice modal interactions.
 */
function setupImpressumModal() {
    const openButton = document.getElementById("start-legal-button");
    const modal = document.getElementById("legal-modal");
    const closeButton = document.getElementById("legal-close-button");

    if (!openButton || !modal || !closeButton) return;

    const showModal = () => {
        modal.classList.add("visible");
        modal.setAttribute("aria-hidden", "false");
    };

    const hideModal = (returnFocus = true) => {
        modal.classList.remove("visible");
        modal.setAttribute("aria-hidden", "true");
        if (returnFocus) {
            openButton.focus();
        }
    };

    openButton.addEventListener("click", showModal);
    closeButton.addEventListener("click", () => hideModal());

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            hideModal();
        }
    });

    window.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal.classList.contains("visible")) {
            hideModal();
        }
    });

    hideModal(false);
}

/**
 * Watches orientation changes so gameplay pauses on portrait phones.
 */
function setupOrientationGuard() {
    const context = collectOrientationElements();
    if (!context) return;
    const applyState = () => handleOrientationChange(context);
    applyState();
    window.addEventListener("resize", applyState);
    window.addEventListener("orientationchange", applyState);
    if (typeof coarsePointerQuery.addEventListener === "function") {
        coarsePointerQuery.addEventListener("change", () => updateTouchControlsState(isPortraitPhone()));
    } else if (typeof coarsePointerQuery.addListener === "function") {
        coarsePointerQuery.addListener(() => updateTouchControlsState(isPortraitPhone()));
    }
}

/**
 * Collects DOM nodes used for the orientation overlay.
 *
 * @returns {{overlay:HTMLElement,startButton:HTMLButtonElement}|null}
 */
function collectOrientationElements() {
    const overlay = document.getElementById("orientation-overlay");
    if (!overlay) return null;
    const startButton = document.getElementById("start-button");
    return { overlay, startButton };
}

/**
 * Applies orientation visibility, touch controls, and pause state.
 *
 * @param {{overlay:HTMLElement,startButton:HTMLButtonElement}} param0
 */
function handleOrientationChange({ overlay, startButton }) {
    const portrait = isPortraitPhone();
    updateOverlayAndStartButton(overlay, startButton, portrait);
    updateTouchControlsState(portrait);
    updateWorldOrientationState(portrait);
}

/**
 * @returns {boolean} True when the viewport is a portrait mobile layout.
 */
function isPortraitPhone() {
    return window.innerHeight > window.innerWidth && window.innerWidth < 900;
}

/**
 * Shows/hides the orientation overlay and disables the start button on portrait.
 *
 * @param {HTMLElement} overlay
 * @param {HTMLButtonElement} startButton
 * @param {boolean} portrait
 */
function updateOverlayAndStartButton(overlay, startButton, portrait) {
    overlay.classList.toggle("visible", portrait);
    if (startButton) startButton.disabled = portrait;
}

/**
 * Shows or hides the touch controls based on viewport orientation/size.
 *
 * @param {boolean} portrait
 */
function updateTouchControlsState(portrait) {
    if (!touchControlsManager) return;
    const shouldShowTouchControls = !portrait && devicePrefersTouchControls();
    touchControlsManager.setVisible(shouldShowTouchControls);
    if (portrait) touchControlsManager.releaseAll();
}

/**
 * Pauses or resumes the world when the device orientation changes.
 *
 * @param {boolean} portrait
 */
function updateWorldOrientationState(portrait) {
    if (!world || !world.hasStarted) return;
    if (portrait) {
        if (!world.isPaused && !orientationPauseActive) {
            orientationPauseActive = world.pauseGame();
        }
        return;
    }
    if (orientationPauseActive && world.isPaused) {
        world.resumeGame();
    }
    orientationPauseActive = false;
}

/**
 * Returns whether the device likely needs touch controls based on pointer capabilities or viewport width.
 *
 * @returns {boolean}
 */
function devicePrefersTouchControls() {
    const widthThreshold = 900;
    return coarsePointerQuery.matches || window.innerWidth <= widthThreshold;
}

/**
 * Wires pause menu controls so they resume or restart the game.
 */
function setupPauseMenu() {
    const pauseScreen = document.getElementById("pause-screen");
    if (!pauseScreen) return;

    const continueButton = document.getElementById("pause-continue-button");
    const retryButton = document.getElementById("pause-retry-button");

    continueButton?.addEventListener("click", () => {
        if (!world) return;
        const resumed = world.resumeGame();
        if (resumed) {
            hidePauseOverlay();
        }
    });

    retryButton?.addEventListener("click", () => {
        restartGame({ autoStart: false, showStartScreen: true });
    });
}

/**
 * Pauses or resumes the world depending on its current state.
 */
function togglePause() {
    if (!world) return;
    if (world.isPaused) {
        const resumed = world.resumeGame();
        if (resumed) hidePauseOverlay();
    } else {
        const paused = world.pauseGame();
        if (paused) showPauseOverlay();
    }
}

/**
 * Reveals the pause overlay.
 */
function showPauseOverlay() {
    const pauseScreen = document.getElementById("pause-screen");
    if (!pauseScreen) return;
    pauseScreen.classList.add("overlay_visible");
}

/**
 * Hides the pause overlay.
 */
function hidePauseOverlay() {
    const pauseScreen = document.getElementById("pause-screen");
    if (!pauseScreen) return;
    pauseScreen.classList.remove("overlay_visible");
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



