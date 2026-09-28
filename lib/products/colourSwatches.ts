export function isColourOptionName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized === 'color' || normalized === 'colour' || normalized === 'finish';
}

export function swatchBackground(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes('chrome')) {
    return 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 35%, #ffffff 55%, #94a3b8 100%)';
  }
  if (normalized.includes('brushed nickel') || normalized.includes('nickel')) {
    return 'linear-gradient(135deg, #d6d3d1 0%, #a8a29e 45%, #e7e5e4 100%)';
  }
  if (normalized.includes('stainless') || normalized.includes('silver')) {
    return 'linear-gradient(135deg, #f1f5f9 0%, #9ca3af 50%, #e5e7eb 100%)';
  }
  if (normalized.includes('gunmetal') || normalized.includes('graphite')) {
    return '#4b5563';
  }
  if (normalized.includes('matte black') || normalized === 'black') {
    return '#111827';
  }
  if (normalized.includes('white')) {
    return '#ffffff';
  }
  if (
    normalized.includes('brushed gold') ||
    normalized.includes('gold') ||
    normalized.includes('brass')
  ) {
    return '#c6a15b';
  }
  if (normalized.includes('rose gold') || normalized.includes('copper')) {
    return '#b8735c';
  }
  if (normalized.includes('bronze')) {
    return '#7c5a3c';
  }
  if (normalized.includes('grey') || normalized.includes('gray')) {
    return '#9ca3af';
  }

  return '#d1d5db';
}
