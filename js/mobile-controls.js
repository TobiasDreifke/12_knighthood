/**
 * Enables the on-screen touch controls for smaller viewports.
 *
 * @returns {{setVisible:(state:boolean) => void, releaseAll:() => void}|null}
 */
function setupTouchControls() {
    const container = document.getElementById("touch-controls");
    if (!container) return null;

    const controlBindings = getTouchControlBindings();
    const activeControls = new Set();
    const setKeyState = createTouchKeyStateSetter(controlBindings);
    const handleActivate = createTouchActivateHandler(activeControls, setKeyState);
    const handleDeactivate = createTouchDeactivateHandler(activeControls, setKeyState);
    bindTouchControlButtons(container, { handleActivate, handleDeactivate });
    const releaseAll = createTouchReleaseAll(activeControls, setKeyState);
    const controlsApi = createTouchControlsApi(container, releaseAll);
    const shouldShowInitially = !isPortraitPhone() && devicePrefersTouchControls();
    controlsApi.setVisible(shouldShowInitially);
    if (!shouldShowInitially) {
        controlsApi.releaseAll();
    }
    return controlsApi;
}

/**
 * Returns the logical keyboard action for each touch control button.
 *
 * @returns {Record<string,string>}
 */
function getTouchControlBindings() {
    return {
        pause: "PAUSE",
        down: "DOWN",
        left: "LEFT",
        right: "RIGHT",
        jump: "JUMP",
        attack: "ATTACK",
        throwholy: "THROWHOLY",
        throwdark: "THROWDARK",
    };
}

/**
 * Creates a helper that updates the keyboard map in response to touch input states.
 *
 * @param {Record<string,string>} bindings
 * @returns {(control:string,isActive:boolean) => void}
 */
function createTouchKeyStateSetter(bindings) {
    return (control, isActive) => {
        const key = bindings[control];
        if (!key || !keyboard) return;
        if (!world || !world.hasStarted) {
            if (!isActive) keyboard[key] = false;
            return;
        }
        if (world.inputLocked && isActive) return;
        keyboard[key] = isActive;
    };
}

/**
 * Creates the pointerdown handler that activates controls or toggles pause.
 *
 * @param {Set<string>} activeControls
 * @param {(control:string,isActive:boolean) => void} setKeyState
 * @returns {(event:PointerEvent) => void}
 */
function createTouchActivateHandler(activeControls, setKeyState) {
    return (event) => {
        event.preventDefault();
        const button = event.currentTarget,
            control = button?.dataset?.control;
        if (!control) return;
        if (control === "pause") {
            togglePause();
            return;
        }
        activeControls.add(control);
        setKeyState(control, true);
        button?.setPointerCapture?.(event.pointerId);
    };
}

/**
 * Creates the pointer handler that releases a control once the pointer lifts or leaves.
 *
 * @param {Set<string>} activeControls
 * @param {(control:string,isActive:boolean) => void} setKeyState
 * @returns {(event:PointerEvent) => void}
 */
function createTouchDeactivateHandler(activeControls, setKeyState) {
    return (event) => {
        const button = event.currentTarget;
        const control = button?.dataset?.control;
        if (!control || control === "pause") return;
        activeControls.delete(control);
        setKeyState(control, false);
        button?.releasePointerCapture?.(event.pointerId);
    };
}

/**
 * Hooks touch control buttons to the provided pointer handlers.
 *
 * @param {HTMLElement} container
 * @param {{handleActivate:(event:PointerEvent) => void, handleDeactivate:(event:PointerEvent) => void}} handlers
 */
function bindTouchControlButtons(container, handlers) {
    const buttons = container.querySelectorAll("[data-control]");
    buttons.forEach(button => {
        button.addEventListener("pointerdown", handlers.handleActivate, { passive: false });
        ["pointerup", "pointercancel", "pointerleave"].forEach(action => {
            button.addEventListener(action, handlers.handleDeactivate);
        });
    });
}

/**
 * Provides a helper that releases all active touch controls at once.
 *
 * @param {Set<string>} activeControls
 * @param {(control:string,isActive:boolean) => void} setKeyState
 * @returns {() => void}
 */
function createTouchReleaseAll(activeControls, setKeyState) {
    return () => {
        activeControls.forEach(control => setKeyState(control, false));
        activeControls.clear();
    };
}

/**
 * Returns the external API for toggling visibility and releasing virtual buttons.
 *
 * @param {HTMLElement} container
 * @param {() => void} releaseAll
 * @returns {{setVisible:(state:boolean) => void, releaseAll:() => void}}
 */
function createTouchControlsApi(container, releaseAll) {
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
 * Watches orientation changes so gameplay pauses on portrait phones.
 */
function setupOrientationGuard() {
    const context = collectOrientationElements();
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
 * @param {{overlay:HTMLElement,startButton:HTMLButtonElement}|null} context
 */
function handleOrientationChange(context) {
    const portrait = isPortraitPhone();
    if (context) {
        updateOverlayAndStartButton(context.overlay, context.startButton, portrait);
    }
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
 * Returns whether the device likely needs touch controls based solely on actual touch capability.
 *
 * @returns {boolean}
 */
function devicePrefersTouchControls() {
    return supportsTouchInput();
}

/**
 * Detects whether the current device exposes touch input capabilities.
 *
 * @returns {boolean}
 */
function supportsTouchInput() {
    if (typeof navigator !== "undefined") {
        const touchPoints = navigator.maxTouchPoints ?? navigator.msMaxTouchPoints ?? 0;
        if (touchPoints > 0) return true;
    }
    if (coarsePointerQuery.matches) return true;
    return "ontouchstart" in window;
}

