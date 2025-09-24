class MusicPlayer {
    constructor() {
        
        this.tracks = [
            {
                id: 1,
                title: "Vizhi_veekura",
                artist: "Sai Abhyankkar",
                duration: "4:53",
                durationSeconds: 225,
                src: "assests/audios/Song1.mp3"
            },
            {
                id: 2,
                title: "Sithir_puthiri",
                artist: "Sai Abhyankkar",
                duration: "4:47",
                durationSeconds: 260,
                src: "assests/audios/Song2.mp3"
            },
            {
                id: 3,
                title: "Ambikapathy",
                artist: "A.R. Rahman",
                duration: "2:58",
                durationSeconds: 210,
                src: "assests/audios/Song3.mp3"
            },
            {
                id: 4,
                title: "Pottala muttaye",
                artist: "Santhosh Narayanan",
                duration: "4:16",
                durationSeconds: 315,
                src: "assests/audios/Song4.mp3"
            },
            {
                id: 5,
                title: "Tere bina",
                artist: "A.R. Rahman",
                duration: "4:48",
                durationSeconds: 240,
                src: "assests/audios/Song5.mp3"
            }
        ];

        
        this.currentTrackIndex = -1;
        this.isPlaying = false;
        this.isDragging = false;
        this.simulatedTime = 0;
        this.simulationInterval = null;

        
        this.initializeDOMElements();
        this.init();
    }

    initializeDOMElements() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        this.currentTitle = document.getElementById('currentTitle');
        this.currentArtist = document.getElementById('currentArtist');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeDisplay = document.getElementById('volumeDisplay');
        this.playlistContainer = document.getElementById('playlistContainer');
        this.albumIcon = document.getElementById('albumIcon');
        this.shortcutsToggle = document.getElementById('shortcutsToggle');
        this.shortcutsPanel = document.getElementById('shortcutsPanel');
        this.themeToggle = document.getElementById('themeToggle');
    }

    init() {
        this.renderPlaylist();
        this.bindEvents();
        this.loadVolume();
        this.loadTheme();
        this.updateUI();
    }

    renderPlaylist() {
        
        this.playlistContainer.innerHTML = '';
        
        this.tracks.forEach((track, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            playlistItem.setAttribute('data-track-index', index);
            
            playlistItem.innerHTML = `
                <div class="track-number">${index + 1}</div>
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-duration">${track.duration}</div>
            `;
            
            
            playlistItem.onclick = (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.selectTrack(index);
            };
            
            this.playlistContainer.appendChild(playlistItem);
        });
        
    }

    bindEvents() {
        // Player control buttons - with explicit event handlers
        this.playPauseBtn.onclick = (event) => {
            event.preventDefault();
            this.togglePlayPause();
        };
        
        this.prevBtn.onclick = (event) => {
            event.preventDefault();
            this.previousTrack();
        };
        
        this.nextBtn.onclick = (event) => {
            event.preventDefault();
            this.nextTrack();
        };

        // Progress bar interactions
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        this.progressBar.addEventListener('mousedown', (e) => this.startDragging(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDragging());

        // Volume control
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Shortcuts panel toggle - with explicit handler
        this.shortcutsToggle.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.toggleShortcutsPanel();
        };
        
        // Handle clicks outside shortcuts panel
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Audio element events
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgressFromAudio());
        this.audioPlayer.addEventListener('loadedmetadata', () => {
            this.updateTotalTime();
        });
        this.audioPlayer.addEventListener('ended', () => {
            this.nextTrack();
            this.play();
        });
        
    }

    selectTrack(index) {
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        //this.simulatedTime = 0;
        this.audioPlayer.src = track.src;
        this.audioPlayer.currentTime = 0;
        this.currentTitle.textContent = track.title;
        this.currentArtist.textContent = track.artist;
        this.updatePlaylistUI();
        this.updateTotalTime();

        this.isPlaying = true;
        this.play();
    }

    play() {
        if (this.currentTrackIndex === -1) return;
        this.isPlaying = true;
        this.audioPlayer.play().catch(() => {});
    this.updateUI();
    }

    pause() {
        this.isPlaying = false;
        this.audioPlayer.pause();
        this.updateUI();
    }

    togglePlayPause() {
        if (this.currentTrackIndex === -1) {
            this.selectTrack(0); // Start with first track if none selected
            this.play();
            return;
        }
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    previousTrack() {
        if (this.tracks.length === 0) return;
        
        let newIndex;
        if (this.currentTrackIndex <= 0) {
            newIndex = this.tracks.length - 1;
        } else {
            newIndex = this.currentTrackIndex - 1;
        }
        
        this.selectTrack(newIndex);
        
        if (this.isPlaying) {
            this.play();
        }
    }

    nextTrack() {
        if (this.tracks.length === 0) return;
        
        let newIndex;
        if (this.currentTrackIndex >= this.tracks.length - 1) {
            newIndex = 0;
        } else {
            newIndex = this.currentTrackIndex + 1;
        }
        
        this.selectTrack(newIndex);
        
        if (this.isPlaying) {
            this.play();
        }
    }

    startSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
        
        this.simulationInterval = setInterval(() => {
            if (this.isPlaying && !this.isDragging) {
                this.simulatedTime += 1;
                const maxTime = this.tracks[this.currentTrackIndex]?.durationSeconds || 30;
                
                if (this.simulatedTime >= maxTime) {
                    this.simulatedTime = 0;
                    this.nextTrack();
                    return;
                }
                
                this.updateProgressDisplay();
            }
        }, 1000);
    }

    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    updateProgressDisplay() {
        if (this.currentTrackIndex === -1) return;
        
        const duration = this.audioPlayer.duration || this.tracks[this.currentTrackIndex].durationSeconds;
        const current = this.audioPlayer.currentTime || 0;
        const percent = duration ? (current / duration) * 100 : 0;
        
        this.progressFill.style.width = `${percent}%`;
        this.progressHandle.style.left = `${percent}%`;
        this.currentTime.textContent = this.formatTime(current);
    }

    updateProgressFromAudio() {
        this.updateProgressDisplay();
    }

    updateTotalTime() {
        const duration = this.audioPlayer.duration || (this.currentTrackIndex >= 0 ? this.tracks[this.currentTrackIndex].durationSeconds : 0);
        this.totalTime.textContent = this.formatTime(duration || 0);
    }

    seekTo(e) {
        if (this.currentTrackIndex === -1) return;

        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const duration = this.audioPlayer.duration || this.tracks[this.currentTrackIndex].durationSeconds;
        const newTime = percent * duration;
        
        this.audioPlayer.currentTime = newTime;
        this.updateProgressDisplay();
        
    }

    startDragging(e) {
        if (this.currentTrackIndex === -1) return;
        
        this.isDragging = true;
        this.progressBar.classList.add('dragging');
        this.drag(e);
    }

    drag(e) {
        if (!this.isDragging) return;

        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        
        this.progressFill.style.width = `${percent * 100}%`;
        this.progressHandle.style.left = `${percent * 100}%`;
        
        const maxTime = this.audioPlayer.duration || this.tracks[this.currentTrackIndex]?.durationSeconds || 30;
        const time = percent * maxTime;
        this.currentTime.textContent = this.formatTime(time);
    }

    stopDragging() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.progressBar.classList.remove('dragging');
        
        const percent = parseFloat(this.progressFill.style.width) / 100;
        const maxTime = this.audioPlayer.duration || this.tracks[this.currentTrackIndex]?.durationSeconds || 30;
        this.audioPlayer.currentTime = Math.floor(percent * maxTime);
    }

    setVolume(value) {
        this.volumeDisplay.textContent = `${value}%`;
        const vol = Math.max(0, Math.min(100, parseInt(value)));
        this.audioPlayer.volume = vol / 100;
        try { localStorage.setItem('playerVolume', String(vol)); } catch (_) {}
        
        // Update volume icon
        const volumeIcon = document.querySelector('.volume-icon');
        if (vol == 0) {
            volumeIcon.className = 'fas fa-volume-mute volume-icon';
        } else if (vol < 50) {
            volumeIcon.className = 'fas fa-volume-down volume-icon';
        } else {
            volumeIcon.className = 'fas fa-volume-up volume-icon';
        }
    }

    loadVolume() {
        let vol = 70;
        try {
            const saved = localStorage.getItem('playerVolume');
            if (saved != null) vol = parseInt(saved);
        } catch (_) {}
        this.volumeSlider.value = vol;
        this.setVolume(vol);
    }

    loadTheme() {
        let theme = 'dark';
        try {
            const saved = localStorage.getItem('colorScheme');
            if (saved === 'light' || saved === 'dark') theme = saved;
        } catch (_) {}
        document.documentElement.setAttribute('data-color-scheme', theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-color-scheme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-color-scheme', next);
        try { localStorage.setItem('colorScheme', next); } catch (_) {}
        this.updateThemeIcon(next);
    }

    updateThemeIcon(theme) {
        if (!this.themeToggle) return;
        const icon = this.themeToggle.querySelector('i');
        if (!icon) return;
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    updateUI() {
        // Update play/pause button
        const playPauseIcon = this.playPauseBtn.querySelector('i');
        if (this.isPlaying) {
            playPauseIcon.className = 'fas fa-pause';
            this.albumIcon.classList.add('spinning');
        } else {
            playPauseIcon.className = 'fas fa-play';
            this.albumIcon.classList.remove('spinning');
        }

        // Update button states
        const hasTrack = this.currentTrackIndex >= 0;
        this.prevBtn.disabled = !hasTrack;
        this.nextBtn.disabled = !hasTrack;
        
        // Update button styles based on state
        if (hasTrack) {
            this.prevBtn.style.opacity = '1';
            this.nextBtn.style.opacity = '1';
        } else {
            this.prevBtn.style.opacity = '0.5';
            this.nextBtn.style.opacity = '0.5';
        }
        
        // Update playlist highlight and time labels
        this.updatePlaylistUI();
        this.updateTotalTime();
    }

    // Loading indicator removed

    updatePlaylistUI() {
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, index) => {
            if (index === this.currentTrackIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    handleKeyboard(e) {
        // Only handle if not typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const currentVol = parseInt(this.volumeSlider.value);
                this.volumeSlider.value = Math.min(100, currentVol + 5);
                this.setVolume(this.volumeSlider.value);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const currentVolDown = parseInt(this.volumeSlider.value);
                this.volumeSlider.value = Math.max(0, currentVolDown - 5);
                this.setVolume(this.volumeSlider.value);
                break;
        }
    }

    toggleShortcutsPanel() {
        const isHidden = this.shortcutsPanel.classList.contains('hidden');
        
        if (isHidden) {
            this.shortcutsPanel.classList.remove('hidden');
        } else {
            this.shortcutsPanel.classList.add('hidden');
        }
    }

    handleOutsideClick(e) {
        if (!this.shortcutsToggle.contains(e.target) && !this.shortcutsPanel.contains(e.target)) {
            this.shortcutsPanel.classList.add('hidden');
        }
    }

    formatTime(seconds) {
        if (!isFinite(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the music player
document.addEventListener('DOMContentLoaded', () => {
    
    // Create the music player instance
    const musicPlayer = new MusicPlayer();
    
    // Make it globally accessible for debugging
    window.musicPlayer = musicPlayer;
    
    // Add visual enhancements
    setTimeout(() => {
        // Add hover effects to control buttons
        const controlButtons = document.querySelectorAll('.control-btn');
        controlButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled) {
                    btn.style.transform = 'scale(1.05)';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        });

        // Add ripple effect styling
        const style = document.createElement('style');
        style.textContent = `
            .playlist-item {
                position: relative;
                overflow: hidden;
                cursor: pointer;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(31, 184, 205, 0.3);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                z-index: 1;
            }
        `;
        document.head.appendChild(style);

        // Add ripple effect to playlist items
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Create ripple effect
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = `${size}px`;
                ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                this.appendChild(ripple);
                
                // Remove ripple after animation
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        });
        
    }, 100);
});