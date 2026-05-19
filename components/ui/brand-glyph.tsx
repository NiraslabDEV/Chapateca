export default function BrandGlyph({ size = 32, color = '#C8952A' }: { size?: number; color?: string }) {
  return (
    <span style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 32 32" fill="none" width={size} height={size}>
        <path d="M4 9 L15 12 L15 27 L4 24 Z" fill={color} opacity="0.85" />
        <path d="M28 9 L17 12 L17 27 L28 24 Z" fill={color} opacity="0.6" />
        <path d="M15 12 L16 11.4 L17 12 L17 27 L16 27.4 L15 27 Z" fill={color} />
        <path d="M16 11 C 13 6, 17 3, 21 4 C 20 7, 19 9, 16 11 Z" fill={color} opacity="0.9" />
        <path d="M16 11 C 17 8, 19 6, 21 4" stroke="#1C3A14" strokeWidth="0.6" strokeLinecap="round" opacity="0.4" />
      </svg>
    </span>
  )
}
