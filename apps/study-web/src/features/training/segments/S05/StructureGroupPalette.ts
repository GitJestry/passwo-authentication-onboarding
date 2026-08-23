const structureGroupPalette = [
  '#1E8449',
  '#52BE80',
  '#A9DFBF',
  '#E8F8F0',
] as const;

export function structureGroupColor(index: number): string {
  return structureGroupPalette[index] ?? structureGroupPalette[0];
}
