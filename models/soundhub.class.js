class AudioHub {
    // Audiodateien für Piano, Guitar, DRUMS
    static WALK_HERO = new Audio('./01_assets/00_audio/walking/Hero/indoor-footsteps-6385 (mp3cut.net).mp3');
    static SWORD_DRAW = new Audio('./01_assets/00_audio/sword/draw-sword1-44724.mp3');
    static SWORD_SLICE = new Audio('./01_assets/00_audio/sword/sword-slice-393847.mp3');
    static CAST_HOLY = new Audio('./01_assets/00_audio/cast/holy_cast.mp3');
    static CAST_DARK = new Audio('./01_assets/00_audio/cast/dark_cast.mp3');
    static JUMP_HERO = new Audio('./01_assets/00_audio/jump_and_land/swoosh-011-352855 (mp3cut.net).mp3');
    static FALL_HERO = new Audio('./01_assets/00_audio/jump_and_land/walk-on-dirt-1-291981 (mp3cut.net).mp3');
    static SLIDE_HERO = new Audio('./01_assets/00_audio/jump_and_land/sliding.mp3');
    static PUNCH_HERO = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');

    static SKELETON_WALK = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static SKELETON_IDLE = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static SKELETON_ATTACK = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static SKELETON_HURT = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static SKELETON_DEAD = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static SKELETON_LAUGHING = new Audio('./01_assets/00_audio/laughter/evil-laugh-with-reverb-423668.mp3');

    static GOBLIN_WALK = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static GOBLIN_IDLE = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static GOBLIN_ATTACK = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static GOBLIN_HURT = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static GOBLIN_DEAD = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');


    // Array, das alle definierten Audio-Dateien enthält
    static allSounds = [
        AudioHub.WALK_HERO,
        AudioHub.SWORD_DRAW,
        AudioHub.SWORD_SLICE,
        AudioHub.CAST_HOLY,
        AudioHub.CAST_DARK,
        AudioHub.JUMP_HERO,
        AudioHub.FALL_HERO,
        AudioHub.SLIDE_HERO,
        AudioHub.PUNCH_HERO,

        AudioHub.SKELETON_WALK,
        AudioHub.SKELETON_IDLE,
        AudioHub.SKELETON_ATTACK,
        AudioHub.SKELETON_HURT,
        AudioHub.SKELETON_DEAD,
        AudioHub.SKELETON_LAUGHING,

        AudioHub.GOBLIN_WALK,
        AudioHub.GOBLIN_IDLE,
        AudioHub.GOBLIN_ATTACK,
        AudioHub.GOBLIN_HURT,
        AudioHub.GOBLIN_DEAD,
    ];

    // ----------------------- METHODS -----------------------

    static animationSoundSync = [ // for SoundSynching

        {
            animation: 'IMAGES_DRAW_SWORD',
            frames: [0],
            sound: AudioHub.SWORD_DRAW
        },

        {
            animation: 'IMAGES_ATTACK',
            frames: [0, 4],
            sound: AudioHub.PUNCH_HERO
        },

        {
            animation: 'IMAGES_ATTACK_SWORD',
            frames: [0],
            sound: AudioHub.SWORD_SLICE
        },

        {
            animation: 'IMAGES_WALK', // name of the animation array
            frames: [2, 5],           // frame indexes that should trigger the sound
            sound: AudioHub.WALK_HERO
        },

        {
            animation: 'IMAGES_WALK_SWORD',
            frames: [2, 5],
            sound: AudioHub.WALK_HERO
        },

        {
            animation: 'IMAGES_CAST_HOLY',
            frames: [2],
            sound: AudioHub.CAST_HOLY
        },

        {
            animation: 'IMAGES_CAST_DARK',
            frames: [2],
            sound: AudioHub.CAST_DARK
        },

        // {
        //     animation: 'IMAGES_JUMP',
        //     frames: [1],
        //     sound: AudioHub.JUMP_HERO
        // },
        // {
        //     animation: 'IMAGES_FALL',
        //     frames: [1],
        //     sound: AudioHub.FALL_HERO
        // },
        // {
        //     animation: 'IMAGES_SLIDE',
        //     frames: [1],
        //     sound: AudioHub.SLIDE_HERO
        // },


    ];

    static syncSound(animationName, frameIndex) { // for SoundSynching
        for (const rule of this.animationSoundSync) {
            if (rule.animation === animationName && rule.frames.includes(frameIndex)) {
                // console.log(`Playing sound for ${animationName} frame ${frameIndex}`);
                this.playOne(rule.sound);
            }
        }
    }



    // Spielt eine einzelne Audiodatei ab
    static playOne(sound) {
        const audio = sound.cloneNode();
        audio.volume = 1;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn("Playback failed:", e));
    }

    /**
     * Plays a sound once per continuous key press or state.
     * @param {{value:boolean}} flagRef - Mutable flag stored on the caller.
     * @param {HTMLAudioElement} sound - Source sound to clone and play.
     * @param {boolean} isPressed - Whether the key/state is currently active.
     * @param {boolean} [canTrigger=true] - Optional guard to block playback while true isPressed states persist.
     */
    static playOncePerKey(flagRef, sound, isPressed, canTrigger = true) {
        if (!flagRef) return;
        if (isPressed && canTrigger) {
            if (!flagRef.value) {
                this.playOne(sound);
                flagRef.value = true;
            }
        } else if (!isPressed) {
            flagRef.value = false;
        }
    }


    // Stoppt das Abspielen aller Audiodateien
    static stopAll() {
        AudioHub.allSounds.forEach(sound => {
            sound.pause();  // Pausiert jedes Audio in der Liste
        });
        document.getElementById('volume').value = 0.2;  // Setzt den Sound-Slider wieder auf 0.2
        const instrumentImages = document.querySelectorAll('.sound_img'); // nur wichtig für die Visualisierung
        instrumentImages.forEach(img => img.classList.remove('active')); // nur wichtig für die Visualisierung
    }


    // Stoppt das Abspielen einer einzelnen Audiodatei
    static stopOne(sound, instrumentId) {
        sound.pause();  // Pausiert das übergebene Audio
        const instrumentImg = document.getElementById(instrumentId); // nur wichtig für die Visualisierung
        instrumentImg.classList.remove('active'); // nur wichtig für die Visualisierung
    }


    // ##########################################################################################################################
    // ################################################  Sound Slider - BONUS !  ################################################
    // Setzt die Lautstärke für alle Audiodateien
    static objSetVolume(volumeSlider) {
        let volumeValue = document.getElementById('volume').value;  // Holt den aktuellen Lautstärkewert aus dem Inputfeld
        volumeSlider.forEach(sound => {
            sound.volume = volumeValue;  // Setzt die Lautstärke für jedes Audio wie im Slider angegeben
        });
    }



    // ------------------------ FOR LOOP ---------------------

    // class AudioError {
    // static LONG = new Audio('./assets/sounds/binary.mp3');

    // Spielt eine einzelne Audiodatei ab, - wenn sie bereit ist - 
    static playTwo(sound) {
        setInterval(() => {  // Wiederholt die Überprüfung alle 200ms
            if (sound.readyState == 3) {  // Überprüft, ob die Audiodatei vollständig geladen ist, wenn man die if abfrage rausnehmen würde, würde es bei start & drücken auf den pause Knopf einen Fehler werfen. (am besten low-tier throttling nutzen!)
                console.log("Sound ready");
                sound.volume = 0.5;  // Setzt die Lautstärke auf 50%
                sound.play();  // Spielt das übergebene Sound-Objekt ab
            } else {
                console.log("Sound not ready");
            }
        }, 200);
    }


    // Pausiert das Abspielen einer einzelnen Audiodatei
    static pauseTwo(sound) {
        sound.pause();  // Pausiert das übergebene Audio
    }
}





