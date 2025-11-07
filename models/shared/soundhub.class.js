/**
 * Global sound service that owns every SFX/music asset, handles autoplay unlock, and
 * exposes helpers for syncing, muting, and UI integration.
 */
class AudioHub {
    static START_SCREEN_MUSIC = AudioHub.createLoopingAudio('./01_assets/00_audio/looping_intro.mp3', 0.2);
    static GAMEPLAY_MUSIC = AudioHub.createLoopingAudio('./01_assets/00_audio/looping_gameplay.mp3', 0.05);

    static WALK_HERO = AudioHub.createAudio('./01_assets/00_audio/walking/Hero/indoor-footsteps-6385 (mp3cut.net).mp3', 1);
    static SWORD_DRAW = AudioHub.createAudio('./01_assets/00_audio/sword/draw-sword1-44724.mp3', 0.8);
    static SWORD_SLICE = AudioHub.createAudio('./01_assets/00_audio/sword/sword-slice-393847.mp3', 0.8);
    static CAST_HOLY = AudioHub.createAudio('./01_assets/00_audio/cast/holy_cast.mp3', 0.75);
    static CAST_DARK = AudioHub.createAudio('./01_assets/00_audio/cast/dark_cast.mp3', 0.75);

    static CAST_DARK_PICKUP = AudioHub.createAudio('./01_assets/00_audio/pickup_cast/particle-mask-breath-through-mouth-103531 (mp3cut.net).mp3', 1);
    static CAST_HOLY_PICKUP = AudioHub.createAudio('./01_assets/00_audio/pickup_cast/silver-chime-290187 (mp3cut.net).mp3', 1);

    static CAST_DARK_IMPACT = AudioHub.createAudio('./01_assets/00_audio/hurt/fire-sound-effects-224089 (mp3cut.net).mp3', 0.75);
    static CAST_HOLY_IMPACT = AudioHub.createAudio('./01_assets/00_audio/hurt/impact-sound-effect-308750 (mp3cut.net).mp3', 0.75);
    static SWORD_IMPACT = AudioHub.createAudio('./01_assets/00_audio/crushing_bones/bone-break-2-140224.mp3', 0.75);
    static PUNCH_IMPACT = AudioHub.createAudio('./01_assets/00_audio/hurt/thud-impact-sound-sfx-379990.mp3', 0.75);

    static JUMP_HERO = AudioHub.createAudio('./01_assets/00_audio/jump_and_land/swoosh-011-352855 (mp3cut.net).mp3', 0.7);
    static FALL_HERO = AudioHub.createAudio('./01_assets/00_audio/jump_and_land/walk-on-dirt-1-291981 (mp3cut.net).mp3', 0.55);
    static SLIDE_HERO = AudioHub.createAudio('./01_assets/00_audio/jump_and_land/sliding.mp3', 0.7);
    static PUNCH_HERO = AudioHub.createAudio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3', 0.75);
    static SWORD_SHEATHE = AudioHub.createAudio('./01_assets/00_audio/sword/sheathe_sword.mp3', 0.8);
    static HURT_HERO = AudioHub.createAudio('./01_assets/00_audio/hurt/ouch-oof-hurt-sound-effect-262616 (mp3cut.net).mp3', 0.9);
    static IDLE_HERO = AudioHub.createLoopingAudio('./01_assets/00_audio/walking/man-panting-softly-401018.mp3', 1);
    static DEATH_HERO = AudioHub.createAudio('./01_assets/00_audio/sword/sword-clattering-to-the-ground-393838.mp3', 0.9);

    static SKELETON_WALK = AudioHub.createAudio('./01_assets/00_audio/walking/giant-robot-footsteps-in-cave-199854 (mp3cut.net).mp3', 0.65);
    static SKELETON_IDLE = AudioHub.createAudio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3', 0.5);
    static SKELETON_ATTACK = AudioHub.createAudio('./01_assets/00_audio/heavy_whoosh/heavy-whoosh-04-414577.mp3', 0.75);
    static SKELETON_HURT = AudioHub.createAudio('./01_assets/00_audio/monster_sounds/monster-screech-368677.mp3', 1);
    static SKELETON_DEAD = AudioHub.createAudio('./01_assets/00_audio/boss_death.mp3', 0.85);
    static SKELETON_LAUGHING = AudioHub.createAudio('./01_assets/00_audio/laughter/evil-laugh-with-reverb-423668.mp3', 0.7);

