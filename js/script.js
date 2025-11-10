let canvas;
let world;
let keyboard = new KeyboardMapping()
let pressedKey = [];
let orientationPauseActive = false;
let touchControlsManager = null;

function init() {
    const startGame = () => {
        canvas = document.getElementById("canvas");
        const initialLevelIndex = 0;
        AudioHub.ensureInteractionUnlock();
        world = new World(canvas, keyboard, initialLevelIndex);

        console.log("my char is", world.heroCharacter);
        setupStartButton();
        setupSoundControls();
        setupPauseMenu();
        setupFullscreenToggle();
        touchControlsManager = setupTouchControls();
        setupOrientationGuard();
        setupImpressumModal();

        const restartButton = document.getElementById("restart-button");
        restartButton.addEventListener("click", () => {
            location.reload();
        });

        const gameoverRestartButton = document.getElementById("gameover-restart-button");
        if (gameoverRestartButton) {
            gameoverRestartButton.addEventListener("click", () => location.reload());
        }
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

function setupStartButton() {
    const startScreen = document.getElementById("start-screen");
    const startButton = document.getElementById("start-button");

    startButton.addEventListener("click", () => {
        AudioHub.unlock();
        AudioHub.playGameplayMusic();
        startScreen.style.opacity = 0;

        setTimeout(() => {
            startScreen.style.display = "none";
            world?.heroCharacter?.startIntroDrop();
            world.start();
        }, 10);
    });

    requestAnimationFrame(() => AudioHub.playStartScreenMusic());
}

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

function collectSoundControls() {
    const volumeSliders = Array.from(document.querySelectorAll(".sound_volume"));
    const muteButtons = Array.from(document.querySelectorAll(".sound_mute"));
    if (!volumeSliders.length && !muteButtons.length) return null;
    return { volumeSliders, muteButtons };
}

function createSliderSync(volumeSliders) {
    return value => {
        volumeSliders.forEach(slider => {
            if (slider instanceof HTMLInputElement) {
                slider.value = value;
            }
        });
    };
}

function updateMuteButtons(muteButtons) {
    muteButtons.forEach(button => {
        const isMuted = AudioHub.isMuted;
        button.textContent = isMuted ? "Unmute" : "Mute";
        button.setAttribute("aria-pressed", String(isMuted));
        button.classList.toggle("is-muted", isMuted);
    });
}

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

function setupFullscreenToggle() {
    const context = collectFullscreenContext();
    if (!context) return;
    if (!ensureFullscreenSupport(context)) return;
    const isActive = () => document.fullscreenElement === context.wrapper;
    const updateButtons = () => updateFullscreenButtons(context.buttons, isActive());
    bindFullscreenButtons(context.buttons, context.wrapper, isActive);
    bindFullscreenChange(context.wrapper, updateButtons, isActive);
    updateButtons();
}

function collectFullscreenContext() {
    const buttons = Array.from(document.querySelectorAll(".fullscreen_toggle"));
    const wrapper = document.querySelector(".game_screen_wrapper");
    if (!buttons.length || !wrapper) return null;
    return { buttons, wrapper };
}

function ensureFullscreenSupport({ buttons, wrapper }) {
    const supportsBrowserFullscreen = typeof wrapper.requestFullscreen === "function" && typeof document.exitFullscreen === "function";
    if (document.fullscreenEnabled || supportsBrowserFullscreen) return true;
    buttons.forEach(button => {
        button.disabled = true;
        button.title = "Fullscreen not supported in this browser";
    });
    return false;
}

function updateFullscreenButtons(buttons, active) {
    buttons.forEach(button => {
        button.textContent = active ? "Exit Fullscreen" : "Fullscreen";
        button.setAttribute("aria-pressed", String(active));
    });
}

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

function bindFullscreenChange(wrapper, updateButtons, isActive) {
    document.addEventListener("fullscreenchange", () => {
        wrapper.classList.toggle("is-fullscreen", isActive());
        updateButtons();
    });
}

function setupTouchControls() {
    const container = document.getElementById("touch-controls");
    if (!container) return null;

    const controlBindings = {
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
        activeControls.add(control);
        setKeyState(control, true);
        if (button.setPointerCapture) {
            button.setPointerCapture(event.pointerId);
        }
    };

    const handleDeactivate = (event) => {
        const button = event.currentTarget;
        const control = button.dataset.control;
        if (!control) return;
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

function setupOrientationGuard() {
    const context = collectOrientationElements();
    if (!context) return;
    const applyState = () => handleOrientationChange(context);
    applyState();
    window.addEventListener("resize", applyState);
    window.addEventListener("orientationchange", applyState);
}

function collectOrientationElements() {
    const overlay = document.getElementById("orientation-overlay");
    if (!overlay) return null;
    const startButton = document.getElementById("start-button");
    return { overlay, startButton };
}

function handleOrientationChange({ overlay, startButton }) {
    const portrait = isPortraitPhone();
    updateOverlayAndStartButton(overlay, startButton, portrait);
    updateTouchControlsState(portrait);
    updateWorldOrientationState(portrait);
}

function isPortraitPhone() {
    return window.innerHeight > window.innerWidth && window.innerWidth < 900;
}

function updateOverlayAndStartButton(overlay, startButton, portrait) {
    overlay.classList.toggle("visible", portrait);
    if (startButton) startButton.disabled = portrait;
}

function updateTouchControlsState(portrait) {
    if (!touchControlsManager) return;
    const shouldShowTouchControls = !portrait && window.innerWidth < 900;
    touchControlsManager.setVisible(shouldShowTouchControls);
    if (portrait) touchControlsManager.releaseAll();
}

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
        location.reload();
    });
}

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

function showPauseOverlay() {
    const pauseScreen = document.getElementById("pause-screen");
    if (!pauseScreen) return;
    pauseScreen.classList.add("overlay_visible");
}

function hidePauseOverlay() {
    const pauseScreen = document.getElementById("pause-screen");
    if (!pauseScreen) return;
    pauseScreen.classList.remove("overlay_visible");
}

function setKeyboardActionsState(actions, state) {
    actions.forEach(action => {
        if (action === "PAUSE") return;
        if (Object.prototype.hasOwnProperty.call(keyboard, action)) {
            keyboard[action] = state;
        }
    });
}

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

window.addEventListener("keyup", (event) => {
    if (world && world.inputLocked) return;

    const actions = KeyboardMapping.getActionsForEvent(event);
    if (!actions.length) return;
    setKeyboardActionsState(actions, false);
});


