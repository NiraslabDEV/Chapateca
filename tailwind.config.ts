import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          deep:    '#0D1F09',
          DEFAULT: '#1C3A14',
          mid:     '#2D5220',
          light:   '#3D6B2A',
        },
        gold: {
          DEFAULT: '#C8952A',
          glow:    '#E5B84A',
          muted:   '#F0D898',
          soft:    '#FAF1D9',
        },
        parchment: {
          DEFAULT: '#F7F3EC',
          2:       '#EDE6D8',
          3:       '#F2ECE1',
        },
        sand: {
          DEFAULT: '#D4C9B0',
          light:   '#E6DFCC',
        },
        ink: {
          DEFAULT: '#161412',
          mid:     '#4A4540',
          soft:    '#8C8480',
        },
        role: {
          campo:         '#2D7D46',
          'campo-bg':    '#E8F5EC',
          comunicacao:         '#1A5C8A',
          'comunicacao-bg':    '#E3EEF7',
          financas:         '#8B3A3A',
          'financas-bg':    '#F7ECEC',
          direcao:         '#5A3A8B',
          'direcao-bg':    '#EDE8F7',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(200,149,42,0.35)',
      },
    },
  },
  plugins: [],
}

export default config