    static GOBLIN_WALK = AudioHub.createAudio('./01_assets/00_audio/walking/footsteps-on-gravel-2-397986 (mp3cut.net).mp3', 0);
    static GOBLIN_IDLE = AudioHub.createAudio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3', 0.45);
    static GOBLIN_ATTACK = AudioHub.createAudio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3', 0.6);
    static GOBLIN_HURT = AudioHub.createAudio('./01_assets/00_audio/hurt/goblin-death-6729 (mp3cut.net).mp3', 1);
    static GOBLIN_DEAD = AudioHub.createAudio('./01_assets/00_audio/sword/violent-sword-slice-2-393841.mp3', 0.8);

    static MUSHROOM_WALK = AudioHub.createAudio('./01_assets/00_audio/walking/footsteps-on-gravel-2-397986 (mp3cut.net).mp3', 0);
    static MUSHROOM_IDLE = AudioHub.createAudio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3', 0.45);
    static MUSHROOM_ATTACK = AudioHub.createAudio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3', 0.6);
    static MUSHROOM_HURT = AudioHub.createAudio('./01_assets/00_audio/hurt/goblin-death-6729 (mp3cut.net).mp3', 1);
    static MUSHROOM_DEAD = AudioHub.createAudio('./01_assets/00_audio/sword/violent-sword-slice-2-393841.mp3', 0.8);
    
    static BAT_WALK = AudioHub.createAudio('./01_assets/00_audio/walking/footsteps-on-gravel-2-397986 (mp3cut.net).mp3', 0);
    static BAT_IDLE = AudioHub.createAudio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3', 0.45);
    static BAT_ATTACK = AudioHub.createAudio('./01_assets/00_audio/whoosh/simple-whoosh-382724.mp3', 0.6);
    static BAT_HURT = AudioHub.createAudio('./01_assets/00_audio/hurt/goblin-death-6729 (mp3cut.net).mp3', 1);
    static BAT_DEAD = AudioHub.createAudio('./01_assets/00_audio/sword/violent-sword-slice-2-393841.mp3', 0.8);

	static activeClones = new Set();
	static masterVolume = 0.2;
	static previousVolume = 0.2;
	static muteRestoreVolume = 0.2;
	static isMuted = false;
	static currentMusic = null;
	static heroIdleLoopActive = false;
    static pendingHeroIdleResume = false;
    static isUnlocked = false;
    static unlockHandlersAttached = false;
    static pendingMusic = null;

    /**
     * Registers one-time user-input listeners so audio playback is unlocked on browsers that require it.
     */
    static ensureInteractionUnlock() {
        if (this.isUnlocked || this.unlockHandlersAttached) return;
        if (typeof window === "undefined") return;
        const unlockHandler = () => this.unlock();
        const options = { once: true, capture: true };
        ['pointerdown', 'keydown', 'touchstart'].forEach(event => {
            window.addEventListener(event, unlockHandler, options);
        });
        this.unlockHandlersAttached = true;
    }

    /**
     * Resolves any pending playback promises queued before the first interaction arrived.
     */
    static unlock() {
        if (this.isUnlocked) return;
        this.isUnlocked = true;
        this.unlockHandlersAttached = false;
        if (this.pendingMusic) {
            const music = this.pendingMusic;
            this.pendingMusic = null;
            this.playMusicTrack(music);
        } else {
            this.resumeCurrentMusic();
        }
        if (this.pendingHeroIdleResume) {
            this.playHeroIdleLoop(true);
        }
    }

