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
const trackArtworkThumb = document.getElementById('trackArtworkThumb');
const trackArtworkImg = document.getElementById('trackArtworkImg');
const trackArtworkGlow = document.getElementById('trackArtworkGlow');
const sourceSynthBtn = document.getElementById('sourceSynthBtn');
const sourceSyncBtn = document.getElementById('sourceSyncBtn');
const sourceFileBtn = document.getElementById('sourceFileBtn');
const sourceMicBtn = document.getElementById('sourceMicBtn');
const audioFileInput = document.getElementById('audioFileInput');

// Sync Modal Elements
const syncModal = document.getElementById('syncModal');
const btnOpenSync = document.getElementById('btnOpenSync');
const btnCloseSyncModal = document.getElementById('btnCloseSyncModal');
const btnStartAudioSync = document.getElementById('btnStartAudioSync');
const btnStartAudioSyncText = document.getElementById('btnStartAudioSyncText');
const syncStatusCard = document.getElementById('syncStatusCard');
const btnDisconnectSync = document.getElementById('btnDisconnectSync');
const sliderSyncGain = document.getElementById('sliderSyncGain');
const labelSyncGainVal = document.getElementById('labelSyncGainVal');
const syncGainMeterFill = document.getElementById('syncGainMeterFill');
const syncSearchInput = document.getElementById('syncSearchInput');
const btnClearSyncSearch = document.getElementById('btnClearSyncSearch');
const syncSearchResults = document.getElementById('syncSearchResults');
const stationChips = document.querySelectorAll('.station-chip');

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
const btnSanctuaryTraverse = document.getElementById('btnSanctuaryTraverse');

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
    trackBadge.textContent = 'PLAYING';
    playPauseIcon.innerHTML = `
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `;
  } else {
    pulseIndicator.classList.add('paused');
    trackBadge.textContent = 'PAUSED';
    playPauseIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
  }
}

// Update Track Metadata UI
function updateTrackUI(info) {
  if (!info) return;
  trackTitle.textContent = info.title;
  trackMeta.textContent = info.tag ? `${info.artist} • ${info.tag}` : info.artist;

  // Handle album artwork display
  if (info.artwork) {
    trackArtworkThumb.style.display = 'block';
    trackArtworkImg.src = info.artwork;
    if (visualizer && visualizer.currentPalette && visualizer.currentPalette.accent) {
      trackArtworkGlow.style.background = `radial-gradient(circle, ${visualizer.currentPalette.accent} 0%, transparent 70%)`;
    }
  } else {
    trackArtworkThumb.style.display = 'none';
  }

  if (audio.sourceMode === 'sync') {
    pulseIndicator.classList.remove('paused');
    pulseIndicator.classList.add('synced');
    trackBadge.textContent = 'AUDIO CAPTURE';
    timeCurrent.textContent = 'LIVE';
    timeDuration.textContent = 'INPUT';
    progressFill.style.width = '100%';
  } else if (info.isLive) {
    pulseIndicator.classList.remove('synced');
    trackBadge.textContent = 'MICROPHONE';
    timeCurrent.textContent = 'LIVE';
    timeDuration.textContent = 'REALTIME';
    progressFill.style.width = '100%';
  } else {
    pulseIndicator.classList.remove('synced');
    trackBadge.textContent = audio.isPlaying ? 'PLAYING' : 'PAUSED';
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
  if (isDraggingScrubber || audio.sourceMode === 'mic' || audio.sourceMode === 'sync') return;

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

progressTrack.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  e.preventDefault();
  isDraggingScrubber = true;
  progressTrack.setPointerCapture(e.pointerId);
  progressTrack.classList.add('dragging');
  handleSeek(e);
});

progressTrack.addEventListener('pointermove', (e) => {
  if (isDraggingScrubber) handleSeek(e);
});

function stopScrubberDrag() {
  isDraggingScrubber = false;
  progressTrack.classList.remove('dragging');
}

