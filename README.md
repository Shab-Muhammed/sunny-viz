# Sunny Viz: Ambient Digital Music Visualizer

Sunny Viz is an edge-to-edge, web-based digital music visualizer designed for ambient listening environments. Moving away from conventional centered geometry and discrete frequency bar graphs, the application implements an asymmetrical spatial frequency distribution model where audio frequencies govern distinct spatial domains across an organic fluid canvas.

---

## Architecture Overview

The system is organized into three primary subsystems:
1. **Visual Synthesis Engine**: High-performance WebGL fragment shaders handling continuous fluid dynamics and domain-warped noise, paired with an optical particle simulation for ambient dust motes.
2. **Audio Processing and Synthesis Pipeline**: A native Web Audio API graph providing real-time multi-band FFT decomposition, four procedurally synthesized polyphonic lo-fi compositions, dual ambient noise generators, local file streaming, and live microphone analysis.
3. **Glassmorphic Interface Layer**: An unobtrusive, flush user interface implementing progressive disclosure, hardware-accelerated CSS backdrop filters, and inactivity-based opacity decay for full-screen immersion.

---

## Spatial Frequency Mapping

Audio input is decomposed in real-time via an `AnalyserNode` (FFT size: 1024, smoothing time constant: 0.82) into dedicated frequency bands mapped to specific screen quadrants:

| Screen Region | Frequency Band | Visual Representation | Dynamics and Behavior |
| :--- | :--- | :--- | :--- |
| **Lower-Left** | Sub-Bass & Bass (20 Hz – 220 Hz) | Incandescent Hearth Glow | Fractional Brownian Motion (FBM) simplex noise drives thermal expansion and luminous core intensity. Transient bass peaks produce radial thermal compression waves propagating across the graphite field. |
| **Diagonal Field** | Mid-Range (250 Hz – 3000 Hz) | Translucent Ribbon Waves | Rotated coordinate manifolds (~36 degrees) subject to fluid domain warping. Modulated by harmonic content from piano, vocals, and guitar melodies to vary wave amplitude, phase velocity, and caustic transparency. |
| **Top-Right** | Treble & Air (3500 Hz – 16000 Hz) | Solar Dust Motes | Brownian motion particle system constrained to a simulated window light shaft. Transient high frequencies induce scintillation, brightness surges, and optical diffraction cross-flares. |

---

## Core Capabilities

### Audio Signal Sources
- **Browser Audio Capture**:
  - Optional capture via `navigator.mediaDevices.getDisplayMedia`; the user must select a browser tab or supported system-audio source and grant permission.
  - This is not an Apple Music or Spotify account connection. Provider playback SDKs do not expose the decoded audio samples needed by this visualizer, and Spotify's platform policy prohibits synchronizing its sound recordings with visuals.
  - The Audio Sync Hub includes source guidance and input sensitivity controls. Local audio files and microphone input are also available.
  - Curated lo-fi preset station chips (*Lofi Girl*, *Chillhop Essentials*, *Sakura Garden*, *Nordic Pine*, *Midnight Jazz*).
- **Procedural Synthesizer**: Four built-in, polyphonic compositions generated through Web Audio oscillators, biquad filter envelopes, sub-bass synthesis, and simulated tape flutter:
  - Tape 01: *Midnight Rain & Warm Tea* (72 BPM, Eb Major)
  - Tape 02: *Autumn Window Mist* (66 BPM, Ab Major)
  - Tape 03: *Lanterns in the Breeze* (78 BPM, F Major)
  - Tape 04: *Dawn Coffee Sanctuary* (70 BPM, Db Major)
- **Procedural Ambience Generators**: Multi-pole filtered noise simulating analog vinyl surface crackle, needle pops, and gentle precipitation.
- **Local Audio Streaming**: Full client-side decoding and playback support for MP3, WAV, FLAC, and AAC files with interactive scrub bar seeking.
- **Live Input Capture**: WebRTC `getUserMedia` audio stream integration for real-time room and desktop audio visualization.

### Visual Customization
- **Curated Color Palettes**:
  - *Warm Hearth*: Incandescent amber, burnt caramel, golden peach, graphite.
  - *Midnight Ochre*: Deep indigo graphite, saffron embers, honey mist.
  - *Sakura Reverie*: Charcoal plum, dusky rose, lilac-champagne.
  - *Nordic Pine*: Spruce slate, hearth bronze, glacial jade.
- **Parameter Controls**: Real-time adjustment of bass ember radiance, ribbon propagation velocity, treble sparkle sensitivity, particle density, and procedural analog film grain.

### Interface Design
- **Progressive Disclosure**: Control surfaces automatically transition to zero opacity after four seconds of cursor inactivity, restoring immediate visibility upon user interaction.
- **Flush Edge Placement**: Essential tracking data is confined to the top-left corner, and playback manipulation is consolidated into a bottom-docked glassmorphic bar.

---

## Keyboard Controls

| Key | Function |
| :--- | :--- |
| `Space` | Toggle playback (play / pause) |
| `Y` | Open Spotify & Apple Music Sync Hub |
| `F` | Toggle browser fullscreen mode |
| `H` | Toggle cinema mode (hide / show interface controls) |
| `S` | Toggle atmosphere and visual settings panel |
| `N` | Advance to the next built-in composition |
| `M` | Mute / unmute audio output |
| `Esc` | Close sync hub or visual settings panel |

---

## Technical Specifications

- **Rendering**: WebGL 1.0 (GLSL ES 1.00), HTML5 Canvas 2D API
- **Audio Processing**: Web Audio API (`AudioContext`, `AnalyserNode`, `BiquadFilterNode`, `DynamicsCompressorNode`, `StereoPannerNode`)
- **Styling**: Vanilla CSS, Backdrop Filter Specification, CSS Custom Properties
- **Application Bundling**: Vite

---

## Repository Structure

```
.
├── index.html                  # Application entry point and layout
├── package.json                # Project configuration and dependencies
├── src
│   ├── main.js                 # Application initialization and event wiring
│   ├── style.css               # Design tokens, glassmorphism, and responsive styles
│   ├── audio
│   │   └── lofiEngine.js       # Web Audio synthesizer, file loader, and mic analyzer
│   └── visuals
│       ├── dustMotes.js        # Canvas 2D particle simulation
│       ├── fluidShader.js      # WebGL vertex and fragment shaders
│       ├── palettes.js         # Color theme configurations
│       └── visualizer.js       # WebGL state management and animation loop
└── README.md                   # Technical documentation
```

---

## Installation and Local Development

### Requirements
- Node.js version 18.0.0 or higher
- npm version 9.0.0 or higher

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Shab-Muhammed/sunny-viz.git
   cd sunny-viz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Access the application in a modern WebGL-compliant browser at `http://localhost:5173/`.

### Production Build

Compile optimized production assets:
```bash
npm run build
```

Built artifacts are output to the `dist/` directory.

---

## License

This project is distributed under the terms of the MIT License.
