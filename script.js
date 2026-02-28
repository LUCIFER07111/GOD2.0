(function() {
    // ---------- FULLSCREEN TOGGLE ----------
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fsIcon = fullscreenBtn.querySelector('i');

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fsIcon.className = 'fa-solid fa-compress';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fsIcon.className = 'fa-solid fa-expand';
            }
        }
    }
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) fsIcon.className = 'fa-solid fa-expand';
    });

    // ---------- RAINY MOOD AUDIO ----------
    const rainyPlayBtn = document.getElementById('rainyPlayBtn');
    const rainyAudio = document.getElementById('rainyAudio');
    let isRainyPlaying = false;
    rainyAudio.src = 'audio/rain.mp3'; // change if needed
    rainyAudio.load();

    rainyPlayBtn.addEventListener('click', () => {
        if (isRainyPlaying) {
            rainyAudio.pause();
            rainyPlayBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> play';
            rainyPlayBtn.classList.remove('playing');
        } else {
            rainyAudio.play().catch(err => {
                console.log('Rainy audio failed:', err);
                alert('Could not play rainy mood audio. Check file path.');
            });
            rainyPlayBtn.innerHTML = '<i class="fa-regular fa-circle-pause"></i> pause';
            rainyPlayBtn.classList.add('playing');
        }
        isRainyPlaying = !isRainyPlaying;
    });
    rainyAudio.addEventListener('ended', () => {
        isRainyPlaying = false;
        rainyPlayBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> play';
        rainyPlayBtn.classList.remove('playing');
    });

    // ---------- USER MUSIC PLAYLIST & PLAYER ----------
    const fileInput = document.getElementById('fileInput');
    const playlistItems = document.getElementById('playlistItems');
    const userAudio = document.getElementById('userAudio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSongSpan = document.getElementById('currentSong');
    const musicControls = document.getElementById('musicControls');

    let playlist = [];           // array of { name, url }
    let currentIndex = -1;
    let isPlaying = false;

    // Show music controls if there are songs
    function updateControlsVisibility() {
        if (playlist.length > 0) {
            musicControls.classList.add('visible');
        } else {
            musicControls.classList.remove('visible');
        }
    }

    // Update playlist UI
    function renderPlaylist() {
        playlistItems.innerHTML = '';
        playlist.forEach((item, idx) => {
            const li = document.createElement('li');
            li.textContent = item.name;
            li.addEventListener('click', () => playSong(idx));
            playlistItems.appendChild(li);
        });
        updateControlsVisibility();
    }

    // Play song at given index
    function playSong(index) {
        if (index < 0 || index >= playlist.length) return;
        if (currentIndex === index && userAudio.src) {
            // same song: toggle play/pause
            if (isPlaying) {
                userAudio.pause();
            } else {
                userAudio.play().catch(e => console.log(e));
            }
        } else {
            // new song
            currentIndex = index;
            const song = playlist[currentIndex];
            userAudio.src = song.url;
            userAudio.load();
            userAudio.play().catch(e => console.log(e));
            currentSongSpan.textContent = song.name;
        }
        // isPlaying will be updated by events
    }

    function updatePlayPauseIcon() {
        if (isPlaying) {
            playPauseBtn.innerHTML = '<i class="fa-regular fa-circle-pause"></i>';
            playPauseBtn.classList.add('playing');
        } else {
            playPauseBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i>';
            playPauseBtn.classList.remove('playing');
        }
    }

    // Play/pause click
    playPauseBtn.addEventListener('click', () => {
        if (playlist.length === 0) return;
        if (currentIndex === -1) {
            playSong(0);
        } else {
            if (isPlaying) {
                userAudio.pause();
            } else {
                userAudio.play().catch(e => console.log(e));
            }
        }
    });

    // Previous
    prevBtn.addEventListener('click', () => {
        if (playlist.length === 0) return;
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = playlist.length - 1;
        playSong(newIndex);
    });

    // Next
    nextBtn.addEventListener('click', () => {
        if (playlist.length === 0) return;
        let newIndex = currentIndex + 1;
        if (newIndex >= playlist.length) newIndex = 0;
        playSong(newIndex);
    });

    // When song ends, play next
    userAudio.addEventListener('ended', () => {
        if (playlist.length > 0) {
            let newIndex = currentIndex + 1;
            if (newIndex >= playlist.length) newIndex = 0;
            playSong(newIndex);
        } else {
            isPlaying = false;
            updatePlayPauseIcon();
        }
    });

    // Update isPlaying on play/pause events
    userAudio.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseIcon();
    });
    userAudio.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseIcon();
    });

    // File input: add files to playlist
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const url = URL.createObjectURL(file);
            playlist.push({ name: file.name, url: url });
        });
        renderPlaylist();
        // If nothing is playing, select the first song
        if (currentIndex === -1 && playlist.length > 0) {
            currentIndex = 0;
            currentSongSpan.textContent = playlist[0].name;
            userAudio.src = playlist[0].url; // preload
        }
    });

    // ---------- CLOCK ----------
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    let currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let is24Hour = true;

    function updateClockAndDate() {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: currentTimezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !is24Hour,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'short'
        });
        const parts = formatter.formatToParts(now);
        let hour, minute, second, year, month, day, weekday;
        for (const p of parts) {
            if (p.type === 'hour') hour = p.value;
            else if (p.type === 'minute') minute = p.value;
            else if (p.type === 'second') second = p.value;
            else if (p.type === 'year') year = p.value;
            else if (p.type === 'month') month = p.value;
            else if (p.type === 'day') day = p.value;
            else if (p.type === 'weekday') weekday = p.value.toUpperCase();
        }
        if (!is24Hour && hour.length === 1) hour = '0' + hour;
        const seconds = parseInt(second);
        const colon = (seconds % 2 === 0) ? ':' : ' ';
        clockEl.innerText = hour + colon + minute;
        dateEl.innerText = `${year}.${month}.${day} ${weekday}`;
    }
    clockEl.addEventListener('click', () => { is24Hour = !is24Hour; updateClockAndDate(); });
    setInterval(updateClockAndDate, 1000);

    // ---------- MODE TOGGLE (clock ↔ timer) ----------
    const clockMode = document.getElementById('clockMode');
    const timerMode = document.getElementById('timerMode');
    const modeToggle = document.getElementById('modeToggle');

    let timerInterval = null;
    let timerSeconds = 300;
    let stopwatchSeconds = 0;
    let timerRunning = false;
    let stopwatchRunning = false;
    let activeSubMode = 'timer';

    modeToggle.addEventListener('click', () => {
        if (clockMode.style.display !== 'none') {
            clockMode.style.display = 'none';
            timerMode.style.display = 'block';
        } else {
            clockMode.style.display = 'block';
            timerMode.style.display = 'none';
            if (timerRunning) { clearInterval(timerInterval); timerRunning = false; }
            if (stopwatchRunning) { clearInterval(timerInterval); stopwatchRunning = false; }
        }
    });

    // ---------- TIMER / STOPWATCH UI ----------
    const timerDisplay = document.getElementById('timerDisplay');
    const timerControls = document.getElementById('timerControls');
    const timerModeBtn = document.getElementById('timerModeBtn');
    const stopwatchModeBtn = document.getElementById('stopwatchModeBtn');

    function formatTime(secs) {
        const mins = Math.floor(secs / 60).toString().padStart(2, '0');
        const sec = (secs % 60).toString().padStart(2, '0');
        return `${mins}:${sec}`;
    }

    function renderTimerControls() {
        if (activeSubMode === 'timer') {
            timerControls.innerHTML = `
                <button class="timer-btn preset-btn" id="preset5"><i class="fa-regular fa-clock"></i> 5:00</button>
                <button class="timer-btn preset-btn" id="preset10">10:00</button>
                <button class="timer-btn" id="startPauseTimer"><i class="fa-regular fa-circle-play"></i> start</button>
                <button class="timer-btn" id="resetTimer"><i class="fa-regular fa-arrow-rotate-left"></i> reset</button>
            `;
            timerDisplay.innerText = formatTime(timerSeconds);
            attachTimerEvents();
        } else {
            timerControls.innerHTML = `
                <button class="timer-btn" id="startPauseStopwatch"><i class="fa-regular fa-circle-play"></i> start</button>
                <button class="timer-btn" id="resetStopwatch"><i class="fa-regular fa-arrow-rotate-left"></i> reset</button>
                <button class="timer-btn" id="lapStopwatch" disabled style="opacity:0.5;"><i class="fa-regular fa-flag"></i> lap</button>
            `;
            timerDisplay.innerText = formatTime(stopwatchSeconds);
            attachStopwatchEvents();
        }
    }

    function attachTimerEvents() {
        document.getElementById('preset5').addEventListener('click', () => {
            timerSeconds = 300;
            timerDisplay.innerText = formatTime(timerSeconds);
        });
        document.getElementById('preset10').addEventListener('click', () => {
            timerSeconds = 600;
            timerDisplay.innerText = formatTime(timerSeconds);
        });
        const startBtn = document.getElementById('startPauseTimer');
        const resetBtn = document.getElementById('resetTimer');
        startBtn.addEventListener('click', () => {
            if (timerRunning) {
                clearInterval(timerInterval);
                timerRunning = false;
                startBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> start';
            } else {
                timerRunning = true;
                startBtn.innerHTML = '<i class="fa-regular fa-circle-pause"></i> pause';
                timerInterval = setInterval(() => {
                    if (timerSeconds > 0) {
                        timerSeconds--;
                        timerDisplay.innerText = formatTime(timerSeconds);
                    } else {
                        clearInterval(timerInterval);
                        timerRunning = false;
                        startBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> start';
                    }
                }, 1000);
            }
        });
        resetBtn.addEventListener('click', () => {
            if (timerRunning) {
                clearInterval(timerInterval);
                timerRunning = false;
            }
            timerSeconds = 300;
            timerDisplay.innerText = formatTime(timerSeconds);
            startBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> start';
        });
    }

    function attachStopwatchEvents() {
        const startBtn = document.getElementById('startPauseStopwatch');
        const resetBtn = document.getElementById('resetStopwatch');
        startBtn.addEventListener('click', () => {
            if (stopwatchRunning) {
                clearInterval(timerInterval);
                stopwatchRunning = false;
                startBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> start';
            } else {
                stopwatchRunning = true;
                startBtn.innerHTML = '<i class="fa-regular fa-circle-pause"></i> pause';
                timerInterval = setInterval(() => {
                    stopwatchSeconds++;
                    timerDisplay.innerText = formatTime(stopwatchSeconds);
                }, 1000);
            }
        });
        resetBtn.addEventListener('click', () => {
            if (stopwatchRunning) {
                clearInterval(timerInterval);
                stopwatchRunning = false;
            }
            stopwatchSeconds = 0;
            timerDisplay.innerText = formatTime(0);
            startBtn.innerHTML = '<i class="fa-regular fa-circle-play"></i> start';
        });
    }

    timerModeBtn.addEventListener('click', () => {
        if (activeSubMode === 'timer') return;
        activeSubMode = 'timer';
        timerModeBtn.classList.add('active');
        stopwatchModeBtn.classList.remove('active');
        if (stopwatchRunning) { clearInterval(timerInterval); stopwatchRunning = false; }
        renderTimerControls();
    });

    stopwatchModeBtn.addEventListener('click', () => {
        if (activeSubMode === 'stopwatch') return;
        activeSubMode = 'stopwatch';
        stopwatchModeBtn.classList.add('active');
        timerModeBtn.classList.remove('active');
        if (timerRunning) { clearInterval(timerInterval); timerRunning = false; }
        renderTimerControls();
    });

    renderTimerControls();
})();