progressTrack.addEventListener('pointerup', stopScrubberDrag);
progressTrack.addEventListener('pointercancel', stopScrubberDrag);
progressTrack.addEventListener('lostpointercapture', stopScrubberDrag);

// Helper: Set Active Source Pill
function setActiveSourcePill(mode) {
  sourceSynthBtn.classList.toggle('active', mode === 'synth');
  sourceSyncBtn.classList.toggle('active', mode === 'sync');
  sourceFileBtn.classList.toggle('active', mode === 'file');
  sourceMicBtn.classList.toggle('active', mode === 'mic');
}

// Audio capture modal toggle
function toggleSyncModal(open) {
  const shouldOpen = open !== undefined ? open : !syncModal.classList.contains('open');
  syncModal.classList.toggle('open', shouldOpen);
  if (shouldOpen) {
    toggleSettings(false);
  }
}

// Update Sync Modal Status UI
function updateSyncUIState(isSynced) {
  if (isSynced) {
    syncStatusCard.style.display = 'flex';
    btnStartAudioSync.classList.add('active');
    btnStartAudioSyncText.textContent = 'Stop Capture';
    pulseIndicator.classList.add('synced');
  } else {
    syncStatusCard.style.display = 'none';
    btnStartAudioSync.classList.remove('active');
    btnStartAudioSyncText.textContent = 'Capture Audio';
    pulseIndicator.classList.remove('synced');
  }
}

// Start or toggle captured browser-tab / system audio input.
async function toggleStreamSync() {
  if (audio.sourceMode === 'sync' && audio.syncStream) {
    audio.stopStreamSync();
    audio.switchToSynth();
    setActiveSourcePill('synth');
    updateSyncUIState(false);
    return;
  }

  try {
    btnStartAudioSync.disabled = true;
    btnStartAudioSyncText.textContent = 'Select Window / Tab...';

    if (!hasStarted) {
      welcomeOverlay.classList.add('dissolved');
      hasStarted = true;
    }

    const ok = await audio.enableStreamSync();
    if (ok) {
      setActiveSourcePill('sync');
      updateSyncUIState(true);
      setTimeout(() => {
        toggleSyncModal(false);
      }, 700);
    }
  } catch (err) {
    console.warn('Sync failed or cancelled:', err);
    alert(err.message || 'Audio sync failed.');
    setActiveSourcePill(audio.sourceMode);
    updateSyncUIState(false);
  } finally {
    btnStartAudioSync.disabled = false;
  }
}

// Stream ended callback (e.g. user clicked browser's "Stop sharing")
audio.onSyncEnded = () => {
  updateSyncUIState(false);
  setActiveSourcePill('synth');
  audio.switchToSynth();
};

// Source Selection Pills wiring
sourceSynthBtn.addEventListener('click', () => {
  setActiveSourcePill('synth');
  audio.switchToSynth();
});

sourceSyncBtn.addEventListener('click', () => {
  toggleSyncModal(true);
});

btnOpenSync.addEventListener('click', () => {
  toggleSyncModal();
});

btnCloseSyncModal.addEventListener('click', () => {
  toggleSyncModal(false);
});

btnStartAudioSync.addEventListener('click', () => {
  toggleStreamSync();
});

btnDisconnectSync.addEventListener('click', () => {
  audio.stopStreamSync();
  audio.switchToSynth();
  setActiveSourcePill('synth');
  updateSyncUIState(false);
});

sourceFileBtn.addEventListener('click', () => {
  audioFileInput.click();
});

audioFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    setActiveSourcePill('file');
    audio.loadLocalFile(file);
  }
});

sourceMicBtn.addEventListener('click', async () => {
  const active = await audio.enableMicrophone();
  if (active) {
    setActiveSourcePill('mic');
  } else {
    setActiveSourcePill('synth');
  }
});

// Sync Sensitivity Boost Slider
sliderSyncGain.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  audio.setSyncSensitivity(val);
  labelSyncGainVal.textContent = `${Math.round(val * 100)}%`;
});

