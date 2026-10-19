/**
 * Curated Cozy Color Palettes for the Lo-Fi Visualizer
 * All color values tailored for warm graphite backdrops and organic fluid lighting.
 */

export const PALETTES = {
  hearth: {
    id: 'hearth',
    name: 'Warm Hearth',
    description: 'Ember amber, burnt caramel, golden peach, graphite',
    bg: [0.043, 0.045, 0.048], // Warm graphite #0b0c0e
    emberCore: [1.0, 0.48, 0.16], // Incandescent amber #ff7a29
    emberGlow: [0.82, 0.28, 0.08], // Deep burnt terracotta
    ribbonPrimary: [0.92, 0.62, 0.38], // Silky golden peach
    ribbonSecondary: [0.72, 0.38, 0.22], // Rosewood / soft cinnamon
    sunbeam: [0.98, 0.88, 0.72], // Warm solar light shaft
    moteColor: [1.0, 0.94, 0.82], // Golden dust motes
    accent: '#f39c56'
  },
  ochre: {
    id: 'ochre',
    name: 'Midnight Ochre',
    description: 'Deep indigo graphite, saffron embers, honey ribbons',
    bg: [0.038, 0.042, 0.052], // Deep midnight slate
    emberCore: [1.0, 0.62, 0.12], // Saffron gold
    emberGlow: [0.85, 0.38, 0.05], // Molten honey
    ribbonPrimary: [0.88, 0.72, 0.42], // Honey mist
    ribbonSecondary: [0.55, 0.42, 0.25], // Toasted amber
    sunbeam: [0.96, 0.90, 0.75], // Solar gold
    moteColor: [1.0, 0.95, 0.84], // Sunlit dust
    accent: '#f7b731'
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Reverie',
    description: 'Charcoal plum, dusky rose embers, lilac-champagne ribbons',
    bg: [0.045, 0.039, 0.048], // Charcoal plum graphite
    emberCore: [0.98, 0.42, 0.52], // Dusky warm rose
    emberGlow: [0.75, 0.22, 0.35], // Deep velvet berry
    ribbonPrimary: [0.86, 0.65, 0.78], // Lilac-champagne
    ribbonSecondary: [0.58, 0.35, 0.52], // Soft mauve
    sunbeam: [0.96, 0.88, 0.92], // Soft pearl light
    moteColor: [0.98, 0.92, 0.95], // Starlight motes
    accent: '#e07a9e'
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Pine',
    description: 'Deep dark spruce, bronze embers, misty emerald ribbons',
    bg: [0.036, 0.044, 0.042], // Dark evergreen slate
    emberCore: [0.95, 0.58, 0.22], // Warm fireplace bronze
    emberGlow: [0.65, 0.32, 0.12], // Hearth cedar
    ribbonPrimary: [0.48, 0.76, 0.68], // Misty glacial jade
    ribbonSecondary: [0.28, 0.52, 0.46], // Deep spruce aura
    sunbeam: [0.88, 0.96, 0.92], // Dawn mist ray
    moteColor: [0.90, 0.98, 0.94], // Silver-green motes
    accent: '#4ecdc4'
  }
};
