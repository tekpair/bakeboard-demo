import type { WorkspaceAppearance } from './types';
export const themePresets: Record<
  WorkspaceAppearance['preset'],
  WorkspaceAppearance & { name: string }
> = {
  'classic-sage': {
    name: 'Classic Sage',
    preset: 'classic-sage',
    accent: '#3d5848',
    background: '#fafbf8',
    surface: '#ffffff',
  },
  'soft-rose': {
    name: 'Soft Rose',
    preset: 'soft-rose',
    accent: '#805462',
    background: '#fcf8f8',
    surface: '#fffdfd',
  },
  'warm-neutral': {
    name: 'Warm Neutral',
    preset: 'warm-neutral',
    accent: '#705a43',
    background: '#faf7f1',
    surface: '#fffefb',
  },
  'slate-blue': {
    name: 'Slate Blue',
    preset: 'slate-blue',
    accent: '#495f78',
    background: '#f6f8fb',
    surface: '#fdfefe',
  },
};
export const defaultAppearance: WorkspaceAppearance = {
  preset: 'classic-sage',
  accent: '#3d5848',
  background: '#fafbf8',
  surface: '#ffffff',
};
// Colors are derived from a preset, including when reading older custom themes.
export function appearanceForPreset(preset: unknown): WorkspaceAppearance {
  const theme =
    typeof preset === 'string' && Object.hasOwn(themePresets, preset)
      ? themePresets[preset as WorkspaceAppearance['preset']]
      : defaultAppearance;
  return {
    preset: theme.preset,
    accent: theme.accent,
    background: theme.background,
    surface: theme.surface,
  };
}
function luminance(color: string) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(color.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function accentTint(color: string) {
  return (
    '#' +
    [1, 3, 5]
      .map((i) =>
        Math.round(parseInt(color.slice(i, i + 2), 16) * 0.1 + 255 * 0.9)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
export function appearanceErrors(
  value: WorkspaceAppearance,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!value || !Object.hasOwn(themePresets, value.preset))
    errors['appearance.preset'] = 'Choose a theme preset.';
  if (errors['appearance.preset']) return errors;
  const theme = appearanceForPreset(value.preset);
  for (const key of ['accent', 'background', 'surface'] as const) {
    if (
      typeof value[key] !== 'string' ||
      value[key].toLowerCase() !== theme[key]
    ) {
      errors[`appearance.${key}`] =
        'Colors are set by the selected theme preset.';
      errors['appearance.preset'] =
        'Choose a theme preset to apply its colors.';
    }
  }
  return errors;
}
