let canvas;
let world;
let keyboard = new KeyboardMapping()
let pressedKey = [];
let orientationPauseActive = false;

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);

    console.log("my char is", world.heroCharacter);
    setupStartButton();
    setupSoundControls();
    setupPauseMenu();
    setupFullscreenToggle();
    setupOrientationGuard();

    const restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", () => {
        location.reload();
    });

    const gameoverRestartButton = document.getElementById("gameover-restart-button");
    if (gameoverRestartButton) {
        gameoverRestartButton.addEventListener("click", () => location.reload());
    }
}

function setupStartButton() {
    const startScreen = document.getElementById("start-screen");
    const startButton = document.getElementById("start-button");

    startButton.addEventListener("click", () => {
        startScreen.style.opacity = 0;

        setTimeout(() => {
            startScreen.style.display = "none";
            world.start();
        }, 10);
    });
}

function setupSoundControls() {
    const volumeSliders = Array.from(document.querySelectorAll(".sound-volume"));
    const muteButtons = Array.from(document.querySelectorAll(".sound-mute"));

    if (!volumeSliders.length && !muteButtons.length) return;

    const syncSliderValues = value => {
        volumeSliders.forEach(slider => {
            if (slider instanceof HTMLInputElement) {
                slider.value = value;
            }
        });
    };

    const updateMuteButtons = () => {
        muteButtons.forEach(button => {
            const isMuted = AudioHub.isMuted;
            button.textContent = isMuted ? "Unmute" : "Mute";
            button.setAttribute("aria-pressed", String(isMuted));
            button.classList.toggle("is-muted", isMuted);
        });
    };

    volumeSliders.forEach(slider => {
        if (!(slider instanceof HTMLInputElement)) return;
        slider.value = AudioHub.isMuted ? "0" : String(AudioHub.masterVolume);
        slider.addEventListener("input", event => {
            const input = event.target;
            if (!(input instanceof HTMLInputElement)) return;
            const value = parseFloat(input.value);
            AudioHub.setVolume(value);
            syncSliderValues(String(AudioHub.masterVolume));
            updateMuteButtons();
        });
    });

    muteButtons.forEach(button => {
        button.addEventListener("click", () => {
            const { isMuted, volume } = AudioHub.toggleMute();
            const sliderValue = isMuted ? "0" : String(volume);
            syncSliderValues(sliderValue);
            updateMuteButtons();
        });
    });

    syncSliderValues(AudioHub.isMuted ? "0" : String(AudioHub.masterVolume));
    updateMuteButtons();
}

function setupFullscreenToggle() {
    const fullscreenButtons = Array.from(document.querySelectorAll(".fullscreen-toggle"));
    const gameWrapper = document.querySelector(".game_screen_wrapper");

    if (!fullscreenButtons.length || !gameWrapper) return;

    const supportsFullscreen = typeof gameWrapper.requestFullscreen === "function" && typeof document.exitFullscreen === "function";
    if (!document.fullscreenEnabled && !supportsFullscreen) {
        fullscreenButtons.forEach(button => {
            button.disabled = true;
            button.title = "Fullscreen not supported in this browser";
        });
        return;
    }

    const isInFullscreen = () => document.fullscreenElement === gameWrapper;

    const updateButtons = () => {
        const active = isInFullscreen();
        fullscreenButtons.forEach(button => {
            button.textContent = active ? "Exit Fullscreen" : "Fullscreen";
            button.setAttribute("aria-pressed", String(active));
        });
    };

    fullscreenButtons.forEach(button => {
        button.addEventListener("click", async () => {
            try {
                if (isInFullscreen()) {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    }
                } else if (gameWrapper.requestFullscreen) {
                    await gameWrapper.requestFullscreen();
                }
            } catch (error) {
                console.error("Fullscreen toggle failed:", error);
            }
        });
    });

    document.addEventListener("fullscreenchange", () => {
        const active = isInFullscreen();
        gameWrapper.classList.toggle("is-fullscreen", active);
        updateButtons();
    });

    updateButtons();
}

function setupOrientationGuard() {
    const orientationOverlay = document.getElementById("orientation-overlay");
    const startButton = document.getElementById("start-button");

    if (!orientationOverlay) return;

    const isPortraitPhone = () => window.innerHeight > window.innerWidth && window.innerWidth < 900;

    const applyOrientationState = () => {
        const portrait = isPortraitPhone();
        orientationOverlay.classList.toggle("visible", portrait);
        if (startButton) startButton.disabled = portrait;

        if (!world || !world.hasStarted) return;

        if (portrait) {
            if (!world.isPaused && !orientationPauseActive) {
                orientationPauseActive = world.pauseGame();
            }
        } else {
            if (orientationPauseActive && world.isPaused) {
                world.resumeGame();
            }
            orientationPauseActive = false;
        }
    };

    applyOrientationState();
    window.addEventListener("resize", applyOrientationState);
    window.addEventListener("orientationchange", applyOrientationState);
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

window.addEventListener("keydown", (event) => {
    if (event.key === "p") {
        if (event.repeat) return;
        event.preventDefault();
        togglePause();
        return;
    }

    if (!world) return;
    if (world.isPaused) return;
    if (world.inputLocked) return;

    const key = event.key.toLowerCase();

    if (key === "arrowright" || key === "d") keyboard.RIGHT = true;
    if (key === "arrowleft" || key === "a") keyboard.LEFT = true;
    if (key === "arrowup" || key === "w") keyboard.UP = true;
    if (key === "arrowdown" || key === "s") keyboard.DOWN = true;

    if (event.code === "Space") {
        event.preventDefault(); // important to stop scrolling sideways
        keyboard.JUMP = true;
    }

    if (key === "f") keyboard.ATTACK = true;
    if (key === "q") keyboard.THROWHOLY = true;
    if (key === "e") keyboard.THROWDARK = true;
});



window.addEventListener("keyup", (event) => {
    if (world && world.inputLocked) return;

    const key = event.key.toLowerCase();

    if (key === "arrowright" || key === "d") keyboard.RIGHT = false;
    if (key === "arrowleft" || key === "a") keyboard.LEFT = false;
    if (key === "arrowup" || key === "w") keyboard.UP = false;
    if (key === "arrowdown" || key === "s") keyboard.DOWN = false;
    if (event.code === "Space") {
        keyboard.JUMP = false;
    }

    if (key === "f") keyboard.ATTACK = false
    if (key === "q") keyboard.THROWHOLY = false;
    if (key === "e") keyboard.THROWDARK = false;


});
