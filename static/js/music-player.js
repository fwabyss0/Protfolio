/**
 * music-player.js
 * Premium horizontal HTML5 Audio Player with localStorage persistence.
 */

class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('music-audio');
        this.player = document.getElementById('music-player');
        this.playBtn = document.getElementById('music-play');
        this.prevBtn = document.getElementById('music-prev');
        this.nextBtn = document.getElementById('music-next');
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
        this.lyricText = document.getElementById('music-lyric-text');

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

        // Lyrics for "Yellow" by Coldplay
        this.lyrics = [
            { time: 0, text: '♪' },
            { time: 6, text: 'Look at the stars' },
            { time: 14, text: 'Look how they shine for you' },
            { time: 24, text: 'And everything you do' },
            { time: 32, text: 'Yeah, they were all yellow' },
            { time: 44, text: 'I came along' },
            { time: 52, text: 'I wrote a song for you' },
            { time: 62, text: 'And all the things you do' },
            { time: 72, text: 'And it was called, "Yellow"' },
            { time: 88, text: 'So, then I took my turn' },
            { time: 98, text: 'Oh, what a thing to have done' },
            { time: 110, text: 'And it was all yellow' },
            { time: 122, text: 'Your skin, oh yeah, your skin and bones' },
            { time: 136, text: 'Turn into something beautiful' },
            { time: 150, text: 'And you know' },
            { time: 156, text: 'You know I love you so' },
            { time: 170, text: 'You know I love you so' },
            { time: 184, text: 'I swam across' },
            { time: 192, text: 'I jumped across for you' },
            { time: 204, text: 'Oh, what a thing to do' },
            { time: 216, text: "'Cause you were all yellow" },
            { time: 228, text: 'I drew a line' },
            { time: 236, text: 'I drew a line for you' },
            { time: 248, text: 'Oh, what a thing to do' },
            { time: 260, text: 'And it was all yellow' },
            { time: 272, text: 'And your skin, oh yeah, your skin and bones' },
            { time: 286, text: 'Turn into something beautiful' },
            { time: 300, text: 'And you know, for you' },
            { time: 308, text: "I'd bleed myself dry" },
            { time: 320, text: 'For you, I\'d bleed myself dry' },
            { time: 335, text: "It's true" },
            { time: 345, text: 'Look how they shine for you' },
            { time: 358, text: 'Look how they shine for you' },
            { time: 370, text: 'Look how they shine for you' },
            { time: 388, text: 'Look how they shine' },
            { time: 398, text: 'Look at the stars' },
            { time: 408, text: 'Look how they shine for you' },
            { time: 420, text: 'And all the things that you do' },
            { time: 450, text: '♪' }
        ];
        this.currentLyricIndex = -1;

        this.init();
    }

    init() {
        this.loadState();
        this.bindEvents();
        this.updatePlayIcon();
        this.updateVolumeIcon();
        this.updateLoopIcon();

        this.audio.addEventListener('loadedmetadata', () => {
            const savedPosition = localStorage.getItem(this.storageKeys.position);
            if (savedPosition && !isNaN(parseFloat(savedPosition))) {
                this.audio.currentTime = parseFloat(savedPosition);
            }
            this.updateDuration();
        });

        this.audio.addEventListener('timeupdate', () => {
            if (!this.isDragging) {
                this.updateProgress();
                this.updateLyrics();
                localStorage.setItem(this.storageKeys.position, this.audio.currentTime);
            }
        });

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

        this.audio.addEventListener('waiting', () => {
            this.player.classList.add('loading');
        });

        this.audio.addEventListener('canplay', () => {
            this.player.classList.remove('loading');
        });

        this.audio.addEventListener('error', () => {
            console.error('[MusicPlayer] Audio error:', this.audio.error);
            this.player.classList.add('error');
            this.isPlaying = false;
            this.updatePlayIcon();
            this.player.classList.remove('playing');
        });

        if (this.isPlaying) {
            this.audio.play().catch(() => {
                this.isPlaying = false;
                this.updatePlayIcon();
            });
        }
    }

    bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());

        this.prevBtn.addEventListener('click', () => {
            this.audio.currentTime = 0;
            this.updateProgress();
        });

        this.nextBtn.addEventListener('click', () => {
            this.audio.currentTime = 0;
            this.updateProgress();
        });

        this.loopBtn.addEventListener('click', () => this.toggleLoop());

        this.muteBtn.addEventListener('click', () => this.toggleMute());

        this.volumeSlider.addEventListener('input', () => {
            this.audio.volume = parseFloat(this.volumeSlider.value);
            this.audio.muted = false;
            localStorage.setItem(this.storageKeys.volume, this.audio.volume);
            localStorage.setItem(this.storageKeys.muted, 'false');
            this.updateVolumeIcon();
        });

        this.progressWrapper.addEventListener('click', (e) => {
            if (!this.audio.duration) return;
            const rect = this.progressWrapper.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
            this.updateProgress();
        });

        this.progressWrapper.addEventListener('mousedown', (e) => {
            if (!this.audio.duration) return;
            this.isDragging = true;
            this.handleDrag(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) this.handleDrag(e);
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) this.isDragging = false;
        });

        this.progressWrapper.addEventListener('touchstart', (e) => {
            if (!this.audio.duration) return;
            this.isDragging = true;
            this.handleDrag(e.touches[0]);
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) this.handleDrag(e.touches[0]);
        });

        document.addEventListener('touchend', () => {
            if (this.isDragging) this.isDragging = false;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.audio.currentTime = Math.min(this.audio.duration || 0, this.audio.currentTime + 5);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.audio.volume = Math.min(1, this.audio.volume + 0.05);
                    this.volumeSlider.value = this.audio.volume;
                    localStorage.setItem(this.storageKeys.volume, this.audio.volume);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.audio.volume = Math.max(0, this.audio.volume - 0.05);
                    this.volumeSlider.value = this.audio.volume;
                    localStorage.setItem(this.storageKeys.volume, this.audio.volume);
                    break;
                case 'KeyM':
                    this.toggleMute();
                    break;
                case 'KeyL':
                    this.toggleLoop();
                    break;
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

    updateLyrics() {
        if (!this.lyricText) return;
        const currentTime = this.audio.currentTime;
        let activeIndex = -1;

        for (let i = this.lyrics.length - 1; i >= 0; i--) {
            if (currentTime >= this.lyrics[i].time) {
                activeIndex = i;
                break;
            }
        }

        if (activeIndex !== this.currentLyricIndex) {
            this.currentLyricIndex = activeIndex;
            const lyric = this.lyrics[activeIndex] || { text: '♪' };
            this.lyricText.classList.add('fading');

            setTimeout(() => {
                this.lyricText.textContent = lyric.text;
                this.lyricText.classList.remove('fading');
            }, 600);
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    loadState() {
        const savedVolume = localStorage.getItem(this.storageKeys.volume);
        if (savedVolume !== null) {
            this.audio.volume = parseFloat(savedVolume);
            this.volumeSlider.value = this.audio.volume;
        }

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
