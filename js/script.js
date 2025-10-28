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
    const key = event.key.toLowerCase();

    if (key === "arrowright" || key === "d") keyboard.RIGHT = true;
    if (key === "arrowleft" || key === "a") keyboard.LEFT = true;
    if (key === "arrowup" || key === "w") keyboard.UP = true;
    if (key === "arrowdown" || key === "s") keyboard.DOWN = true;


    if (event.code === "Space") {
        event.preventDefault(); // important to stop scrolling sideways
        keyboard.JUMP = true;
    }

    if (key === "f") keyboard.ATTACK = true
    if (key === "q") keyboard.THROWHOLY = true;
    if (key === "e") keyboard.THROWDARK = true;

});



window.addEventListener("keyup", (event) => {
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


// --------------- START -----------