    /** Non-looping effects used for bulk volume/mute updates. */
    static allSounds = [
        AudioHub.START_SCREEN_MUSIC,
        AudioHub.GAMEPLAY_MUSIC,
        AudioHub.WALK_HERO,
        AudioHub.SWORD_DRAW,
        AudioHub.SWORD_SLICE,
        AudioHub.SWORD_SHEATHE,
        AudioHub.CAST_HOLY,
        AudioHub.CAST_DARK,

        AudioHub.CAST_DARK_IMPACT,
        AudioHub.CAST_HOLY_IMPACT,
        AudioHub.SWORD_IMPACT,
        AudioHub.PUNCH_IMPACT,

        AudioHub.JUMP_HERO,
        AudioHub.FALL_HERO,
        AudioHub.SLIDE_HERO,
        AudioHub.PUNCH_HERO,
        AudioHub.IDLE_HERO,
        AudioHub.HURT_HERO,
        AudioHub.DEATH_HERO,

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

        AudioHub.MUSHROOM_WALK,
        AudioHub.MUSHROOM_IDLE,
        AudioHub.MUSHROOM_ATTACK,
        AudioHub.MUSHROOM_HURT,
        AudioHub.MUSHROOM_DEAD,

        AudioHub.BAT_WALK,
        AudioHub.BAT_IDLE,
        AudioHub.BAT_ATTACK,
        AudioHub.BAT_HURT,
        AudioHub.BAT_DEAD,
    ];

    /** Mapping used by `syncSound` to align animation frames with SFX. */
    static animationSoundSync = [
		{ animation: 'DRAW_SWORD', frames: [0], sound: AudioHub.SWORD_DRAW },
		{ animation: 'SHEATHE_SWORD', frames: [0], sound: AudioHub.SWORD_SHEATHE },
		{ animation: 'ATTACK', frames: [0, 4], sound: AudioHub.PUNCH_HERO },
		{ animation: 'ATTACK_SWORD', frames: [1], sound: AudioHub.SWORD_SLICE },
		{ animation: 'WALK', frames: [2, 5], sound: AudioHub.WALK_HERO },
		{ animation: 'WALK_SWORD', frames: [2, 5], sound: AudioHub.WALK_HERO },
		{ animation: 'CAST_HOLY', frames: [2], sound: AudioHub.CAST_HOLY },
		{ animation: 'CAST_DARK', frames: [2], sound: AudioHub.CAST_DARK },

		{ animation: 'GOBLIN_WALK', frames: [0], sound: AudioHub.GOBLIN_WALK },
		{ animation: 'SKELETON_ATTACK', frames: [3], sound: AudioHub.SKELETON_ATTACK },
		{ animation: 'SKELETON_WALK', frames: [1], sound: AudioHub.SKELETON_WALK },
		{ animation: 'BAT_WALK', frames: [0], sound: AudioHub.BAT_WALK },
		{ animation: 'MUSHROOM_WALK', frames: [1], sound: AudioHub.MUSHROOM_WALK },
    ];

    /**
     * Plays a sound tied to a specific animation frame when metadata matches.
     *
     * @param {string} animationName
     * @param {number} frameIndex
     */
    static syncSound(animationName, frameIndex) {
        for (const rule of this.animationSoundSync) {
            if (rule.animation === animationName && rule.frames.includes(frameIndex)) {
                this.playOne(rule.sound);
            }
        }
    }

	/**
	 * Plays the given audio element, cloning it if the original is already mid-playback.
	 *
	 * @param {HTMLAudioElement|null} sound
	 */
	static playOne(sound) {
        if (!this.isUnlocked) {
            this.ensureInteractionUnlock();
            return;
        }
		const audio = sound.cloneNode();
		audio._baseVolume = this.getBaseVolume(sound);
		audio.volume = this.getBaseVolume(audio) * this.getEffectiveVolume();
		audio.currentTime = 0;
		AudioHub.activeClones.add(audio);
        audio.addEventListener('ended', () => AudioHub.activeClones.delete(audio));
        audio.addEventListener('pause', () => {
            if (audio.currentTime === 0 || audio.ended) {
                AudioHub.activeClones.delete(audio);
            }
        });
		audio.play().catch(error => {
			if (error?.name === 'AbortError') return;
			if (error?.name === 'NotAllowedError') {
				this.ensureInteractionUnlock();
				return;
			}
			console.warn('Playback failed:', error);
		});
    }

