class AudioHub {
    // Audiodateien für Piano, Guitar, DRUMS
    static WALK_HERO = new Audio('./01_assets/00_audio/walking/Hero/indoor-footsteps-6385 (mp3cut.net).mp3');

    // Array, das alle definierten Audio-Dateien enthält
    static allSounds = [AudioHub.WALK_HERO,];


    // Spielt eine einzelne Audiodatei ab
    static playOne(sound) {
        const audio = sound.cloneNode();
        audio.volume = 1;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn("Playback failed:", e));
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


    // ----------------------- METHODS -----------------------

    static animationSoundSync = [
        {
            animation: 'IMAGES_WALK', // name of the animation array
            frames: [2, 5],           // frame indexes that should trigger the sound
            sound: AudioHub.WALK_HERO
        },
        // You could add jump, attack, enemy, etc.
    ];

    static syncSound(animationName, frameIndex) {
        for (const rule of this.animationSoundSync) {
            if (rule.animation === animationName && rule.frames.includes(frameIndex)) {
                console.log(`Playing sound for ${animationName} frame ${frameIndex}`);
                this.playOne(rule.sound);
            }
        }
    }

    // ----------------------- METHODS -----------------------


    // static playWalkingSound() {
    //     let sound = AudioHub.WALK_HERO;
    //     if (sound.readyState === 4) {
    //         this.playOne(sound);
    //     }
    // }


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





