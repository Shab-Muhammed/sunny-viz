/**
 * Dust Mote Particle Engine
 *
 * Simulates tiny, floating dust motes drifting through sunlight filtering
 * through a cozy window near the top right of the screen.
 * High-treble frequencies cause motes to catch the light, twinkle, and sparkle.
 */

export class DustMoteEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 280;
    this.width = 0;
    this.height = 0;

    // Flare cache
    this.moteColorRGB = [255, 240, 215]; // Default solar warm cream
    this.sparkleSensitivity = 1.0;
    this.densityMultiplier = 1.0;

    this.initParticles();
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;

    // Reposition particles within bounds if needed
    for (const p of this.particles) {
      if (p.x > w + 50 || p.y > h + 50) {
        this.resetParticle(p, true);
      }
    }
  }

  setPalette(palette) {
    if (palette && palette.moteColor) {
      this.moteColorRGB = [
        Math.round(palette.moteColor[0] * 255),
        Math.round(palette.moteColor[1] * 255),
        Math.round(palette.moteColor[2] * 255)
      ];
    }
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const p = {
        x: 0,
        y: 0,
        z: 0,
        radius: 0,
        baseAlpha: 0,
        currentAlpha: 0,
        vx: 0,
        vy: 0,
        swirlPhase: Math.random() * Math.PI * 2,
        swirlSpeed: 0.4 + Math.random() * 0.8,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.5 + Math.random() * 3.0,
        flareIntensity: 0,
        flareDecay: 0.92
      };
      this.resetParticle(p, true);
      this.particles.push(p);
    }
  }

  resetParticle(p, fullSpread = false) {
    const w = this.width || window.innerWidth;
    const h = this.height || window.innerHeight;

    // Depth: 0.1 (far) to 1.0 (near)
    p.z = 0.15 + Math.random() * 0.85;

    // Particles are distributed predominantly in top-right window sunlight
    // With natural drift downward-leftwards across screen
    if (fullSpread) {
      // Spatial bias: weighted heavily towards top-right (x > 0.45, y < 0.70)
      const u = Math.random();
      const v = Math.random();
      p.x = w * (0.35 + 0.7 * Math.sqrt(u)); // clustered rightwards
      p.y = h * (v * v * 0.85);              // clustered towards top
    } else {
      // Spawn entering from top or right edges
      if (Math.random() > 0.4) {
        // Entering from top edge (right side)
        p.x = w * (0.45 + Math.random() * 0.6);
        p.y = -10 - Math.random() * 20;
      } else {
        // Entering from right edge (top half)
        p.x = w + 10 + Math.random() * 20;
        p.y = h * (Math.random() * 0.55);
      }
    }

    // Optical radius: near particles are larger bokeh blurs, far particles are micro-pinpoints
    p.radius = (0.7 + p.z * 3.2);

    // Alpha: near particles are soft translucent discs; mid particles are bright specks
    p.baseAlpha = (0.15 + p.z * 0.35) * (0.7 + Math.random() * 0.5);
    p.currentAlpha = p.baseAlpha;

    // Drift velocity: slow downward and leftward draft (simulating convection in a cozy sunlit room)
    p.vx = -(0.12 + Math.random() * 0.22) * (0.5 + p.z * 0.8);
    p.vy = (0.08 + Math.random() * 0.18) * (0.5 + p.z * 0.8);

    p.swirlPhase = Math.random() * Math.PI * 2;
    p.flareIntensity = 0;
  }

  updateAndRender(audioData, deltaTime) {
    if (!this.ctx || this.width === 0) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter'; // Additive luminous blending

    const treble = (audioData ? (audioData.treble * 0.7 + audioData.air * 0.8) : 0) * this.sparkleSensitivity;
    const energy = audioData ? audioData.energy : 0;
    const dt = Math.min(deltaTime, 0.05);

    const [r, g, b] = this.moteColorRGB;
    const activeCount = Math.floor(this.particleCount * this.densityMultiplier);

    // Sunbeam hotspot vector for illumination falloff
    // Window shaft origin is at (width * 0.95, height * 0.05)
    const sunX = this.width * 0.92;
    const sunY = this.height * 0.06;

    for (let i = 0; i < activeCount; i++) {
      const p = this.particles[i];

      // Brownian micro-drift & thermal swirl
      p.swirlPhase += p.swirlSpeed * dt;
      const swirlX = Math.sin(p.swirlPhase) * 0.35 * (0.5 + p.z);
      const swirlY = Math.cos(p.swirlPhase * 0.8) * 0.25 * (0.5 + p.z);

      // Treble lift: high-frequency notes create subtle buoyant flutter
      const trebleLift = treble * 0.4 * p.z;

      // Update position
      p.x += (p.vx + swirlX) * (1.0 + energy * 0.5);
      p.y += (p.vy + swirlY - trebleLift) * (1.0 + energy * 0.5);

      // Twinkle calculation
      p.twinklePhase += p.twinkleSpeed * (1.0 + treble * 3.0) * dt;
      const naturalTwinkle = Math.sin(p.twinklePhase) * 0.35 + 0.65;

      // Distance to sunbeam center (particles glow brightest inside the beam)
      const distFromSun = Math.hypot(p.x - sunX, p.y - sunY);
      const beamFactor = Math.max(0.2, 1.0 - distFromSun / (this.width * 0.85));

      // Treble sparkle excitation
      const sparkleExcitation = treble * 2.2 * Math.max(0.0, Math.sin(p.twinklePhase * 1.5));
      p.currentAlpha = (p.baseAlpha * naturalTwinkle * beamFactor) + (sparkleExcitation * p.z * 0.8);

      // Treble flare trigger for in-focus particles
      if (treble > 0.55 && p.z > 0.65 && Math.random() < 0.035) {
        p.flareIntensity = Math.min(1.0, p.flareIntensity + treble * 0.9);
      }
      p.flareIntensity *= p.flareDecay;

      // Wrap around bounds
      if (p.x < -40 || p.y > this.height + 40 || p.y < -50 || p.x > this.width + 50) {
        this.resetParticle(p, false);
        continue;
      }

      // --- Render Particle ---
      const alpha = Math.min(1.0, Math.max(0.0, p.currentAlpha));
      if (alpha <= 0.01) continue;

      const rad = p.radius * (1.0 + p.flareIntensity * 0.8);

      // Outer soft glow aura
      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 2.8);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.95})`);
      grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${alpha * 0.45})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, rad * 2.8, 0, Math.PI * 2);
      this.ctx.fillStyle = grad;
      this.ctx.fill();

      // Sharp central pinpoint for crystalline sparkle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(0.7, rad * 0.35), 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, alpha * 1.4)})`;
      this.ctx.fill();

      // Sparkle Cross Starburst Flare for peak treble excitement
      if (p.flareIntensity > 0.15) {
        const flareLen = rad * (3.5 + p.flareIntensity * 5.0);
        const flareAlpha = p.flareIntensity * 0.75;

        this.ctx.strokeStyle = `rgba(255, 255, 255, ${flareAlpha})`;
        this.ctx.lineWidth = 1.0;

        // Horizontal spike
        this.ctx.beginPath();
        this.ctx.moveTo(p.x - flareLen, p.y);
        this.ctx.lineTo(p.x + flareLen, p.y);
        this.ctx.stroke();

        // Vertical spike
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y - flareLen);
        this.ctx.lineTo(p.x, p.y + flareLen);
        this.ctx.stroke();

        // Delicate 45deg star spikes
        if (p.flareIntensity > 0.45) {
          const diagLen = flareLen * 0.55;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x - diagLen, p.y - diagLen);
          this.ctx.lineTo(p.x + diagLen, p.y + diagLen);
          this.ctx.moveTo(p.x + diagLen, p.y - diagLen);
          this.ctx.lineTo(p.x - diagLen, p.y + diagLen);
          this.ctx.stroke();
        }
      }
    }

    this.ctx.restore();
  }
}
