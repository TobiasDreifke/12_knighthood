class AudioHub {
    static WALK_HERO = new Audio('./01_assets/00_audio/walking/Hero/indoor-footsteps-6385 (mp3cut.net).mp3');
    static SWORD_DRAW = new Audio('./01_assets/00_audio/sword/draw-sword1-44724.mp3');
    static SWORD_SLICE = new Audio('./01_assets/00_audio/sword/sword-slice-393847.mp3');
    static CAST_HOLY = new Audio('./01_assets/00_audio/cast/holy_cast.mp3');
    static CAST_DARK = new Audio('./01_assets/00_audio/cast/dark_cast.mp3');
    static JUMP_HERO = new Audio('./01_assets/00_audio/jump_and_land/swoosh-011-352855 (mp3cut.net).mp3');
    static FALL_HERO = new Audio('./01_assets/00_audio/jump_and_land/walk-on-dirt-1-291981 (mp3cut.net).mp3');
    static SLIDE_HERO = new Audio('./01_assets/00_audio/jump_and_land/sliding.mp3');
    static PUNCH_HERO = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static SWORD_SHEATHE = new Audio('./01_assets/00_audio/sword/sheathe_sword.mp3');

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

    static activeClones = new Set();
    static masterVolume = 0.2;
    static previousVolume = 0.2;
    static muteRestoreVolume = 0.2;
    static isMuted = false;

    static allSounds = [
        AudioHub.WALK_HERO,
        AudioHub.SWORD_DRAW,
        AudioHub.SWORD_SLICE,
        AudioHub.SWORD_SHEATHE,
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

    static animationSoundSync = [
        { animation: 'IMAGES_DRAW_SWORD', frames: [0], sound: AudioHub.SWORD_DRAW },
        { animation: 'IMAGES_SHEATHE_SWORD', frames: [0], sound: AudioHub.SWORD_SHEATHE },
        { animation: 'IMAGES_ATTACK', frames: [0, 4], sound: AudioHub.PUNCH_HERO },
        { animation: 'IMAGES_ATTACK_SWORD', frames: [0], sound: AudioHub.SWORD_SLICE },
        { animation: 'IMAGES_WALK', frames: [2, 5], sound: AudioHub.WALK_HERO },
        { animation: 'IMAGES_WALK_SWORD', frames: [2, 5], sound: AudioHub.WALK_HERO },
        { animation: 'IMAGES_CAST_HOLY', frames: [2], sound: AudioHub.CAST_HOLY },
        { animation: 'IMAGES_CAST_DARK', frames: [2], sound: AudioHub.CAST_DARK },
    ];

    static syncSound(animationName, frameIndex) {
        for (const rule of this.animationSoundSync) {
            if (rule.animation === animationName && rule.frames.includes(frameIndex)) {
                this.playOne(rule.sound);
            }
        }
    }

    static playOne(sound) {
        const audio = sound.cloneNode();
        audio.volume = this.getEffectiveVolume();
        audio.currentTime = 0;
        AudioHub.activeClones.add(audio);
        audio.addEventListener('ended', () => AudioHub.activeClones.delete(audio));
        audio.addEventListener('pause', () => {
            if (audio.currentTime === 0 || audio.ended) {
                AudioHub.activeClones.delete(audio);
            }
        });
        audio.play().catch(e => console.warn('Playback failed:', e));
    }

    static applyVolumeToAll(volume) {
        this.allSounds.forEach(sound => sound.volume = volume);
        this.activeClones.forEach(clone => clone.volume = volume);
    }

    static getEffectiveVolume() {
        return this.isMuted ? 0 : this.masterVolume;
    }

    static setVolume(value) {
        const numericValue = Number(value);
        const normalized = Math.max(0, Math.min(1, Number.isFinite(numericValue) ? numericValue : 0));
        this.masterVolume = normalized;
        this.muteRestoreVolume = normalized;
        if (normalized > 0) {
            this.previousVolume = normalized;
            this.isMuted = false;
        }
        this.applyVolumeToAll(this.getEffectiveVolume());
        return { volume: this.masterVolume, isMuted: this.isMuted };
    }

    static toggleMute() {
        if (this.isMuted) {
            this.isMuted = false;
            if (typeof this.muteRestoreVolume === 'number') {
                this.masterVolume = this.muteRestoreVolume;
            }
            this.applyVolumeToAll(this.getEffectiveVolume());
        } else {
            this.muteRestoreVolume = this.masterVolume;
            if (this.masterVolume > 0) {
                this.previousVolume = this.masterVolume;
            }
            this.isMuted = true;
            this.applyVolumeToAll(0);
        }
        return { volume: this.masterVolume, isMuted: this.isMuted };
    }

    static initializeVolume() {
        this.applyVolumeToAll(this.getEffectiveVolume());
    }

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

    static stopAll() {
        AudioHub.allSounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        AudioHub.activeClones.forEach(clone => {
            clone.pause();
            clone.currentTime = 0;
        });
        AudioHub.activeClones.clear();
        const volumeSlider = document.getElementById('volume');
        const defaultVolume = 0.2;
        this.isMuted = false;
        this.setVolume(defaultVolume);
        if (volumeSlider) volumeSlider.value = this.masterVolume;
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.textContent = 'Mute';
            muteButton.setAttribute('aria-pressed', 'false');
            muteButton.classList.remove('is-muted');
        }
        const instrumentImages = document.querySelectorAll('.sound_img');
        instrumentImages.forEach(img => img.classList.remove('active'));
    }

    static stopOne(sound, instrumentId) {
        sound.pause();
        const instrumentImg = document.getElementById(instrumentId);
        if (instrumentImg) instrumentImg.classList.remove('active');
    }
}

AudioHub.initializeVolume();
