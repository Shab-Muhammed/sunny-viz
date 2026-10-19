/**
 * Application Entry Point
 * Orchestrates AudioEngine, Visualizer, UI bindings, and user interactions.
 */

import { AudioEngine } from './audio/lofiEngine.js';
import { Visualizer } from './visuals/visualizer.js';

// Elements
const glCanvas = document.getElementById('glCanvas');
const particleCanvas = document.getElementById('particleCanvas');
const uiOverlay = document.getElementById('uiOverlay');
const welcomeOverlay = document.getElementById('welcomeOverlay');
const settingsDrawer = document.getElementById('settingsDrawer');
const dropZone = document.getElementById('dropZone');

// Track card elements
const pulseIndicator = document.getElementById('pulseIndicator');
const trackBadge = document.getElementById('trackBadge');
const trackTitle = document.getElementById('trackTitle');
const trackMeta = document.getElementById('trackMeta');
const sourceSynthBtn = document.getElementById('sourceSynthBtn');
const sourceFileBtn = document.getElementById('sourceFileBtn');
const sourceMicBtn = document.getElementById('sourceMicBtn');
const audioFileInput = document.getElementById('audioFileInput');

// Scrubber elements
const btnPlayPause = document.getElementById('btnPlayPause');
const playPauseIcon = document.getElementById('playPauseIcon');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const timeCurrent = document.getElementById('timeCurrent');
const timeDuration = document.getElementById('timeDuration');
const progressTrack = document.getElementById('progressTrack');
const progressFill = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const btnToggleRain = document.getElementById('btnToggleRain');
const btnToggleVinyl = document.getElementById('btnToggleVinyl');
const btnMute = document.getElementById('btnMute');
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');

// Quick controls
const btnSettings = document.getElementById('btnSettings');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const btnCinemaMode = document.getElementById('btnCinemaMode');
const btnFullscreen = document.getElementById('btnFullscreen');
const fullscreenIcon = document.getElementById('fullscreenIcon');

// Settings controls
const paletteChips = document.querySelectorAll('.palette-chip');
const sliderEmber = document.getElementById('sliderEmber');
const sliderRibbon = document.getElementById('sliderRibbon');
const sliderSparkle = document.getElementById('sliderSparkle');
const sliderMoteDensity = document.getElementById('sliderMoteDensity');
const sliderGrain = document.getElementById('sliderGrain');
const labelEmberVal = document.getElementById('labelEmberVal');
const labelRibbonVal = document.getElementById('labelRibbonVal');
const labelSparkleVal = document.getElementById('labelSparkleVal');
const labelMoteDensity = document.getElementById('labelMoteDensity');
const labelGrainVal = document.getElementById('labelGrainVal');

// Instantiate Core Engines
const audio = new AudioEngine();
const visualizer = new Visualizer(glCanvas, particleCanvas);

let hasStarted = false;
let isMuted = false;
let previousVolume = 0.85;
let isDraggingScrubber = false;
let idleTimer = null;
let isCinemaMode = false;

// Time formatting helper
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update Play/Pause UI Icon
function updatePlayPauseUI(isPlaying) {
  if (isPlaying) {
    pulseIndicator.classList.remove('paused');
    trackBadge.textContent = 'PLAYING • LO-FI SANCTUARY';
    playPauseIcon.innerHTML = `
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `;
  } else {
    pulseIndicator.classList.add('paused');
    trackBadge.textContent = 'PAUSED • LO-FI SANCTUARY';
    playPauseIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
  }
}

// Update Track Metadata UI
function updateTrackUI(info) {
  if (!info) return;
  trackTitle.textContent = info.title;
  trackMeta.textContent = info.tag ? `${info.artist} • ${info.tag}` : info.artist;

  if (info.isLive) {
    trackBadge.textContent = 'LIVE AUDIO FEED';
    timeCurrent.textContent = 'LIVE';
    timeDuration.textContent = 'REALTIME';
    progressFill.style.width = '100%';
  }
}

// Wire Audio Callbacks
audio.onPlayStateChange = (isPlaying) => {
  updatePlayPauseUI(isPlaying);
};

audio.onTrackChange = (info) => {
  updateTrackUI(info);
};

