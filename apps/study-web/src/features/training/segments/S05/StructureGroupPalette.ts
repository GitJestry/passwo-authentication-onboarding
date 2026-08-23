const structureGroups = [
  { color: '#174C3A', letter: 'A' },
  { color: '#567A32', letter: 'B' },
  { color: '#3C9A61', letter: 'C' },
] as const;

export function structureGroupColor(index: number): string {
  return (structureGroups[index] ?? structureGroups[0]).color;
}

export function structureGroupLetter(index: number): string {
  return (structureGroups[index] ?? structureGroups[0]).letter;
}
