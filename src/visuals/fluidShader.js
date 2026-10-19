/**
 * GLSL Vertex and Fragment Shaders for the Cozy Lo-Fi Music Visualizer
 *
 * Implements:
 * - Asymmetrical deep bass ember glow breathing from lower-left corner
 * - Translucent fluid ribbon waves drifting diagonally across mid-field
 * - Soft warm graphite backdrop with subtle chromatic warmth
 * - Atmospheric window light beam in top-right
 * - Tactile analog film grain & cinematic depth
 */

export const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const fragmentShaderSource = `
  precision highp float;

  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;

  // Audio frequency bands (0.0 to 1.0)
  uniform float u_subBass;
  uniform float u_bass;
  uniform float u_lowMid;
  uniform float u_mid;
  uniform float u_highMid;
  uniform float u_treble;
  uniform float u_energy;

  // Custom visualizer settings
  uniform float u_emberIntensity;
  uniform float u_ribbonSpeed;
  uniform float u_grainAmount;
  uniform float u_visualMode;

  // Active color palette
  uniform vec3 u_colBg;
  uniform vec3 u_colEmberCore;
  uniform vec3 u_colEmberGlow;
  uniform vec3 u_colRibbonPrimary;
  uniform vec3 u_colRibbonSecondary;
  uniform vec3 u_colSunbeam;

  // --- Fast 2D Simplex / Perlin Noise helpers ---
  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractional Brownian Motion for organic liquid turbulence
  float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 4; i++) {
      total += snoise(p * freq) * amp;
      freq *= 2.02;
      amp *= 0.48;
    }
    return total;
  }

  // Rotate UV by angle
  vec2 rotate(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
  }

  // Random hash for film grain
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Aspect ratio corrected coordinate
    vec2 uv = v_uv;
    vec2 aspectUv = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0) + 0.5;

    // Alternate visual styles share the active palette and live audio analysis.
    if (u_visualMode > 0.5 && u_visualMode < 1.5) {
      vec2 auroraUv = aspectUv;
      float drift = u_time * 0.12 * u_ribbonSpeed;
      float warp = fbm(vec2(auroraUv.x * 2.1, auroraUv.y * 1.7 - drift));
      float curtainA = sin(auroraUv.x * 7.0 + warp * 2.4 - drift * 2.0);
      float curtainB = sin(auroraUv.x * 11.0 - warp * 1.8 + drift * 1.4);
      float aurora = exp(-abs(auroraUv.y - 0.56 - curtainA * 0.16) * 5.0);
      aurora += exp(-abs(auroraUv.y - 0.66 - curtainB * 0.12) * 7.0) * 0.7;
      float shimmer = 0.72 + 0.28 * sin(auroraUv.x * 18.0 + u_time * 0.8 + warp * 4.0);
      vec3 color = u_colBg + mix(u_colRibbonSecondary, u_colRibbonPrimary, clamp(auroraUv.x + warp * 0.25, 0.0, 1.0))
        * aurora * shimmer * (0.28 + u_energy * 0.9);
      color += u_colSunbeam * pow(max(0.0, auroraUv.y - 0.78), 2.0) * 0.35;
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    if (u_visualMode > 1.5 && u_visualMode < 2.5) {
      vec2 pulseUv = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
      float radius = length(pulseUv);
      float beat = u_time * (1.3 + u_bass * 2.0);
      float ring = pow(0.5 + 0.5 * cos(radius * 42.0 - beat * 2.0), 12.0);
      float halo = exp(-radius * (4.0 - u_energy * 1.2));
      vec3 color = u_colBg + u_colEmberGlow * halo * (0.35 + u_energy * 0.8);
      color += u_colRibbonPrimary * ring * (0.18 + u_energy * 0.9);
      color += u_colEmberCore * exp(-abs(radius - (0.16 + u_bass * 0.12)) * 28.0) * (0.25 + u_bass);
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    if (u_visualMode > 2.5) {
      float bandIndex = min(floor(uv.x * 7.0), 6.0);
      float bandLevel = u_subBass;
      if (bandIndex > 0.5) bandLevel = u_bass;
      if (bandIndex > 1.5) bandLevel = u_lowMid;
      if (bandIndex > 2.5) bandLevel = u_mid;
      if (bandIndex > 3.5) bandLevel = u_highMid;
      if (bandIndex > 4.5) bandLevel = u_treble;
      if (bandIndex > 5.5) bandLevel = u_energy;
      float localX = fract(uv.x * 7.0);
      float barHeight = 0.08 + bandLevel * 0.82;
      float bar = smoothstep(0.0, 0.035, localX) * (1.0 - smoothstep(0.86, 0.9, localX));
      float lit = (1.0 - smoothstep(barHeight - 0.008, barHeight + 0.008, uv.y)) * bar;
      float cap = exp(-abs(uv.y - barHeight) * 28.0) * bar * (0.15 + bandLevel * 0.75);
      vec3 bandColor = mix(u_colRibbonSecondary, u_colRibbonPrimary, bandIndex / 6.0);
      vec3 color = u_colBg + bandColor * (lit * (0.35 + bandLevel * 1.5) + cap);
      color += u_colSunbeam * exp(-uv.y * 5.0) * 0.025;
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    // Time scaling with user flow speed
    float t = u_time * 0.35 * u_ribbonSpeed;

    // 1. Dark, warm graphite base with subtle chromatic depth
    vec3 color = u_colBg;

    // Warm ambient foundation
    float baseVignette = length(uv - vec2(0.5, 0.5));
    color += vec3(0.015, 0.012, 0.010) * (1.0 - baseVignette);

    // =========================================================================
    // 2. LOWER-LEFT CORNER: Deep Bass Ember-like Ambient Glow
    // =========================================================================
    // Anchor in lower-left corner
    vec2 emberAnchor = vec2(0.08, 0.10);
    vec2 emberDiff = uv - emberAnchor;
    // Slight oval aspect for organic hearth shape
    emberDiff.x *= 0.85;

    // Bass frequency modulation
    float bassDrive = (u_subBass * 0.65 + u_bass * 0.45) * u_emberIntensity;
    
    // Liquid noise distortion of the ember boundary
    float emberNoise = fbm(uv * 2.8 - vec2(t * 0.15, t * 0.22));
    float distToEmber = length(emberDiff) - (emberNoise * 0.14);

    // Organic breathing radius: expands smoothly on bass hits
    float emberBaseRadius = 0.48 + (bassDrive * 0.42);
    float emberInnerRadius = 0.18 + (bassDrive * 0.26);

    // Outer soft warm haze
    float emberHaze = smoothstep(emberBaseRadius + 0.35, 0.0, distToEmber);
    emberHaze = pow(emberHaze, 1.4);

    // Inner incandescent core
    float emberCore = smoothstep(emberInnerRadius + 0.15, 0.0, distToEmber);
    emberCore = pow(emberCore, 2.2);

    // Thermal pulsation ripples that radiate outward from the lower-left corner
    float thermalRipple = sin(distToEmber * 14.0 - u_time * 2.2) * 0.5 + 0.5;
    thermalRipple *= smoothstep(0.7, 0.1, distToEmber) * bassDrive * 0.18;

    // Blend ember layers: deep burnt glow outer + radiant incandescent core
    vec3 emberContribution = u_colEmberGlow * (emberHaze + thermalRipple) * 0.95;
    emberContribution += u_colEmberCore * emberCore * (1.1 + bassDrive * 0.6);

    // Additive blend ember onto graphite canvas
    color += emberContribution;

    // =========================================================================
    // 3. DIAGONAL FIELD: Delicate, Translucent Ribbon Waves (Mid-Range)
    // =========================================================================
    // Rotate coordinates ~36 degrees to flow diagonally from bottom-left to top-right
    vec2 diagUv = rotate(aspectUv - vec2(0.45, 0.45), -0.62) + vec2(0.45, 0.45);

    // Mid-range frequency modulation
    float midDrive = (u_mid * 0.7 + u_lowMid * 0.4 + u_highMid * 0.3);

    // Liquid domain warping for silky fluid caustics
    vec2 warp = vec2(
      fbm(diagUv * 1.8 + vec2(t * 0.25, -t * 0.15)),
      fbm(diagUv * 1.8 + vec2(-t * 0.18, t * 0.20))
    );

    vec2 warpedDiag = diagUv + warp * (0.16 + midDrive * 0.14);

    // Multiple translucent wavy ribbon bands slanting diagonally
    // Ribbon 1: Golden peach main body
    float ribbon1Y = warpedDiag.y - 0.48;
    float wave1 = sin(warpedDiag.x * 3.8 + t * 0.8 + midDrive * 1.5) * 0.08;
    float distRibbon1 = abs(ribbon1Y - wave1);
    float ribbon1Intensity = exp(-distRibbon1 * (12.0 - midDrive * 4.0));

    // Ribbon 2: Delicate harmonic translucent veil
    float ribbon2Y = warpedDiag.y - 0.58;
    float wave2 = cos(warpedDiag.x * 5.2 - t * 0.6 + midDrive * 2.0) * 0.06;
    float distRibbon2 = abs(ribbon2Y - wave2);
    float ribbon2Intensity = exp(-distRibbon2 * (16.0 - midDrive * 5.0));

    // Ribbon 3: Higher undulating caustic ripple
    float ribbon3Y = warpedDiag.y - 0.38;
    float wave3 = sin(warpedDiag.x * 6.5 + t * 1.2) * 0.05;
    float distRibbon3 = abs(ribbon3Y - wave3);
    float ribbon3Intensity = exp(-distRibbon3 * 22.0);

    // Blend ribbons with translucent, silky gradients
    vec3 ribbons = vec3(0.0);
    ribbons += u_colRibbonPrimary * ribbon1Intensity * (0.55 + midDrive * 0.65);
    ribbons += u_colRibbonSecondary * ribbon2Intensity * (0.42 + midDrive * 0.55);
    ribbons += (u_colRibbonPrimary * 0.5 + u_colSunbeam * 0.5) * ribbon3Intensity * (0.28 + midDrive * 0.4);

    // Attenuate ribbons softly near the extreme borders for seamless edge drift
    float edgeMask = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x)
                   * smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.85, uv.y);
    ribbons *= (0.4 + edgeMask * 0.6);

    color += ribbons;

    // =========================================================================
    // 4. TOP-RIGHT CORNER: Soft Window Sunbeam & Atmosphere
    // =========================================================================
    // Diagonal soft solar light shaft angling from top-right towards center
    vec2 sunOrigin = vec2(1.02, 0.98);
    vec2 sunDir = normalize(vec2(-0.85, -0.6)); // angling down and to the left
    vec2 toPixel = uv - sunOrigin;
    
    // Projection along sunbeam axis
    float beamProj = dot(toPixel, sunDir);
    float beamDist = length(toPixel - sunDir * max(0.0, beamProj));

    // Soft volumetric light shaft
    float sunbeamShaft = smoothstep(0.55, 0.0, beamDist) * smoothstep(1.4, 0.0, length(uv - sunOrigin));
    sunbeamShaft = pow(sunbeamShaft, 1.8);

    // Treble notes create gentle atmospheric solar flaring in the window ray
    float trebleFlare = u_treble * 0.35;
    vec3 sunbeamColor = u_colSunbeam * sunbeamShaft * (0.35 + trebleFlare);

    color += sunbeamColor;

    // =========================================================================
    // 5. CINEMATIC POST-PROCESSING: Soft Vignette & Organic Film Grain
    // =========================================================================
    // Soft depth-of-field vignette
    float vig = smoothstep(1.2, 0.3, length(uv - vec2(0.5, 0.5)));
    color = mix(color * 0.72, color, vig);

    // Procedural analog film grain
    vec2 grainUv = uv * u_resolution + vec2(hash(vec2(u_time * 43.12, u_time * 19.34)) * 100.0);
    float grain = (hash(grainUv) - 0.5) * 0.065 * u_grainAmount;
    color += vec3(grain);

    // Tone curve: warm, soft black floor (never pure crushed black)
    color = max(color, u_colBg * 0.85);

    // Soft highlight knee to preserve dreamy lo-fi look
    color = color / (color + vec3(0.85)) * 1.35;

    gl_FragColor = vec4(color, 1.0);
  }
`;
