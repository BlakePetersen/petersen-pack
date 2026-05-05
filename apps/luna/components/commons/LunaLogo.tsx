// ABOUTME: Luna photography logo component
// ABOUTME: Moon and sun design with celestial compass aesthetic

interface LunaLogoProps {
  className?: string
  size?: number
}

export default function LunaLogo({ className = '', size = 53 }: LunaLogoProps) {
  const width = size * (76 / 130)
  const height = size

  return (
    <svg
      width={width}
      height={height}
      viewBox="12 -12 76 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Luna Photography Logo"
      style={{ transform: 'scale(1.33333)' }}
    >
      <defs>
        {/* Mask: white = visible, black = hidden */}
        <mask id="luna-ray-mask">
          <rect x="0" y="-20" width="120" height="160" fill="white" />
          <ellipse
            cx="49.782"
            cy="50.319"
            rx="20.407"
            ry="20.393"
            fill="black"
          />
        </mask>
      </defs>

      {/* Sun rays (masked to create transparent center) */}
      <g
        mask="url(#luna-ray-mask)"
        stroke="currentColor"
        strokeLinecap="butt"
        strokeLinejoin="round"
      >
        <line x1="50" y1="9.983" x2="50" y2="34.466" strokeWidth="5" />
        <line x1="71.884" y1="28.116" x2="61.818" y2="38.182" strokeWidth="4" />
        <line x1="70.232" y1="50" x2="80" y2="50" strokeWidth="3" />
        <line x1="71.83" y1="71.83" x2="61.672" y2="61.672" strokeWidth="4" />
        <line
          x1="50"
          y1="66.247"
          x2="50"
          y2="91"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line x1="28.17" y1="71.83" x2="37" y2="63" strokeWidth="4" />
        <polyline points="20 50 27.15 50 32.711 50" strokeWidth="3" />
        <line x1="28.17" y1="28.17" x2="37" y2="37" strokeWidth="4" />
      </g>

      {/* End caps (outside mask area) */}
      <g fill="currentColor" stroke="currentColor">
        <circle cx="50" cy="0" r="0.5" strokeWidth="3.5" />
        <circle cx="50" cy="10" r="0.5" strokeWidth="4" />
        <circle cx="71.83" cy="28.17" r="0.25" strokeWidth="3.5" />
        <circle cx="80" cy="50" r="0.125" strokeWidth="2.785" />
        <circle cx="71.83" cy="71.83" r="0.25" strokeWidth="3.5" />
        <circle cx="50" cy="91" r="0.5" strokeWidth="4" />
        <circle cx="50" cy="100.997" r="0.5" strokeWidth="3.5" />
        <circle cx="50" cy="111.033" r="0.5" strokeWidth="2.75" />
        <circle cx="28.17" cy="71.83" r="0.25" strokeWidth="3.5" />
        <circle cx="20" cy="50" r="0.125" strokeWidth="2.75" />
        <circle cx="28.17" cy="28.17" r="0.25" strokeWidth="3.5" />
      </g>

      {/* Crescent moon */}
      <path
        d="M 48.197 29.548 C 65.672 29.548 71.297 42.811 71.045 50.372 C 70.468 67.705 56.307 70.867 48.197 70.867 C 59.207 70.822 62.763 55.949 62.483 49.81 C 61.999 39.216 55.789 29.389 48.197 29.548 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
      />
    </svg>
  )
}
