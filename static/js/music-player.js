/**
 * music-player.js
 * Custom HTML5 Audio Player with localStorage persistence.
 */

class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('music-audio');
        this.player = document.getElementById('music-player');
        this.playBtn = document.getElementById('music-play');
        this.replayBtn = document.getElementById('music-replay');
        this.loopBtn = document.getElementById('music-loop');
        this.muteBtn = document.getElementById('music-mute');
        this.volumeSlider = document.getElementById('music-volume');
        this.progressWrapper = document.getElementById('music-progress-wrapper');
        this.progressFill = document.getElementById('music-progress-fill');
        this.progressHandle = document.getElementById('music-progress-handle');
        this.currentTimeEl = document.getElementById('music-current');
        this.durationEl = document.getElementById('music-duration');
        this.artwork = document.getElementById('music-artwork');
        this.equalizer = document.getElementById('music-equalizer');

        if (!this.audio || !this.player) {
            console.warn('[MusicPlayer] Required elements not found.');
            return;
        }

        this.isPlaying = false;
        this.isLooping = false;
        this.isDragging = false;
        this.storageKeys = {
            volume: 'music_player_volume',
            muted: 'music_player_muted',
            position: 'music_player_position',
        };

        this.init();
    }

    init() {
        this.loadState();
        this.bindEvents();
        this.updatePlayIcon();
        this.updateVolumeIcon();
        this.updateLoopIcon();

        // Restore position after metadata loads
        this.audio.addEventListener('loadedmetadata', () => {
            const savedPosition = localStorage.getItem(this.storageKeys.position);
            if (savedPosition && !isNaN(parseFloat(savedPosition))) {
                this.audio.currentTime = parseFloat(savedPosition);
            }
            this.updateDuration();
        });

        // Save position periodically
        this.audio.addEventListener('timeupdate', () => {
            if (!this.isDragging) {
                this.updateProgress();
                localStorage.setItem(this.storageKeys.position, this.audio.currentTime);
            }
        });

        // Handle playback end
        this.audio.addEventListener('ended', () => {
            if (this.isLooping) {
                this.audio.currentTime = 0;
                this.audio.play();
            } else {
                this.isPlaying = false;
                this.updatePlayIcon();
                this.player.classList.remove('playing');
                this.progressFill.style.width = '0%';
                this.progressHandle.style.left = '0%';
                this.currentTimeEl.textContent = '00:00';
            }
        });

        // Handle loading states
        this.audio.addEventListener('waiting', () => {
            this.player.classList.add('loading');
        });

        this.audio.addEventListener('canplay', () => {
            this.player.classList.remove('loading');
        });

        // Handle errors
        this.audio.addEventListener('error', () => {
            console.error('[MusicPlayer] Audio error:', this.audio.error);
            this.player.classList.add('error');
            this.isPlaying = false;
            this.updatePlayIcon();
            this.player.classList.remove('playing');
        });

        // Auto-play if was playing
        if (this.isPlaying) {
            this.audio.play().catch(() => {
                this.isPlaying = false;
                this.updatePlayIcon();
            });
        }
    }

    bindEvents() {
        // Play/Pause
        this.playBtn.addEventListener('click', () => this.togglePlay());

        // Replay
        this.replayBtn.addEventListener('click', () => {
            this.audio.currentTime = 0;
            this.progressFill.style.width = '0%';
            this.progressHandle.style.left = '0%';
            this.currentTimeEl.textContent = '00:00';
            if (!this.isPlaying) {
                this.togglePlay();
            }
        });

        // Loop toggle
        this.loopBtn.addEventListener('click', () => this.toggleLoop());

        // Mute toggle
        this.muteBtn.addEventListener('click', () => this.toggleMute());

        // Volume change
        this.volumeSlider.addEventListener('input', () => {
            this.audio.volume = parseFloat(this.volumeSlider.value);
            this.audio.muted = false;
            localStorage.setItem(this.storageKeys.volume, this.audio.volume);
            localStorage.setItem(this.storageKeys.muted, 'false');
            this.updateVolumeIcon();
        });

        // Progress bar seek - click
        this.progressWrapper.addEventListener('click', (e) => {
            if (!this.audio.duration) return;
            const rect = this.progressWrapper.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
            this.updateProgress();
        });

        // Progress bar seek - drag
        this.progressWrapper.addEventListener('mousedown', (e) => {
            if (!this.audio.duration) return;
            this.isDragging = true;
            this.handleDrag(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDrag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
            }
        });

        // Touch events for mobile
        this.progressWrapper.addEventListener('touchstart', (e) => {
            if (!this.audio.duration) return;
            this.isDragging = true;
            this.handleDrag(e.touches[0]);
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                this.handleDrag(e.touches[0]);
            }
        });

        document.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.isDragging = false;
            }
        });
    }

    handleDrag(e) {
        if (!this.audio.duration) return;
        const rect = this.progressWrapper.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        this.audio.currentTime = percent * this.audio.duration;
        this.updateProgress();
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updatePlayIcon();
                this.player.classList.add('playing');
            }).catch((err) => {
                console.error('[MusicPlayer] Playback failed:', err);
            });
        } else {
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayIcon();
            this.player.classList.remove('playing');
        }
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.audio.loop = this.isLooping;
        this.updateLoopIcon();
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        localStorage.setItem(this.storageKeys.muted, this.audio.muted ? 'true' : 'false');
        this.updateVolumeIcon();
    }

    updatePlayIcon() {
        const iconPlay = this.playBtn.querySelector('.icon-play');
        const iconPause = this.playBtn.querySelector('.icon-pause');

        if (this.isPlaying) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
        }
    }

    updateVolumeIcon() {
        const iconVolume = this.muteBtn.querySelector('.icon-volume');
        const iconMuted = this.muteBtn.querySelector('.icon-muted');

        if (this.audio.muted || this.audio.volume === 0) {
            iconVolume.style.display = 'none';
            iconMuted.style.display = 'block';
        } else {
            iconVolume.style.display = 'block';
            iconMuted.style.display = 'none';
        }
    }

    updateLoopIcon() {
        if (this.isLooping) {
            this.loopBtn.classList.add('active');
        } else {
            this.loopBtn.classList.remove('active');
        }
    }

    updateProgress() {
        if (!this.audio.duration) return;

        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = `${percent}%`;
        this.progressHandle.style.left = `${percent}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }

    updateDuration() {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    loadState() {
        // Volume
        const savedVolume = localStorage.getItem(this.storageKeys.volume);
        if (savedVolume !== null) {
            this.audio.volume = parseFloat(savedVolume);
            this.volumeSlider.value = this.audio.volume;
        }

        // Mute
        const savedMuted = localStorage.getItem(this.storageKeys.muted);
        if (savedMuted === 'true') {
            this.audio.muted = true;
        }
    }
}

// Initialize player when DOM is ready
let musicPlayer;
document.addEventListener('DOMContentLoaded', function () {
    musicPlayer = new MusicPlayer();
});
