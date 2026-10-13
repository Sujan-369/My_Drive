interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="My Drive">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FB7185" />
          <stop offset="1" stopColor="#E11D48" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      <path
        d="M8 12.5A2.5 2.5 0 0 1 10.5 10h3.6c.5 0 .9.2 1.2.5l1.2 1.5H21.5A2.5 2.5 0 0 1 24 14.5V21.5A2.5 2.5 0 0 1 21.5 24h-11A2.5 2.5 0 0 1 8 21.5z"
        fill="#fff"
        fillOpacity=".4"
      />
      <path
        d="M8 17A2.5 2.5 0 0 1 10.5 14.5h11A2.5 2.5 0 0 1 24 17v4.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 8 21.5z"
        fill="#fff"
      />
    </svg>
  );
}