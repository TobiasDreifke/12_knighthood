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
 * Applies aria-labels/muted styling to the mute buttons based on AudioHub state.
 *
 * @param {HTMLButtonElement[]} muteButtons
 */
function updateMuteButtons(muteButtons) {
    muteButtons.forEach(button => {
        const isMuted = AudioHub.isMuted;
        button.setAttribute("aria-pressed", String(isMuted));
        button.textContent = isMuted ? "Unmute" : "Mute";
    });
}

/**
 * Adds input handlers for volume sliders that sync across all controls.
 *
 * @param {HTMLInputElement[]} sliders
 * @param {(value:string) => void} sync
 * @param {() => void} updateMute
 */
function bindVolumeSliders(sliders, sync, updateMute) {
    sliders.forEach(slider => {
        slider.addEventListener("input", (event) => {
            const value = event.target.value;
            sync(value);
            AudioHub.setVolume(Number(value));
            if (Number(value) === 0) {
                AudioHub.muteAll();
            } else if (AudioHub.isMuted) {
                AudioHub.unmuteAll();
            }
            updateMute();
        });
    });
}

/**
 * Adds click handlers for mute buttons so they toggle AudioHub state.
 *
 * @param {HTMLButtonElement[]} buttons
 * @param {(value:string) => void} sync
 * @param {() => void} updateMute
 */
function bindMuteButtons(buttons, sync, updateMute) {
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            if (AudioHub.isMuted) {
                AudioHub.unmuteAll();
                sync(String(AudioHub.masterVolume));
            } else {
                AudioHub.muteAll();
                sync("0");
            }
            updateMute();
        });
    });
}

/**
 * Wires fullscreen buttons and state observers.
 */
function setupFullscreenToggle() {
    const context = collectFullscreenContext();
    if (!context) return false;
    const { buttons, wrapper } = context;
    fullscreenWrapper = wrapper;
    if (!ensureFullscreenSupport(context)) return false;
    const isActive = () => document.fullscreenElement === wrapper;
    const updateButtons = () => updateFullscreenButtons(buttons, isActive());
    bindFullscreenButtons(buttons, wrapper, isActive);
    bindFullscreenChange(wrapper, updateButtons, isActive);
    updateButtons();
    return true;
}

/**
 * Collects DOM elements required for the fullscreen toggles.
 *
 * @returns {{buttons:HTMLButtonElement[],wrapper:HTMLElement}|null}
 */
function collectFullscreenContext() {
    const wrapper = document.getElementById("game-container");
    if (!wrapper) return null;
    const buttons = Array.from(document.querySelectorAll("[data-action=\"fullscreen-toggle\"]"));
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
 * Initializes the legal notice modal interactions.
 */
function setupImpressumModal() {
    const openButton = document.getElementById("start-legal-button");
    const modal = document.getElementById("legal-modal");
    const closeButton = document.getElementById("legal-close-button");
    if (!openButton || !modal || !closeButton) return;
    const state = createModalState(modal, openButton);
    bindLegalModalButtons(openButton, closeButton, state);
    bindLegalModalDismissHandlers(modal, state);
    state.hide(false);
}

function createModalState(modal, openButton) {
    const show = () => toggleModalVisibility(modal, { visible: true });
    const hide = (returnFocus = true) => {
        toggleModalVisibility(modal, { visible: false });
        if (returnFocus) {
            openButton.focus();
        }
    };
    return { show, hide };
}

function toggleModalVisibility(modal, { visible }) {
    modal.classList.toggle("visible", visible);
    modal.setAttribute("aria-hidden", String(!visible));
}

function bindLegalModalButtons(openButton, closeButton, modalState) {
    openButton.addEventListener("click", () => modalState.show());
    closeButton.addEventListener("click", () => modalState.hide());
}

function bindLegalModalDismissHandlers(modal, modalState) {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modalState.hide();
        }
    });
    window.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal.classList.contains("visible")) {
            modalState.hide();
        }
    });
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

        if (resumed) {

            hidePauseOverlay();

        }

        return;

    }

    const paused = world.pauseGame();

    if (paused) {

        showPauseOverlay();

    }

}



/**

 * Shows the pause overlay and ensures keyboard focus is managed.

 */

function showPauseOverlay() {

    const overlay = document.getElementById("pause-screen");

    if (!overlay) return;

    overlay.classList.add("visible");

    overlay.setAttribute("aria-hidden", "false");

    overlay.focus();

}



/**

 * Hides the pause overlay.

 */

function hidePauseOverlay() {

    const overlay = document.getElementById("pause-screen");

    if (!overlay) return;

    overlay.classList.remove("visible");

    overlay.setAttribute("aria-hidden", "true");

}

