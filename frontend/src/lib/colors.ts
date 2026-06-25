export const RAIN_COLORS = [
  [255, 255, 255],
  [198, 236, 253],
  [120, 198, 247],
  [50, 150, 230],
  [20, 100, 200],
  [10, 50, 150],
  [5, 20, 100],
];

export const TEMP_COLORS = [
  [50, 20, 120],
  [20, 80, 200],
  [50, 150, 50],
  [200, 200, 50],
  [230, 150, 30],
  [230, 80, 20],
  [200, 20, 20],
];

export function getRainColor(value: number, maxVal = 100): string {
  if (maxVal <= 0) return `rgb(${RAIN_COLORS[0][0]},${RAIN_COLORS[0][1]},${RAIN_COLORS[0][2]})`;
  const idx = Math.max(0, Math.min(Math.floor((value / maxVal) * RAIN_COLORS.length), RAIN_COLORS.length - 1));
  const c = RAIN_COLORS[idx];
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function getTempColor(value: number, minVal = 10, maxVal = 45): string {
  const range = maxVal - minVal;
  if (range <= 0) return `rgb(${TEMP_COLORS[3][0]},${TEMP_COLORS[3][1]},${TEMP_COLORS[3][2]})`;
  const normalized = (value - minVal) / range;
  const idx = Math.max(0, Math.min(Math.floor(normalized * TEMP_COLORS.length), TEMP_COLORS.length - 1));
  const c = TEMP_COLORS[idx];
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function getColorForValue(
  value: number,
  variable: string,
  minVal?: number,
  maxVal?: number
): string {
  switch (variable) {
    case 'rainfall':
      return getRainColor(value, maxVal ?? 100);
    case 'max_temp':
    case 'min_temp':
    case 'temperature':
      return getTempColor(value, minVal ?? 10, maxVal ?? 45);
    default:
      return '#ffffff';
  }
}

export function getLegendGradient(variable: string): [number, string][] {
  if (variable === 'rainfall') {
    return [
      [0, '#ffffff'],
      [0.2, '#c6ecfd'],
      [0.4, '#78c6f7'],
      [0.6, '#3296e6'],
      [0.8, '#1464c8'],
      [1, '#0a3296'],
    ];
  }
  return [
    [0, '#321478'],
    [0.17, '#1450c8'],
    [0.33, '#329632'],
    [0.5, '#c8c832'],
    [0.67, '#e6961e'],
    [0.83, '#e65014'],
    [1, '#c81414'],
  ];
}
