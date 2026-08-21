import { z } from 'zod';

export const liveQaRootPath = '/qa' as const;

export const liveQaConditionSchema = z.enum(['supportive', 'reference']);
export type LiveQaCondition = z.infer<typeof liveQaConditionSchema>;

export const liveQaModeSchema = z.enum(['direct', 'study']);
export type LiveQaMode = z.infer<typeof liveQaModeSchema>;

export type LiveQaRoute =
  | { readonly kind: 'chooser' }
  | {
      readonly kind: 'condition';
      readonly condition: LiveQaCondition;
      readonly mode: LiveQaMode;
    };

export function liveQaPath(condition: LiveQaCondition, mode: LiveQaMode): string {
  return `${liveQaRootPath}/${condition}/${mode}`;
}

export function liveQaApiBasePath(condition: LiveQaCondition): string {
  return `${liveQaRootPath}/${condition}/runtime`;
}

export function liveQaRouteForPath(pathname: string): LiveQaRoute | null {
  if (pathname === liveQaRootPath || pathname === `${liveQaRootPath}/`) {
    return { kind: 'chooser' };
  }

  const prefix = `${liveQaRootPath}/`;
  if (!pathname.startsWith(prefix)) return null;
  const [conditionCandidate, modeCandidate, ...remainder] = pathname
    .slice(prefix.length)
    .split('/');
  if (remainder.length > 0) return null;

  const condition = liveQaConditionSchema.safeParse(conditionCandidate);
  const mode = liveQaModeSchema.safeParse(modeCandidate);
  if (!condition.success || !mode.success) return null;
  return { kind: 'condition', condition: condition.data, mode: mode.data };
}

export function isLiveQaPath(pathname: string): boolean {
  return pathname === liveQaRootPath || pathname.startsWith(`${liveQaRootPath}/`);
}