audio.onTimeUpdate = (currentTime, duration) => {
  if (isDraggingScrubber || audio.sourceMode === 'mic') return;

  timeCurrent.textContent = formatTime(currentTime);
  timeDuration.textContent = formatTime(duration);

  const pct = Math.min(100, Math.max(0, (currentTime / duration) * 100));
  progressFill.style.width = `${pct}%`;
  progressThumb.style.left = `${pct}%`;
};

// Initial welcome start
async function startSanctuary() {
  if (hasStarted) return;
  hasStarted = true;
  welcomeOverlay.classList.add('dissolved');
  await audio.play();
  resetIdleTimer();
}

welcomeOverlay.addEventListener('click', startSanctuary);

// Play / Pause Toggle
btnPlayPause.addEventListener('click', async () => {
  if (!hasStarted) {
    await startSanctuary();
    return;
  }
  await audio.togglePlay();
});

// Next / Prev Tapes
btnNext.addEventListener('click', () => {
  audio.nextTrack();
});

btnPrev.addEventListener('click', () => {
  audio.prevTrack();
});

// Scrubber Seeking
function handleSeek(e) {
  const rect = progressTrack.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const normalized = Math.min(1, Math.max(0, clickX / rect.width));

  progressFill.style.width = `${normalized * 100}%`;
  progressThumb.style.left = `${normalized * 100}%`;
  audio.seek(normalized);
}

progressTrack.addEventListener('mousedown', (e) => {
  isDraggingScrubber = true;
  handleSeek(e);
});

window.addEventListener('mousemove', (e) => {
  if (isDraggingScrubber) {
    handleSeek(e);
  }
});

window.addEventListener('mouseup', () => {
  isDraggingScrubber = false;
});

// Audio Source Selection Pills
sourceSynthBtn.addEventListener('click', () => {
  sourceSynthBtn.classList.add('active');
  sourceFileBtn.classList.remove('active');
  sourceMicBtn.classList.remove('active');
  audio.switchToSynth();
});

sourceFileBtn.addEventListener('click', () => {
  audioFileInput.click();
});

audioFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    sourceSynthBtn.classList.remove('active');
    sourceFileBtn.classList.add('active');
    sourceMicBtn.classList.remove('active');
    audio.loadLocalFile(file);
  }
});

sourceMicBtn.addEventListener('click', async () => {
  const active = await audio.enableMicrophone();
  if (active) {
    sourceSynthBtn.classList.remove('active');
    sourceFileBtn.classList.remove('active');
    sourceMicBtn.classList.add('active');
  } else {
    sourceSynthBtn.classList.add('active');
    sourceMicBtn.classList.remove('active');
  }
});

// Ambient Layers: Rain & Vinyl
btnToggleRain.addEventListener('click', () => {
  const next = !audio.ambientSettings.rain;
  audio.toggleRain(next);
  btnToggleRain.classList.toggle('active', next);
});

btnToggleVinyl.addEventListener('click', () => {
  const next = !audio.ambientSettings.vinyl;
  audio.toggleVinyl(next);
  btnToggleVinyl.classList.toggle('active', next);
});

// Master Volume & Mute
volumeSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  audio.setVolume(val);
  isMuted = val === 0;
  updateVolumeIcon(val);
});

btnMute.addEventListener('click', () => {
  if (isMuted) {
    audio.setVolume(previousVolume);
    volumeSlider.value = previousVolume;
    isMuted = false;
    updateVolumeIcon(previousVolume);
  } else {
    previousVolume = parseFloat(volumeSlider.value) || 0.85;
    audio.setVolume(0);
    volumeSlider.value = 0;
    isMuted = true;
    updateVolumeIcon(0);
  }
});

