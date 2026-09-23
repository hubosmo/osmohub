// Ícone orbital decorativo — mesma geometria do logo, escalado para uso como decoração de fundo
export function OrbitalDecor({ size, opacity = 0.12 }: { size: number; opacity?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const R  = size * 0.42;
  const ri = size * 0.235;
  const sw = size * 0.085;

  const outerD = `M ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx} ${cy + R}`;
  const innerD = `M ${cx} ${cy + ri} A ${ri} ${ri} 0 0 1 ${cx - ri} ${cy}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <path d={outerD} stroke="#00A6FF" strokeWidth={sw} strokeLinecap="round" />
      <path d={innerD} stroke="#00A6FF" strokeWidth={sw} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={size * 0.085} fill="#00A6FF" />
    </svg>
  );
}
