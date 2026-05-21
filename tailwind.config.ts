import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primário: ROXO da marca (#461882)
        forest: {
          deep:    '#2A0D52',
          DEFAULT: '#461882',
          mid:     '#5A2AA0',
          light:   '#7B4DC0',
        },
        // Acento: LARANJA da marca (#E8652A)
        gold: {
          DEFAULT: '#E8652A',
          glow:    '#F07840',
          muted:   '#FAC8A8',
          soft:    '#FFF0E8',
        },
        // Fundo claro: azul-água suave do site
        parchment: {
          DEFAULT: '#FFFFFF',
          2:       '#EDF8F9',   // azul-água muito suave
          3:       '#F5FCFC',   // quase branco com toque aqua
        },
        // Bordas: tom roxo suave
        sand: {
          DEFAULT: '#D4C8EC',
          light:   '#E8E0F5',
        },
        // Texto
        ink: {
          DEFAULT: '#1A0A30',
          mid:     '#4A3D60',
          soft:    '#8B7FA8',
        },
        // Azul-água do site (secção de fundo)
        aqua: {
          DEFAULT: '#C8E8EE',
          dark:    '#A0D4DC',
          soft:    '#E8F8FA',
        },
        // Roles (mantêm-se)
        role: {
          campo:             '#2D7D46',
          'campo-bg':        '#E8F5EC',
          comunicacao:       '#1A5C8A',
          'comunicacao-bg':  '#E3EEF7',
          financas:          '#8B3A3A',
          'financas-bg':     '#F7ECEC',
          direcao:           '#5A3A8B',
          'direcao-bg':      '#EDE8F7',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(232,101,42,0.35)',
      },
    },
  },
  plugins: [],
}

export default config
