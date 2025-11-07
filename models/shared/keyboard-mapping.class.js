/**
 * Central registry for default keyboard bindings plus helpers for describing or resolving actions.
 */
class KeyboardMapping {
    static DEFAULT_BINDINGS = {
        LEFT: { keys: ["arrowleft", "a"], display: "A" },
        RIGHT: { keys: ["arrowright", "d"], display: "D" },
        UP: { keys: ["arrowup", "w"], display: "W" },
        DOWN: { keys: ["arrowdown", "s"], display: "S" },
        JUMP: { codes: ["Space"], display: "W / SPACE" },
        ATTACK: { keys: ["f"], display: "F" },
        THROWHOLY: { keys: ["q"], display: "Q" },
        THROWDARK: { keys: ["e"], display: "E" },
        PAUSE: { keys: ["p"], display: "P" },
    };

    /**
     * Returns the default binding metadata for a given action name.
     *
     * @param {string} action
     * @returns {{keys?:string[],codes?:string[],display?:string}|null}
     */
    static getBinding(action) {
        if (!action) return null;
        return KeyboardMapping.DEFAULT_BINDINGS[action.toUpperCase()] || null;
    }

    /**
     * Human-readable representation for an action (used in tooltips/UI).
     *
     * @param {string} action
     * @param {string} [fallback=""]
     * @returns {string}
     */
    static getDisplayKey(action, fallback = "") {
        const binding = KeyboardMapping.getBinding(action);
        if (!binding) return fallback || action;
        if (typeof binding.display === "string" && binding.display.length) {
            return binding.display;
        }
        const key = (binding.keys && binding.keys[0]) || (binding.codes && binding.codes[0]) || fallback || action;
        return typeof key === "string" ? key.toUpperCase() : fallback || action;
    }

    /**
     * Resolves which actions an incoming keyboard event maps to.
     *
     * @param {KeyboardEvent} event
     * @returns {string[]}
     */
    static getActionsForEvent(event) {
        if (!event) return [];
        const key = typeof event.key === "string" ? event.key.toLowerCase() : null;
        const code = event.code;
        return Object.entries(KeyboardMapping.DEFAULT_BINDINGS).reduce((acc, [action, binding]) => {
            if (!binding) return acc;
            const matchesKey = Array.isArray(binding.keys)
                && key !== null
                && binding.keys.some(candidate => typeof candidate === "string" && candidate.toLowerCase() === key);
            const matchesCode = Array.isArray(binding.codes)
                && typeof code === "string"
                && binding.codes.some(candidate => candidate === code);
            if (matchesKey || matchesCode) {
                acc.push(action);
            }
            return acc;
        }, []);
    }

    /**
     * Iterates every binding tuple and forwards it to the provided callback.
     *
     * @param {(action:string, binding:object) => void} callback
     */
    static forEachBinding(callback) {
        if (typeof callback !== "function") return;
        Object.entries(KeyboardMapping.DEFAULT_BINDINGS).forEach(([action, binding]) => callback(action, binding));
    }

    JUMP = false;
    LEFT = false;
    RIGHT = false;
    UP = false;
    DOWN = false;
    speed = 3;
    THROWHOLY = false;
    THROWDARK = false;
    ATTACK = false;
    PAUSE = false;
}
