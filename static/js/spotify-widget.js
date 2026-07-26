/**
 * spotify-widget.js
 * Spotify Now Playing widget controller.
 * Auto-refreshes every 30 seconds and updates the UI.
 *
 * CONFIGURATION:
 * Set window.SPOTIFY_API_URL before this script loads to override the API endpoint.
 * Example: <script>window.SPOTIFY_API_URL = "https://your-backend.com/api/spotify";</script>
 */

class SpotifyWidget {
    constructor(widgetId, apiUrl) {
        this.widget = document.getElementById(widgetId);
        if (!this.widget) {
            console.warn(`[SpotifyWidget] Element #${widgetId} not found.`);
            return;
        }

        this.apiUrl = apiUrl;
        this.refreshInterval = 30000; // 30 seconds
        this.retryDelay = 5000; // 5 seconds on error
        this.timer = null;
        this.isLoading = false;
        this.fetchTimeout = 10000; // 10 second timeout

        this.init();
    }

    init() {
        this.fetchData();
        this.startAutoRefresh();
    }

    startAutoRefresh() {
        this.timer = setInterval(() => {
            this.fetchData();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async fetchData() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.fetchTimeout);

            const response = await fetch(this.apiUrl, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
                cache: "no-store",
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log(`[SpotifyWidget] API response status: ${response.status}`);

            if (!response.ok) {
                const text = await response.text();
                console.error(`[SpotifyWidget] API error body:`, text);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`[SpotifyWidget] API data:`, data);
            this.render(data);
        } catch (error) {
            console.error("[SpotifyWidget] Fetch error:", error);

            if (error.name === "AbortError") {
                this.renderError("Request timed out. Please try again.");
            } else if (error.message.includes("404")) {
                this.renderError("Spotify API endpoint not found. Check backend deployment.");
            } else if (error.message.includes("500")) {
                this.renderError("Spotify API server error. Check backend logs.");
            } else if (error.message.includes("401") || error.message.includes("403")) {
                this.renderError("Spotify authentication failed. Check credentials.");
            } else {
                this.renderError("Cannot connect to Spotify. Check your connection.");
            }
        } finally {
            this.isLoading = false;
        }
    }

    formatTime(ms) {
        if (!ms || isNaN(ms)) return "0:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    calculateProgress(currentMs, totalMs) {
        if (!totalMs) return 0;
        return Math.min((currentMs / totalMs) * 100, 100);
    }

    createEqualizer(isPlaying) {
        const bars = [1, 2, 3, 4, 5].map(
            (i) =>
                `<div class="eq-bar ${isPlaying ? "playing" : ""}" style="animation-delay: ${i * 0.15}s"></div>`
        ).join("");
        return `<div class="spotify-equalizer">${bars}</div>`;
    }

    renderNowPlaying(track) {
        const progress = this.calculateProgress(track.progress, track.duration);
        const currentTime = this.formatTime(track.progress);
        const totalTime = this.formatTime(track.duration);

        return `
            <div class="spotify-content">
                <div class="spotify-artwork-wrapper">
                    <img
                        src="${track.album_cover || ''}"
                        alt="${this.escapeHtml(track.album)}"
                        class="spotify-artwork"
                        loading="lazy"
                        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2290%22 height=%2290%22><rect fill=%22%23131323%22 width=%2290%22 height=%2290%22/><text x=%2245%22 y=%2250%22 text-anchor=%22middle%22 fill=%22%238888AA%22 font-size=%2212%22>🎵</text></svg>'"
                    >
                    ${this.createEqualizer(track.is_playing)}
                </div>
                <div class="spotify-info">
                    <div class="spotify-title" title="${this.escapeHtml(track.title)}">${this.escapeHtml(track.title)}</div>
                    <div class="spotify-artist" title="${this.escapeHtml(track.artist)}">${this.escapeHtml(track.artist)}</div>
                    <div class="spotify-album" title="${this.escapeHtml(track.album)}">${this.escapeHtml(track.album)}</div>
                    <div class="spotify-status">
                        <span class="spotify-status-dot"></span>
                        Now Playing
                    </div>
                </div>
            </div>
            <div class="spotify-progress-section">
                <div class="spotify-progress-bar-wrapper">
                    <div class="spotify-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="spotify-time">
                    <span>${currentTime}</span>
                    <span>${totalTime}</span>
                </div>
            </div>
            <div class="spotify-actions">
                <a href="${track.spotify_url}" target="_blank" rel="noopener noreferrer" class="spotify-open-btn">
                    <svg viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.18c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                    Open in Spotify
                </a>
                <button class="spotify-refresh" onclick="spotifyWidget.manualRefresh()" title="Refresh">
                    <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                </button>
            </div>
        `;
    }

    renderRecent(track) {
        const playedAt = track.played_at || "Unknown";

        return `
            <div class="spotify-content">
                <div class="spotify-artwork-wrapper">
                    <img
                        src="${track.album_cover || ''}"
                        alt="${this.escapeHtml(track.album)}"
                        class="spotify-artwork"
                        loading="lazy"
                        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2290%22 height=%2290%22><rect fill=%22%23131323%22 width=%2290%22 height=%2290%22/><text x=%2245%22 y=%2250%22 text-anchor=%22middle%22 fill=%22%238888AA%22 font-size=%2212%22>🎵</text></svg>'"
                    >
                    ${this.createEqualizer(false)}
                </div>
                <div class="spotify-info">
                    <div class="spotify-title" title="${this.escapeHtml(track.title)}">${this.escapeHtml(track.title)}</div>
                    <div class="spotify-artist" title="${this.escapeHtml(track.artist)}">${this.escapeHtml(track.artist)}</div>
                    <div class="spotify-album" title="${this.escapeHtml(track.album)}">${this.escapeHtml(track.album)}</div>
                    <div class="spotify-status" style="color: var(--muted);">
                        Last played: ${this.escapeHtml(playedAt)}
                    </div>
                </div>
            </div>
            <div class="spotify-actions">
                <a href="${track.spotify_url}" target="_blank" rel="noopener noreferrer" class="spotify-open-btn">
                    <svg viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.18c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                    Open in Spotify
                </a>
                <button class="spotify-refresh" onclick="spotifyWidget.manualRefresh()" title="Refresh">
                    <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                </button>
            </div>
        `;
    }

    render(data) {
        // Fade out, update, fade in
        this.widget.classList.add("fade-out");

        setTimeout(() => {
            let html = "";

            if (data.error && !data.is_configured) {
                html = this.renderError("Spotify credentials not configured.");
            } else if (data.error === "Spotify Offline") {
                html = this.renderError("Spotify Offline");
            } else if (data.no_recent) {
                html = this.renderNothing();
            } else if (data.track) {
                if (data.is_playing) {
                    html = this.renderNowPlaying(data.track);
                } else {
                    html = this.renderRecent(data.track);
                }
            } else {
                html = this.renderNothing();
            }

            this.widget.innerHTML = html;
            this.widget.classList.remove("fade-out");
            this.widget.classList.add("fade-in");

            setTimeout(() => {
                this.widget.classList.remove("fade-in");
            }, 500);
        }, 300);
    }

    renderError(message) {
        return `
            <div class="spotify-offline">
                <div class="spotify-offline-icon">🔇</div>
                <div>${this.escapeHtml(message)}</div>
            </div>
        `;
    }

    renderNothing() {
        return `
            <div class="spotify-nothing">
                <div class="spotify-nothing-icon">🎵</div>
                <div>Nothing recently played.</div>
            </div>
        `;
    }

    manualRefresh() {
        const btn = this.widget.querySelector(".spotify-refresh");
        if (btn) {
            btn.classList.add("spinning");
            setTimeout(() => btn.classList.remove("spinning"), 400);
        }
        this.fetchData();
    }

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        this.stopAutoRefresh();
        if (this.widget) {
            this.widget.innerHTML = "";
        }
    }
}

// Initialize widget when DOM is ready
let spotifyWidget;
document.addEventListener("DOMContentLoaded", function () {
    // Priority: window.SPOTIFY_API_URL > <meta name="spotify-api-url"> > "/api/spotify"
    const metaTag = document.querySelector('meta[name="spotify-api-url"]');
    const API_URL = window.SPOTIFY_API_URL || (metaTag ? metaTag.getAttribute("content") : "/api/spotify");

    console.log("[SpotifyWidget] Initializing with API URL:", API_URL);
    spotifyWidget = new SpotifyWidget("spotify-widget", API_URL);
});
