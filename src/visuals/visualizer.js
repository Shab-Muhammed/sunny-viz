/**
 * Main Visualizer Controller
 * Coordinates:
 * - WebGL Fluid & Bass Ember & Mid Ribbon Shader Canvas
 * - Top-Right Sunlight Dust Motes Canvas
 * - Responsive resizing & High-DPI handling
 * - Audio analysis uniform bindings
 */

import { vertexShaderSource, fragmentShaderSource } from './fluidShader.js';
import { DustMoteEngine } from './dustMotes.js';
import { PALETTES } from './palettes.js';

export class Visualizer {
  constructor(glCanvas, particleCanvas) {
    this.glCanvas = glCanvas;
    this.particleCanvas = particleCanvas;

    this.gl = null;
    this.program = null;
    this.uniforms = {};
    this.dustEngine = null;
    this.traverseEnabled = false;
    this.traverseAmount = 0;
    this.traverseClock = 0;
    this.motionEnergy = 0;
    this.motionBass = 0;

    // Visual configuration parameters
    this.currentPalette = PALETTES.hearth;
    this.config = {
      emberIntensity: 1.0,
      ribbonSpeed: 1.0,
      grainAmount: 1.0,
      sparkleSensitivity: 1.0,
      moteDensity: 1.0
    };

    // Animation & timing
    this.startTime = performance.now();
    this.lastFrameTime = performance.now();
    this.animationId = null;

    this.initWebGL();
    this.initDustMotes();
    this.handleResize();

    window.addEventListener('resize', () => this.handleResize());
  }