    /**
     * Applies a master volume value to all sound objects and active clones.
     *
     * @param {number} volume
     */
    static applyVolumeToAll(volume) {
        this.allSounds.forEach(sound => {
            sound.volume = this.getBaseVolume(sound) * volume;
        });
        this.activeClones.forEach(clone => {
            clone.volume = this.getBaseVolume(clone) * volume;
        });
        if (this.currentMusic) {
            this.currentMusic.volume = this.getBaseVolume(this.currentMusic) * volume;
        }
    }

    /**
     * @returns {number} Master volume when not muted, or 0 when muted.
     */
    static getEffectiveVolume() {
        return this.isMuted ? 0 : this.masterVolume;
    }

    /**
     * Updates the stored master volume and reapplies it to the current sound set.
     *
     * @param {number} value
     */
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

    /**
     * Flips mute state, preserving the previous volume for restoration.
     */
    static toggleMute() {
        this.isMuted ? this.unmuteAudio() : this.muteAudio();
        return { volume: this.masterVolume, isMuted: this.isMuted };
    }

    /**
     * Explicitly clears mute and restores the previous volume snapshot.
     */
    static unmuteAudio() {
        this.isMuted = false;
        if (typeof this.muteRestoreVolume === 'number') {
            this.masterVolume = this.muteRestoreVolume;
        }
        this.applyVolumeToAll(this.getEffectiveVolume());
        this.resumeCurrentMusic();
        if (this.pendingHeroIdleResume) {
            this.playHeroIdleLoop(true);
        }
        this.pendingHeroIdleResume = false;
    }

    /**
     * Stores the current volume and sets mute state without altering UI flags elsewhere.
     */
    static muteAudio() {
        this.muteRestoreVolume = this.masterVolume;
        if (this.masterVolume > 0) {
            this.previousVolume = this.masterVolume;
        }
        this.pendingHeroIdleResume = this.heroIdleLoopActive;
        this.isMuted = true;
        this.applyVolumeToAll(0);
        this.pauseCurrentMusic();
        this.stopHeroIdleLoop();
    }

    /**
     * Hydrates master volume/mute state from persisted storage on boot.
     */
    static initializeVolume() {
        this.applyVolumeToAll(this.getEffectiveVolume());
    }

    /**
     * Creates and configures an audio element with the provided defaults.
     *
     * @param {string} src
     * @param {number} [baseVolume=1]
     * @param {boolean} [loop=false]
     * @returns {HTMLAudioElement}
     */
    static createAudio(src, baseVolume = 1, loop = false) {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.preload = 'auto';
        audio._baseVolume = this.clampVolume(baseVolume);
        return audio;
    }

    /**
     * Helper for looping tracks such as music beds.
     *
     * @param {string} src
     * @param {number} [baseVolume=1]
     * @returns {HTMLAudioElement}
     */
    static createLoopingAudio(src, baseVolume = 1) {
        return this.createAudio(src, baseVolume, true);
    }

    /**
     * @param {number} value
     * @returns {number} Value constrained to the range [0, 1].
     */
    static clampVolume(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return 1;
        return Math.min(1, Math.max(0, numeric));
    }

    /**
     * Reads the private base volume value stored on an audio element.
     *
     * @param {HTMLAudioElement} audio
     * @returns {number}
     */
    static getBaseVolume(audio) {
        if (!audio) return 1;
        const base = audio._baseVolume;
        return typeof base === 'number' && Number.isFinite(base) ? base : 1;
    }

    /**
     * Starts the intro loop (pausing gameplay music if necessary).
     */
    static async playStartScreenMusic() {
        this.stopGameplayMusic();
        await this.playMusicTrack(this.START_SCREEN_MUSIC);
    }

    /**
     * Starts the gameplay loop (pausing intro music if necessary).
     */
    static async playGameplayMusic() {
        this.stopStartScreenMusic();
        await this.playMusicTrack(this.GAMEPLAY_MUSIC);
    }

