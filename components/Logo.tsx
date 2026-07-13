export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M61.0 12.3 A38 38 0 0 1 85.4 54.6"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className="text-foreground"
      />
      <path
        d="M72.4 77.1 A38 38 0 0 1 23.6 77.1"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className="text-foreground"
      />
      <path
        d="M10.6 54.6 A38 38 0 0 1 35.0 12.3"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className="text-foreground"
      />
      <circle cx="48" cy="10" r="9" className="fill-accent" />
      <circle cx="80.9" cy="67" r="9" className="fill-accent" />
      <circle cx="15.1" cy="67" r="9" className="fill-accent" />
    </svg>
  );
}
