# Sunny Viz — Cozy Lo-Fi Music Visualizer

A full-screen, highly aesthetic, cozy digital music visualizer designed as an edge-to-edge ambient sanctuary. It replaces traditional centered shapes and audio spectrum bars with an asymmetrical spatial distribution of light, fluid motion, and atmospheric particles across a dark, warm graphite backdrop.

---

## ✨ Features

- **Asymmetrical Spatial Frequency Mapping**:
  - **Lower-Left Corner (Deep Bass, 20Hz–220Hz)**: Warm, ember-like ambient glows that breathe, expand, and pulse softly into the graphite canvas with thermal ripples.
  - **Diagonal Field (Mid-Range Melodies, 250Hz–3000Hz)**: Silky, translucent ribbon waves drifting at a ~36° angle across the screen with organic fluid domain warping.
  - **Top-Right Corner (High Treble, 3.5kHz–16kHz)**: Tiny floating dust-mote particles that sparkle softly through a sunlight window shaft, catching the light with starburst flares on treble peaks.
- **Built-in Generative Lo-Fi Chillhop Synthesizer**:
  - *Tape 01: Midnight Rain & Warm Tea* (72 BPM, Eb Major)
  - *Tape 02: Autumn Window Mist* (66 BPM, Ab Major)
  - *Tape 03: Lanterns in the Breeze* (78 BPM, F Major)
  - *Tape 04: Dawn Coffee Sanctuary* (70 BPM, Db Major)
- **Procedural Ambient Layers**:
  - Analog vinyl crackle generator (with needle pops and warm hiss).
  - Gentle rain whisper generator.
- **Multiple Audio Sources**:
  - Built-in generative Lo-Fi Sanctuary tapes (100% offline, zero external dependencies).
  - Custom audio file drag & drop / upload (MP3, WAV, FLAC, AAC) with full scrub bar seeking.
  - Live microphone / line-in sound reactive mode.
- **Ultra-Sleek Glassmorphic UI**:
  - Floating minimalist track card tucked into the top-left corner.
  - Faint, sleek glassmorphic scrubber bar along the bottom edge.
  - Visual settings drawer with 4 curated color themes (*Warm Hearth*, *Midnight Ochre*, *Sakura Reverie*, *Nordic Pine*) and custom sliders for ember glow, ribbon flow, sparkle sensitivity, dust density, and film grain.
  - Auto-hide UI on idle (fades out after 4 seconds of mouse inactivity; reappears on movement).
  - Keyboard shortcuts for effortless control.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :---: | :--- |
| <kbd>Space</kbd> | Play / Pause |
| <kbd>F</kbd> | Toggle Fullscreen Mode |
| <kbd>H</kbd> | Toggle Pure Cinema Mode (Hide / Show UI) |
| <kbd>S</kbd> | Open / Close Atmosphere & Visual Settings Drawer |
| <kbd>N</kbd> | Skip to Next Tape |
| <kbd>M</kbd> | Mute / Unmute Audio |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Shab-Muhammed/sunny-viz.git
cd sunny-viz

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Building for Production

```bash
npm run build
```

The production assets will be built into the `dist/` directory.

---

## 🛠️ Tech Stack

- **Graphics**: WebGL (GLSL Shaders with FBM simplex noise and organic fluid dynamics) + Canvas 2D particle engine
- **Audio**: Web Audio API (real-time AnalyserNode, procedural synthesis, polyphonic voice allocation, custom pink noise/biquad filters)
- **UI & Styling**: Vanilla CSS glassmorphism, responsive flex/grid layouts, modern typography (`Plus Jakarta Sans` & `Outfit`)
- **Bundler**: Vite

---

## 📄 License

MIT License. Crafted for cozy chillhop vibes and ambient relaxation.
