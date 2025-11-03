class AudioHub {
    static START_SCREEN_MUSIC = AudioHub.createLoopingAudio('./01_assets/00_audio/looping_intro.mp3');
    static GAMEPLAY_MUSIC = AudioHub.createLoopingAudio('./01_assets/00_audio/looping_gameplay.mp3');

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
    static HURT_HERO = new Audio('./01_assets/00_audio/hurt/ouch-oof-hurt-sound-effect-262616 (mp3cut.net).mp3');
    static IDLE_HERO = new Audio('./01_assets/00_audio/walking/man-panting-softly-401018.mp3');


    static SKELETON_WALK = new Audio('./01_assets/00_audio/walking/giant-robot-footsteps-in-cave-199854.mp3');
    static SKELETON_IDLE = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static SKELETON_ATTACK = new Audio('./01_assets/00_audio/heavy_whoosh/heavy-whoosh-04-414577.mp3');
    static SKELETON_HURT = new Audio('./01_assets/00_audio/monster_sounds/monster-screech-368677.mp3');
    static SKELETON_DEAD = new Audio('./01_assets/00_audio/boss_death.mp3');
    static SKELETON_LAUGHING = new Audio('./01_assets/00_audio/laughter/evil-laugh-with-reverb-423668.mp3');

    static GOBLIN_WALK = new Audio('./01_assets/00_audio/walking/footsteps-on-nature-trail-419015.mp3');
    static GOBLIN_IDLE = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static GOBLIN_ATTACK = new Audio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3');
    static GOBLIN_HURT = new Audio('./01_assets/00_audio/hurt/soft-body-impact-295404.mp3');
    static GOBLIN_DEAD = new Audio('./01_assets/00_audio/sword/violent-sword-slice-2-393841.mp3');

    static activeClones = new Set();
    static masterVolume = 0.2;
    static previousVolume = 0.2;
    static muteRestoreVolume = 0.2;
    static isMuted = false;
    static currentMusic = null;

    static allSounds = [
        AudioHub.START_SCREEN_MUSIC,
        AudioHub.GAMEPLAY_MUSIC,
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
        this.allSounds.forEach(sound => {
            sound.volume = volume;
        });
        this.activeClones.forEach(clone => clone.volume = volume);
        if (this.currentMusic) {
            this.currentMusic.volume = volume;
        }
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
            this.resumeCurrentMusic();
        } else {
            this.muteRestoreVolume = this.masterVolume;
            if (this.masterVolume > 0) {
                this.previousVolume = this.masterVolume;
            }
            this.isMuted = true;
            this.applyVolumeToAll(0);
            this.pauseCurrentMusic();
        }
        return { volume: this.masterVolume, isMuted: this.isMuted };
    }

    static initializeVolume() {
        this.applyVolumeToAll(this.getEffectiveVolume());
    }

    static createLoopingAudio(src) {
        const audio = new Audio(src);
        audio.loop = true;
        return audio;
    }

    static async playStartScreenMusic() {
        this.stopGameplayMusic();
        await this.playMusicTrack(this.START_SCREEN_MUSIC);
    }

    static async playGameplayMusic() {
        this.stopStartScreenMusic();
        await this.playMusicTrack(this.GAMEPLAY_MUSIC);
    }

    static async playMusicTrack(audio) {
        if (!audio) return;
        this.currentMusic = audio;
        audio.volume = this.getEffectiveVolume();
        if (this.isMuted || this.getEffectiveVolume() === 0) {
            audio.pause();
            audio.currentTime = 0;
            return;
        }
        if (!audio.loop) audio.loop = true;
        try {
            if (audio.paused) {
                audio.currentTime = 0;
                await audio.play();
            }
        } catch (error) {
            console.warn('Music playback blocked:', error);
        }
    }

    static stopStartScreenMusic() {
        this.stopMusic(this.START_SCREEN_MUSIC);
        if (this.currentMusic === this.START_SCREEN_MUSIC) {
            this.currentMusic = null;
        }
    }

    static stopGameplayMusic() {
        this.stopMusic(this.GAMEPLAY_MUSIC);
        if (this.currentMusic === this.GAMEPLAY_MUSIC) {
            this.currentMusic = null;
        }
    }

    static stopMusic(audio) {
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
    }

    static pauseCurrentMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }

    static resumeCurrentMusic() {
        if (this.currentMusic && this.currentMusic.paused) {
            this.currentMusic.play().catch(error => console.warn('Music resume blocked:', error));
        }
    }

    static stopBackgroundMusic() {
        this.stopStartScreenMusic();
        this.stopGameplayMusic();
        this.currentMusic = null;
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
        this.stopBackgroundMusic();
        AudioHub.allSounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        AudioHub.activeClones.forEach(clone => {
            clone.pause();
            clone.currentTime = 0;
        });
        AudioHub.activeClones.clear();
        const defaultVolume = 0.2;
        this.isMuted = false;
        this.setVolume(defaultVolume);
        document.querySelectorAll('.sound-volume').forEach(element => {
            if (element instanceof HTMLInputElement) {
                element.value = String(this.masterVolume);
            }
        });
        document.querySelectorAll('.sound-mute').forEach(button => {
            button.textContent = 'Mute';
            button.setAttribute('aria-pressed', 'false');
            button.classList.remove('is-muted');
        });
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
