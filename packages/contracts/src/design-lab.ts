import { z } from 'zod';

export const designLabRootPath = '/design-lab' as const;

export const designLabScenarioIdSchema = z.enum([
  'normal',
  'dimmed',
  'passwo-overlay',
  'training-entry',
  's00',
  's01',
  's02-master-campus',
  's03',
  's03-warning',
  's04',
  's05',
  's05-common-suffix',
  's05-all-categories',
  's05-account-year',
  's05-no-simple-component',
  's05-structure-repetition',
  's05-structure-context',
  's05-structure-none',
  's05-free-search',
  's05-application-found',
  's05-application-protected',
  's05-s06-transition',
  's06-reuse-and-derived',
  's06-incident-not-found',
  's06-incident-found-blocked',
  's06-mixed-actual-hypothetical',
  's07-passphrase-search',
  's08-network-replay',
  's08-strong-relations',
  's08-weak-mixed-relations',
  's09-password-manager-transition',
  's2-1-password-manager-transition',
  's2-2-my-shop-registration',
  's2-3-password-manager-network',
  's2-4-muster-bank-login',
  's2-5-campusgram-manual-login',
  's2-6-password-manager-conclusion',
  's3-1-mfa-factors',
  's3-2-mfa-result',
  's3-3-mfa-expansion',
  's3-4-training-summary',
]);
export type DesignLabScenarioId = z.infer<typeof designLabScenarioIdSchema>;

export const designLabScenarioIds = designLabScenarioIdSchema.options;

export const trainingQaSegmentSchema = z.enum([
  's00',
  's01',
  's02',
  's03',
  's05',
  's06',
  's07',
  's08',
  's09',
  's13',
  's13-campusgram',
  's13-conclusion',
  's14',
  's15',
  's16',
  's17',
]);
export type TrainingQaSegment = z.infer<typeof trainingQaSegmentSchema>;

export const trainingQaAccountIds = ['master-campus', 'campus-email', 'campusgram'] as const;
export type TrainingQaAccountId = (typeof trainingQaAccountIds)[number];
export type TrainingQaPasswordOverrides = Partial<Record<TrainingQaAccountId, string>>;

export const defaultTrainingQaPasswords: Readonly<Record<TrainingQaAccountId, string>> = {
  'master-campus': 'preview-campusgram-master',
  'campus-email': 'preview-campusgram',
  campusgram: 'preview-campusgram',
};

const designLabScenarioByTrainingQaSegment = {
  s00: 's00',
  s01: 's01',
  s02: 's02-master-campus',
  s03: 's03',
  s05: 's05',
  s06: 's05-s06-transition',
  s07: 's07-passphrase-search',
  s08: 's08-network-replay',
  s09: 's09-password-manager-transition',
  s13: 's2-2-my-shop-registration',
  's13-campusgram': 's2-5-campusgram-manual-login',
  's13-conclusion': 's2-6-password-manager-conclusion',
  s14: 's3-1-mfa-factors',
  s15: 's3-2-mfa-result',
  s16: 's3-3-mfa-expansion',
  s17: 's3-4-training-summary',
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