// Apple Music catalog metadata search (iTunes public search API)
let searchDebounce = null;
syncSearchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  btnClearSyncSearch.style.display = query ? 'block' : 'none';

  clearTimeout(searchDebounce);
  if (!query) {
    syncSearchResults.innerHTML = '';
    return;
  }

  searchDebounce = setTimeout(async () => {
    try {
      syncSearchResults.innerHTML = `<div style="font-size:0.75rem; color: var(--text-tertiary); padding: 0.5rem;">Searching Apple Music catalog...</div>`;
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=5&entity=song`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        syncSearchResults.innerHTML = `<div style="font-size:0.75rem; color: var(--text-tertiary); padding: 0.5rem;">No tracks found for "${query}"</div>`;
        return;
      }

      syncSearchResults.innerHTML = '';
      data.results.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        const art = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '300x300bb') : '';
        card.innerHTML = `
          <img class="result-art" src="${art || ''}" alt="Cover" />
          <div class="result-info">
            <div class="result-title">${item.trackName || 'Unknown Title'}</div>
            <div class="result-artist">${item.artistName || 'Unknown Artist'} • ${item.collectionName || ''}</div>
          </div>
          <span class="result-badge">Apply</span>
        `;
        card.addEventListener('click', () => {
          audio.setSyncTrackMetadata({
            title: item.trackName,
            artist: item.artistName,
            tag: item.collectionName || 'Apple Music catalog',
            artwork: art
          });
          updateTrackUI(audio.getCurrentTrackInfo());
        });
        syncSearchResults.appendChild(card);
      });
    } catch (err) {
      console.warn('Metadata search error:', err);
      syncSearchResults.innerHTML = `<div style="font-size:0.75rem; color: var(--text-tertiary); padding: 0.5rem;">Could not load search results. You can still stream directly!</div>`;
    }
  }, 350);
});

btnClearSyncSearch.addEventListener('click', () => {
  syncSearchInput.value = '';
  btnClearSyncSearch.style.display = 'none';
  syncSearchResults.innerHTML = '';
});

// Curated Station Preset Chips
stationChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    stationChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const title = chip.getAttribute('data-title');
    const artist = chip.getAttribute('data-artist');
    const artwork = chip.getAttribute('data-art');
    const paletteId = chip.getAttribute('data-palette');

    if (paletteId && visualizer) {
      visualizer.setPalette(paletteId);
      paletteChips.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-palette') === paletteId);
      });
    }

    audio.setSyncTrackMetadata({
      title,
      artist,
      tag: 'Curated Sync Stream',
      artwork,
      paletteHint: paletteId
    });
    updateTrackUI(audio.getCurrentTrackInfo());
  });
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

btnSanctuaryTraverse.addEventListener('click', () => {
  const enabled = btnSanctuaryTraverse.getAttribute('aria-pressed') !== 'true';
  btnSanctuaryTraverse.setAttribute('aria-pressed', String(enabled));
  btnSanctuaryTraverse.classList.toggle('active', enabled);
  btnSanctuaryTraverse.querySelector('.traverse-toggle-state').textContent = enabled ? 'ON' : 'OFF';
  visualizer.setTraverseEnabled(enabled);
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
  } else if (e.key === 'y' || e.key === 'Y') {
    toggleSyncModal();
  } else if (e.key === 'Escape') {
    toggleSyncModal(false);
    toggleSettings(false);
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

  // Update live audio meter in sync modal if open or syncing
  if (syncModal.classList.contains('open') || audio.sourceMode === 'sync') {
    const meterVal = Math.min(100, Math.round(audioData.energy * 100 * audio.syncSensitivity * 1.5));
    syncGainMeterFill.style.width = `${meterVal}%`;
  }

  requestAnimationFrame(animationLoop);
}

// Start rendering loop immediately
requestAnimationFrame(animationLoop);

// Set initial track display
updateTrackUI(audio.getCurrentTrackInfo());
