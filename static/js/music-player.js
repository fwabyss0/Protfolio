/**
 * music-player.js
 * Premium horizontal HTML5 Audio Player with localStorage persistence.
 * Supports synchronized lyrics from LRC files and multi-song playlist.
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
        this.titleEl = document.getElementById('music-title');
        this.artistEl = document.getElementById('music-artist');
        this.equalizer = document.getElementById('music-equalizer');
        this.lyricsScroll = document.getElementById('music-lyrics-scroll');
        this.lyricsFallback = document.getElementById('music-lyrics-fallback');

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

        this.playlist = [];
        this.currentIndex = -1;
        this.lrcLines = [];
        this.currentLyricIndex = -1;
        this.lyricRafId = null;
        this.initialized = false;

        this.init();
    }

    init() {
        this.loadState();
        this.bindEvents();
        this.updatePlayIcon();
        this.updateVolumeIcon();
        this.updateLoopIcon();
        this.loadPlaylist();

        this.audio.addEventListener('loadedmetadata', () => {
            if (!this.initialized) {
                const savedPosition = localStorage.getItem(this.storageKeys.position);
                if (savedPosition && !isNaN(parseFloat(savedPosition))) {
                    this.audio.currentTime = parseFloat(savedPosition);
                }
                this.initialized = true;
            }
            this.updateDuration();
            this.syncLyrics();
        });

        this.audio.addEventListener('timeupdate', () => {
            if (!this.isDragging) {
                this.updateProgress();
                localStorage.setItem(this.storageKeys.position, this.audio.currentTime);
            }
        });

        this.audio.addEventListener('ended', () => {
            this.onSongEnded();
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
            this.stopLyricSync();
        });
    }

    async loadPlaylist() {
        try {
            const res = await fetch('/api/music');
            this.playlist = await res.json();
        } catch (e) {
            console.error('[MusicPlayer] Failed to load playlist:', e);
            this.playlist = [];
        }

        if (this.playlist.length === 0) {
            this.playlist = [
                {
                    title: 'Yellow',
                    artist: 'Coldplay',
                    cover: 'static/images/album-cover.jpg',
                    file: 'static/music/song.mp3',
                    lyrics: 'static/lyrics/song.lrc',
                },
                {
                    title: 'Gantabya',
                    artist: 'Ghanshyam Ghimirey',
                    cover: 'static/images/song2.jpg',
                    file: 'static/music/song2.mp3',
                    lyrics: 'static/lyrics/song2.lrc',
                },
            ];
        }

        this.loadSong(0, false);
    }

    loadSong(index, autoPlay = true) {
        if (index < 0 || index >= this.playlist.length) return;

        const wasPlaying = this.isPlaying;
        this.stopLyricSync();

        this.currentIndex = index;
        const song = this.playlist[index];

        this.audio.src = song.file;
        this.audio.load();
        this.artwork.src = song.cover;
        this.titleEl.textContent = song.title || 'Unknown Title';
        this.artistEl.textContent = song.artist || 'Unknown Artist';
        this.durationEl.textContent = '00:00';
        this.progressFill.style.width = '0%';
        this.progressHandle.style.left = '0%';
        this.currentTimeEl.textContent = '00:00';
        this.currentLyricIndex = -1;
        this.updatePlayIcon();
        this.loadLyrics(song.lyrics);

        if (autoPlay && wasPlaying) {
            this.playWhenReady();
        }
    }

    play() {
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayIcon();
            this.player.classList.add('playing');
            this.startLyricSync();
        }).catch((err) => {
            console.error('[MusicPlayer] Playback failed:', err);
        });
    }

    playWhenReady() {
        if (this.audio.readyState >= 2) {
            this.play();
        } else {
            const onCanPlay = () => {
                this.play();
                this.audio.removeEventListener('canplay', onCanPlay);
            };
            this.audio.addEventListener('canplay', onCanPlay);
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayIcon();
        this.player.classList.remove('playing');
        this.stopLyricSync();
    }

    togglePlay() {
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    playNext() {
        if (this.playlist.length === 0) return;
        const nextIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadSong(nextIndex, this.isPlaying);
    }

    playPrev() {
        if (this.playlist.length === 0) return;
        const prevIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadSong(prevIndex, this.isPlaying);
    }

    onSongEnded() {
        if (this.isLooping) {
            this.audio.currentTime = 0;
            this.playWhenReady();
        } else if (this.currentIndex < this.playlist.length - 1) {
            this.playNext();
        } else {
            this.isPlaying = false;
            this.updatePlayIcon();
            this.player.classList.remove('playing');
            this.stopLyricSync();
        }
    }

    parseLRC(text) {
        const lines = text.split('\n');
        const result = [];
        const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

        for (const line of lines) {
            const match = line.match(regex);
            if (!match) continue;
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const ms = parseInt(match[3].padEnd(3, '0'), 10);
            const time = minutes * 60 + seconds + ms / 1000;
            const lyricText = match[4].trim();
            if (lyricText || result.length === 0) {
                result.push({ time, text: lyricText });
            }
        }

        return result;
    }

    async loadLyrics(lrcPath) {
        if (!lrcPath) {
            this.lrcLines = [];
            this.renderLyrics();
            return;
        }

        try {
            const res = await fetch(lrcPath);
            if (!res.ok) throw new Error('LRC not found');
            const text = await res.text();
            this.lrcLines = this.parseLRC(text);
            if (this.lrcLines.length === 0) throw new Error('Empty LRC');
            this.renderLyrics();
        } catch (e) {
            this.lrcLines = [];
            this.renderLyrics();
        }
    }

    renderLyrics() {
        if (!this.lyricsScroll) return;

        if (this.lrcLines.length === 0) {
            this.lyricsScroll.innerHTML = '';
            if (this.lyricsFallback) {
                this.lyricsFallback.style.display = 'flex';
            }
            return;
        }

        if (this.lyricsFallback) {
            this.lyricsFallback.style.display = 'none';
        }

        this.lyricsScroll.innerHTML = this.lrcLines.map((line, index) => `
            <div class="music-lyric-line" data-index="${index}">${this.escapeHtml(line.text)}</div>
        `).join('');

        this.currentLyricIndex = -1;
        this.syncLyrics();
    }

    syncLyrics() {
        if (this.lrcLines.length === 0 || !this.lyricsScroll) return;

        const currentTime = this.audio.currentTime;
        let activeIndex = -1;

        for (let i = this.lrcLines.length - 1; i >= 0; i--) {
            if (currentTime >= this.lrcLines[i].time) {
                activeIndex = i;
                break;
            }
        }

        if (activeIndex === this.currentLyricIndex) return;

        this.currentLyricIndex = activeIndex;

        const lines = this.lyricsScroll.querySelectorAll('.music-lyric-line');
        lines.forEach((el, idx) => {
            el.classList.remove('previous', 'active');
            if (idx === activeIndex) {
                el.classList.add('active');
            } else if (idx < activeIndex) {
                el.classList.add('previous');
            }
        });

        this.scrollToLyric(activeIndex);
    }

    scrollToLyric(newIndex) {
        if (!this.lyricsScroll || newIndex < 0) return;

        const container = this.lyricsScroll.parentElement;
        if (!container) return;

        const containerHeight = container.clientHeight;
        const activeLine = this.lyricsScroll.querySelector(`.music-lyric-line[data-index="${newIndex}"]`);
        if (!activeLine) return;

        const lineTop = activeLine.offsetTop;
        const lineHeight = activeLine.offsetHeight;
        const scrollTop = lineTop - (containerHeight / 2) + (lineHeight / 2);

        this.lyricsScroll.style.transform = `translateY(-${scrollTop}px)`;
    }

    startLyricSync() {
        if (this.lyricRafId) return;
        if (this.lrcLines.length === 0) return;

        const check = () => {
            this.syncLyrics();
            if (this.isPlaying) {
                this.lyricRafId = requestAnimationFrame(check);
            }
        };

        this.lyricRafId = requestAnimationFrame(check);
    }

    stopLyricSync() {
        if (this.lyricRafId) {
            cancelAnimationFrame(this.lyricRafId);
            this.lyricRafId = null;
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());

        this.prevBtn.addEventListener('click', () => {
            this.playPrev();
        });

        this.nextBtn.addEventListener('click', () => {
            this.playNext();
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
            this.syncLyrics();
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
            this.isDragging = false;
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
            this.isDragging = false;
        });

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
                    this.syncLyrics();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.audio.currentTime = Math.min(this.audio.duration || 0, this.audio.currentTime + 5);
                    this.syncLyrics();
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
        this.syncLyrics();
    }
}

// Initialize player when DOM is ready
let musicPlayer;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        musicPlayer = new MusicPlayer();
    });
} else {
    musicPlayer = new MusicPlayer();
}
