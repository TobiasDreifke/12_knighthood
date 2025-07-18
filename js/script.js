let canvas;
let world;
let keyboard = new KeyboardMapping()
let pressedKey = [];

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);

    console.log("my char is", world.heroCharacter);
}


window.addEventListener("keydown", (event) => {

    if (event.keyCode == 39 || event.keycode == 68) {
        keyboard.RIGHT = true;
    }
    if (event.keyCode == 37 || event.keycode == 65) {
        keyboard.LEFT = true;
    }
    if (event.keyCode == 38 || event.keycode == 87) {
        keyboard.UP = true;
    }
    if (event.keyCode == 37 || event.keycode == 40) {
        keyboard.DOWN = true;
    }
    if (event.keyCode == 32) {
        keyboard.JUMP = true;
    }
});

window.addEventListener("keyup", (event) => {
    if (event.keyCode == 39 || event.keycode == 68) {
        keyboard.RIGHT = false;
    }
    if (event.keyCode == 37 || event.keycode == 65) {
        keyboard.LEFT = false;
    }
    if (event.keyCode == 38 || event.keycode == 87) {
        keyboard.UP = false;
    }
    if (event.keyCode == 37 || event.keycode == 40) {
        keyboard.DOWN = false;
    }
    if (event.keyCode == 32) {
        keyboard.JUMP = false;
    }
});



// --------------- START -----------