	/**
	 * Core music handler that honors autoplay restrictions and tracks the active loop.
	 *
	 * @param {HTMLAudioElement} audio
	 */
	static async playMusicTrack(audio) {
		if (!audio) return;
        this.currentMusic = audio;
        if (!this.isUnlocked) {
            this.pendingMusic = audio;
            this.ensureInteractionUnlock();
            return;
        }
		audio.volume = this.getBaseVolume(audio) * this.getEffectiveVolume();
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
            if (error?.name === 'AbortError') {
                return;
            }
            if (error?.name === 'NotAllowedError') {
                this.pendingMusic = audio;
                this.ensureInteractionUnlock();
                return;
            }
            console.warn('Music playback blocked:', error);
        }
    }

	static stopStartScreenMusic() {
        this.stopMusic(this.START_SCREEN_MUSIC);
        if (this.currentMusic === this.START_SCREEN_MUSIC) {
            this.currentMusic = null;
        }
        if (!this.isUnlocked && this.pendingMusic === this.START_SCREEN_MUSIC) {
            this.pendingMusic = null;
        }
	}

	static stopGameplayMusic() {
        this.stopMusic(this.GAMEPLAY_MUSIC);
        if (this.currentMusic === this.GAMEPLAY_MUSIC) {
            this.currentMusic = null;
        }
        if (!this.isUnlocked && this.pendingMusic === this.GAMEPLAY_MUSIC) {
            this.pendingMusic = null;
        }
	}

    /**
     * Stops and rewinds the provided music track.
     *
     * @param {HTMLAudioElement} audio
     */
    static stopMusic(audio) {
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
    }

    /**
     * Pauses whichever looping track is currently playing.
     */
    static pauseCurrentMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }

    /**
     * Resumes the previously paused looping track.
     */
    static resumeCurrentMusic() {
        if (this.currentMusic && this.currentMusic.paused) {
            this.currentMusic.volume = this.getBaseVolume(this.currentMusic) * this.getEffectiveVolume();
            this.currentMusic.play().catch(error => console.warn('Music resume blocked:', error));
        }
    }

    /**
     * Convenience helper that stops both start-screen and gameplay loops.
     */
    static stopBackgroundMusic() {
        this.stopStartScreenMusic();
        this.stopGameplayMusic();
        this.currentMusic = null;
    }

	/**
	 * Starts (or restarts) the hero idle breathing loop when conditions allow.
	 *
	 * @param {boolean} [force=false]
	 */
	static playHeroIdleLoop(force = false) {
		if (!this.IDLE_HERO) return;
        if (!this.ensureHeroIdleUnlocked(force)) return;
		if (this.shouldAbortHeroIdleLoop()) return;
        if (this.heroIdleLoopActive && !force) return;
        const audio = this.prepareHeroIdleAudio();
        this.startHeroIdlePlayback(audio);
    }

    /**
     * Validates autoplay conditions and prepares the idle loop element for playback.
     */
    static ensureHeroIdleUnlocked(force) {
        if (this.isUnlocked || force) {
            this.pendingHeroIdleResume = false;
            return true;
        }
        this.pendingHeroIdleResume = true;
        this.ensureInteractionUnlock();
        return false;
    }

    /**
     * @returns {boolean} Whether the idle loop should be suppressed (e.g., muted or paused).
     */
    static shouldAbortHeroIdleLoop() {
        if (!this.IDLE_HERO) return true;
        if (this.isMuted || this.getEffectiveVolume() === 0) {
            this.stopHeroIdleLoop();
            return true;
        }
        return false;
    }

    /**
     * Applies effective volume and rewinds the idle audio element before playback.
     *
     * @returns {HTMLAudioElement}
     */
    static prepareHeroIdleAudio() {
        const audio = this.IDLE_HERO;
        audio.loop = true;
        audio.volume = this.getBaseVolume(audio) * this.getEffectiveVolume();
        return audio;
    }

    /**
     * Begins playback on the idle audio element and captures the returned promise.
     *
     * @param {HTMLAudioElement} audio
     */
    static startHeroIdlePlayback(audio) {
        try {
            this.heroIdleLoopActive = true;
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise instanceof Promise) {
                this.handleHeroIdlePromise(playPromise);
            } else {
                this.heroIdleLoopActive = true;
            }
        } catch (error) {
            this.handleHeroIdlePlaybackError(error);
        }
    }

    /**
     * Watches the playback promise so we can mark the loop active or recover on failure.
     */
    static handleHeroIdlePromise(playPromise) {
        playPromise.then(() => {
            this.heroIdleLoopActive = true;
        }).catch(error => this.handleHeroIdlePlaybackError(error));
    }

    /**
     * Handles autoplay failures when trying to start the idle loop.
     *
     * @param {any} error
     */
    static handleHeroIdlePlaybackError(error) {
        this.heroIdleLoopActive = false;
        if (error?.name === 'AbortError') return;
        if (error?.name === 'NotAllowedError') {
            this.pendingHeroIdleResume = true;
            this.ensureInteractionUnlock();
            return;
        }
        console.warn('Idle loop playback issue:', error);
    }

    /**
     * Stops the hero idle loop and clears pending playback promises.
     */
    static stopHeroIdleLoop() {
        if (!this.IDLE_HERO) return;
        const audio = this.IDLE_HERO;
        this.heroIdleLoopActive = false;
        this.pendingHeroIdleResume = false;
        audio.pause();
        audio.currentTime = 0;
    }

    /**
     * Plays the hero hurt SFX and ensures the idle loop is paused beforehand.
     */
    static playHeroHurt() {
        this.stopHeroIdleLoop();
        this.playOne(this.HURT_HERO);
    }

    /**
     * Plays the hero death SFX and ensures the idle loop is paused beforehand.
     */
    static playHeroDeath() {
        this.stopHeroIdleLoop();
        this.playOne(this.DEATH_HERO);
    }

    /**
     * Ensures a sound fires only once while a key is held down, using a shared flag object.
     *
     * @param {{value:boolean}} flagRef
     * @param {HTMLAudioElement} sound
     * @param {boolean} isPressed
     * @param {boolean} [canTrigger=true]
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

    /**
     * Stops all tracked audio, clones, and hero idle loops.
     */
    static stopAll() {
        this.stopBackgroundMusic();
        this.stopHeroIdleLoop();
        this.pendingHeroIdleResume = false;
        this.resetAllSoundInstances();
        this.resetMuteState();
        this.resetSoundControls();
    }

    /**
     * Rewinds every sound asset so they can play from the start again.
     */
    static resetAllSoundInstances() {
        AudioHub.allSounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        AudioHub.activeClones.forEach(clone => {
            clone.pause();
            clone.currentTime = 0;
        });
        AudioHub.activeClones.clear();
    }

    /**
     * Ensures mute/volume state is in a known configuration before updating UI controls.
     *
     * @param {number} [defaultVolume=0.2]
     */
    static resetMuteState(defaultVolume = 0.2) {
        this.isMuted = false;
        this.setVolume(defaultVolume);
    }

    /**
     * Resets sliders, mute buttons, and any CSS indicators reflecting sound state.
     */
    static resetSoundControls() {
        this.resetVolumeSliders(String(this.masterVolume));
        this.resetMuteButtons();
        this.clearInstrumentIndicators();
    }

    /**
     * Updates volume sliders in the DOM to reflect the provided value.
     *
     * @param {number} value
     */
    static resetVolumeSliders(value) {
        document.querySelectorAll('.sound-volume').forEach(element => {
            if (element instanceof HTMLInputElement) {
                element.value = value;
            }
        });
    }

    /**
     * Updates mute button data attributes/styles so UI reflects the actual mute state.
     */
    static resetMuteButtons() {
        document.querySelectorAll('.sound-mute').forEach(button => {
            button.textContent = 'Mute';
            button.setAttribute('aria-pressed', 'false');
            button.classList.remove('is-muted');
        });
    }

    /**
     * Removes CSS classes that highlight currently playing instruments.
     */
    static clearInstrumentIndicators() {
        document.querySelectorAll('.sound_img').forEach(img => img.classList.remove('active'));
    }

    /**
     * Stops a specific sound effect and clears any related instrument indicator.
     *
     * @param {HTMLAudioElement} sound
     * @param {string} [instrumentId]
     */
    static stopOne(sound, instrumentId) {
        sound.pause();
        const instrumentImg = document.getElementById(instrumentId);
        if (instrumentImg) instrumentImg.classList.remove('active');
    }
}

AudioHub.initializeVolume();