  initWebGL() {
    this.gl = this.glCanvas.getContext('webgl', {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: true,
      powerPreference: 'high-performance'
    });

    if (!this.gl) {
      console.error('WebGL not supported on this browser.');
      return;
    }

    const gl = this.gl;

    // Compile Shaders
    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertShader);
    gl.attachShader(this.program, fragShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(this.program));
      return;
    }

    gl.useProgram(this.program);

    // Full screen quad buffer
    const quadVertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Cache uniform locations
    const uniformNames = [
      'u_resolution', 'u_time', 'u_camera',
      'u_subBass', 'u_bass', 'u_lowMid', 'u_mid', 'u_highMid', 'u_treble', 'u_energy',
      'u_emberIntensity', 'u_ribbonSpeed', 'u_grainAmount',
      'u_colBg', 'u_colEmberCore', 'u_colEmberGlow',
      'u_colRibbonPrimary', 'u_colRibbonSecondary', 'u_colSunbeam'
    ];

    for (const name of uniformNames) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }

    this.updatePaletteUniforms();
  }

  initDustMotes() {
    this.dustEngine = new DustMoteEngine(this.particleCanvas);
    this.dustEngine.setPalette(this.currentPalette);
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Use devicePixelRatio with clamp to avoid GPU overload on ultra-high 4k/8k screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    const pixelWidth = Math.floor(width * dpr);
    const pixelHeight = Math.floor(height * dpr);

    if (this.glCanvas.width !== pixelWidth || this.glCanvas.height !== pixelHeight) {
      this.glCanvas.width = pixelWidth;
      this.glCanvas.height = pixelHeight;
      this.glCanvas.style.width = `${width}px`;
      this.glCanvas.style.height = `${height}px`;

      if (this.gl) {
        this.gl.viewport(0, 0, pixelWidth, pixelHeight);
      }
    }

    if (this.dustEngine) {
      this.dustEngine.resize(width, height);
    }
  }

  setPalette(paletteId) {
    if (PALETTES[paletteId]) {
      this.currentPalette = PALETTES[paletteId];
      this.updatePaletteUniforms();
      if (this.dustEngine) {
        this.dustEngine.setPalette(this.currentPalette);
      }
      return this.currentPalette;
    }
    return null;
  }

  updatePaletteUniforms() {
    if (!this.gl || !this.program) return;
    const gl = this.gl;
    const p = this.currentPalette;

    gl.useProgram(this.program);
    gl.uniform3fv(this.uniforms.u_colBg, p.bg);
    gl.uniform3fv(this.uniforms.u_colEmberCore, p.emberCore);
    gl.uniform3fv(this.uniforms.u_colEmberGlow, p.emberGlow);
    gl.uniform3fv(this.uniforms.u_colRibbonPrimary, p.ribbonPrimary);
    gl.uniform3fv(this.uniforms.u_colRibbonSecondary, p.ribbonSecondary);
    gl.uniform3fv(this.uniforms.u_colSunbeam, p.sunbeam);
  }

  setConfig(key, value) {
    this.config[key] = value;
    if (key === 'sparkleSensitivity' && this.dustEngine) {
      this.dustEngine.sparkleSensitivity = value;
    }
    if (key === 'moteDensity' && this.dustEngine) {
      this.dustEngine.densityMultiplier = value;
    }
  }

  setTraverseEnabled(enabled) {
    this.traverseEnabled = Boolean(enabled);
  }

  render(audioData) {
    const now = performance.now();
    const elapsedTime = (now - this.startTime) * 0.001;
    const deltaTime = (now - this.lastFrameTime) * 0.001;
    this.lastFrameTime = now;
    const motionDelta = Math.min(Math.max(deltaTime, 0), 0.05);
    const smoothFactor = 1 - Math.exp(-motionDelta * 2.4);
    this.traverseAmount += ((this.traverseEnabled ? 1 : 0) - this.traverseAmount)
      * (1 - Math.exp(-motionDelta * 1.8));
    this.motionEnergy += ((audioData?.energy || 0) - this.motionEnergy) * smoothFactor;
    this.motionBass += ((audioData?.bass || 0) - this.motionBass) * smoothFactor;
    if (this.traverseEnabled) {
      const wanderingTempo = 0.24 + 0.1 * Math.sin(this.traverseClock * 0.075 + 0.9)
        + this.motionEnergy * 0.72 + this.motionBass * 0.26;
      this.traverseClock += motionDelta * wanderingTempo;
    }

    const travel = this.traverseClock;
    const cameraX = 0.09 * Math.sin(travel * 0.34 + Math.sin(travel * 0.071) * 1.4)
      + 0.035 * Math.sin(travel * 0.73 + 1.7);
    const cameraY = 0.075 * Math.sin(travel * 0.28 + 2.1 + Math.sin(travel * 0.083) * 1.2)
      + 0.028 * Math.sin(travel * 0.59);
    const cameraZoom = 1.27 + 0.04 * Math.sin(travel * 0.22)
      + this.motionBass * 0.06;
    const cameraTurn = 0.032 * Math.sin(travel * 0.18 + 0.8)
      + 0.018 * Math.sin(travel * 0.43);
    const cameraBlend = this.traverseAmount;

    // --- 1. Render WebGL Fluid Canvas ---
    if (this.gl && this.program) {
      const gl = this.gl;
      gl.useProgram(this.program);

      // Resolution & Time
      gl.uniform2f(this.uniforms.u_resolution, this.glCanvas.width, this.glCanvas.height);
      gl.uniform1f(this.uniforms.u_time, elapsedTime);
      gl.uniform4f(
        this.uniforms.u_camera,
        cameraX * cameraBlend,
        cameraY * cameraBlend,
        1 + (cameraZoom - 1) * cameraBlend,
        cameraTurn * cameraBlend
      );

      // Audio Frequency Bands
      if (audioData) {
        gl.uniform1f(this.uniforms.u_subBass, audioData.subBass);
        gl.uniform1f(this.uniforms.u_bass, audioData.bass);
        gl.uniform1f(this.uniforms.u_lowMid, audioData.lowMid);
        gl.uniform1f(this.uniforms.u_mid, audioData.mid);
        gl.uniform1f(this.uniforms.u_highMid, audioData.highMid);
        gl.uniform1f(this.uniforms.u_treble, audioData.treble);
        gl.uniform1f(this.uniforms.u_energy, audioData.energy);
      } else {
        gl.uniform1f(this.uniforms.u_subBass, 0.0);
        gl.uniform1f(this.uniforms.u_bass, 0.0);
        gl.uniform1f(this.uniforms.u_lowMid, 0.0);
        gl.uniform1f(this.uniforms.u_mid, 0.0);
        gl.uniform1f(this.uniforms.u_highMid, 0.0);
        gl.uniform1f(this.uniforms.u_treble, 0.0);
        gl.uniform1f(this.uniforms.u_energy, 0.0);
      }

      // User Visual Sliders
      gl.uniform1f(this.uniforms.u_emberIntensity, this.config.emberIntensity);
      gl.uniform1f(this.uniforms.u_ribbonSpeed, this.config.ribbonSpeed);
      gl.uniform1f(this.uniforms.u_grainAmount, this.config.grainAmount);

      // Draw Quad
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // --- 2. Render Top-Right Dust Motes Canvas ---
    if (this.dustEngine) {
      this.dustEngine.updateAndRender(audioData, deltaTime);
    }
  }
}
