let canvas;
let world;
let keyboard = new KeyboardMapping()
let pressedKey = [];

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);

    console.log("my char is", world.heroCharacter);
    setupStartButton();
    setupSoundControls();
    setupPauseMenu();

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
    const volumeSlider = document.getElementById("volume");
    const muteButton = document.getElementById("mute-button");

    const updateMuteButton = () => {
        if (!muteButton) return;
        const isMuted = AudioHub.isMuted;
        muteButton.textContent = isMuted ? "Unmute" : "Mute";
        muteButton.setAttribute("aria-pressed", String(isMuted));
        muteButton.classList.toggle("is-muted", isMuted);
    };

    if (volumeSlider) {
        volumeSlider.value = String(AudioHub.masterVolume);
        volumeSlider.addEventListener("input", event => {
            const slider = event.target;
            if (!(slider instanceof HTMLInputElement)) return;
            const value = parseFloat(slider.value);
            AudioHub.setVolume(value);
            updateMuteButton();
        });
    }

    if (muteButton && volumeSlider) {
        muteButton.addEventListener("click", () => {
            const { isMuted, volume } = AudioHub.toggleMute();
            volumeSlider.value = String(volume);
            updateMuteButton();
        });
    }

    updateMuteButton();
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
    if (event.key === "Escape") {
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