function updateVolumeIcon(val) {
  if (val <= 0.01) {
    volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    `;
  } else if (val < 0.5) {
    volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    `;
  } else {
    volumeIcon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    `;
  }
}

// Visual Settings Drawer
function toggleSettings(open) {
  const shouldOpen = open !== undefined ? open : !settingsDrawer.classList.contains('open');
  settingsDrawer.classList.toggle('open', shouldOpen);
  btnSettings.classList.toggle('active', shouldOpen);
}

btnSettings.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSettings();
});

btnCloseSettings.addEventListener('click', () => {
  toggleSettings(false);
});

// Palette Selection
paletteChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    paletteChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const paletteId = chip.getAttribute('data-palette');
    visualizer.setPalette(paletteId);
  });
});

// Visual Tuning Sliders
sliderEmber.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  visualizer.setConfig('emberIntensity', val);
  labelEmberVal.textContent = `${Math.round(val * 100)}%`;
});

sliderRibbon.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  visualizer.setConfig('ribbonSpeed', val);
  labelRibbonVal.textContent = `${Math.round(val * 100)}%`;
});

sliderSparkle.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  visualizer.setConfig('sparkleSensitivity', val);
  labelSparkleVal.textContent = `${Math.round(val * 100)}%`;
});

sliderMoteDensity.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  visualizer.setConfig('moteDensity', val);
  labelMoteDensity.textContent = `${Math.round(val * 100)}%`;
});

sliderGrain.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  visualizer.setConfig('grainAmount', val);
  labelGrainVal.textContent = `${Math.round(val * 100)}%`;
});

// Cinema Mode (Hide UI)
function toggleCinemaMode() {
  isCinemaMode = !isCinemaMode;
  uiOverlay.classList.toggle('cinema-mode', isCinemaMode);
  btnCinemaMode.classList.toggle('active', isCinemaMode);
  if (isCinemaMode) {
    toggleSettings(false);
  }
}

btnCinemaMode.addEventListener('click', toggleCinemaMode);

// Fullscreen API
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.warn('Fullscreen error:', err);
    });
  } else {
    document.exitFullscreen().catch((err) => {
      console.warn('Exit fullscreen error:', err);
    });
  }
}

btnFullscreen.addEventListener('click', toggleFullscreen);

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    btnFullscreen.classList.add('active');
    fullscreenIcon.innerHTML = `
      <polyline points="4 14 10 14 10 20"></polyline>
      <polyline points="20 10 14 10 14 4"></polyline>
      <line x1="14" y1="10" x2="21" y2="3"></line>
      <line x1="3" y1="21" x2="10" y2="14"></line>
    `;
  } else {
    btnFullscreen.classList.remove('active');
    fullscreenIcon.innerHTML = `
      <polyline points="15 3 21 3 21 9"></polyline>
      <polyline points="9 21 3 21 3 15"></polyline>
      <line x1="21" y1="3" x2="14" y2="10"></line>
      <line x1="3" y1="21" x2="10" y2="14"></line>
    `;
  }
});

// Idle UI Fade
function resetIdleTimer() {
  uiOverlay.classList.remove('idle-hidden');
  clearTimeout(idleTimer);

  if (audio.isPlaying && !settingsDrawer.classList.contains('open') && !isCinemaMode) {
    idleTimer = setTimeout(() => {
      uiOverlay.classList.add('idle-hidden');
    }, 4000);
  }
}

window.addEventListener('mousemove', resetIdleTimer);
window.addEventListener('mousedown', resetIdleTimer);
window.addEventListener('keydown', resetIdleTimer);

// Global Keyboard Hotkeys
window.addEventListener('keydown', (e) => {
  // If typing in input, ignore
  if (e.target.tagName === 'INPUT') return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (!hasStarted) {
      startSanctuary();
    } else {
      audio.togglePlay();
    }
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  } else if (e.key === 'h' || e.key === 'H') {
    toggleCinemaMode();
  } else if (e.key === 's' || e.key === 'S') {
    toggleSettings();
  } else if (e.key === 'm' || e.key === 'M') {
    btnMute.click();
  } else if (e.key === 'n' || e.key === 'N') {
    audio.nextTrack();
  }
});

// Drag and Drop Audio Files
window.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('active');
});

window.addEventListener('dragleave', (e) => {
  if (e.relatedTarget === null) {
    dropZone.classList.remove('active');
  }
});

window.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('active');

  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    const file = e.dataTransfer.files[0];
    if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name)) {
      if (!hasStarted) {
        startSanctuary();
      }
      sourceSynthBtn.classList.remove('active');
      sourceFileBtn.classList.add('active');
      sourceMicBtn.classList.remove('active');
      audio.loadLocalFile(file);
    }
  }
});

// Primary Animation Loop (Buttery 60fps / 120fps)
function animationLoop() {
  const audioData = audio.updateAnalysis();
  visualizer.render(audioData);
  requestAnimationFrame(animationLoop);
}

// Start rendering loop immediately
requestAnimationFrame(animationLoop);

// Set initial track display
updateTrackUI(audio.getCurrentTrackInfo());
