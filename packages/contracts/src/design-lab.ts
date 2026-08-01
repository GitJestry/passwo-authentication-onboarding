import { z } from 'zod';

export const designLabRootPath = '/design-lab' as const;

export const designLabScenarioIdSchema = z.enum([
  'normal',
  'dimmed',
  'passwo-overlay',
  's00',
  's01',
  's02-master-campus',
  's03',
  's03-warning',
  's04',
  's06-identical',
  's06-similar',
  's06-unique',
  's06-hypothetical',
]);
export type DesignLabScenarioId = z.infer<typeof designLabScenarioIdSchema>;

export const designLabScenarioIds = designLabScenarioIdSchema.options;

export const trainingQaSegmentSchema = z.enum(['s00', 's01', 's02', 's03']);
export type TrainingQaSegment = z.infer<typeof trainingQaSegmentSchema>;

const designLabScenarioByTrainingQaSegment = {
  s00: 's00',
  s01: 's01',
  s02: 's02-master-campus',
  s03: 's03',
} as const satisfies Readonly<Record<TrainingQaSegment, DesignLabScenarioId>>;

export function designLabPathForScenario(scenarioId: DesignLabScenarioId): string {
  return `${designLabRootPath}/${scenarioId}`;
}

export function designLabPathForTrainingQaSegment(segment: TrainingQaSegment): string {
  return designLabPathForScenario(designLabScenarioByTrainingQaSegment[segment]);
}

export const designLabPaths = [
  designLabRootPath,
  ...designLabScenarioIds.map(designLabPathForScenario),
] as const;

export function designLabScenarioForPath(pathname: string): DesignLabScenarioId | null {
  if (pathname === designLabRootPath) return 'normal';

  const prefix = `${designLabRootPath}/`;
  if (!pathname.startsWith(prefix)) return null;

  const candidate = pathname.slice(prefix.length);
  const parsed = designLabScenarioIdSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function isDesignLabPath(pathname: string): boolean {
  return pathname === designLabRootPath || pathname.startsWith(`${designLabRootPath}/`);
}
