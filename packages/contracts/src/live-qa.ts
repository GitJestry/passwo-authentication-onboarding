import { z } from 'zod';
import { followUpAccessResponseSchema } from './follow-up.js';
import { followUpRawTokenSchema } from './recontact.js';
import { researchCodeSchema } from './study.js';

export const liveQaRootPath = '/qa' as const;
export const liveQaFollowUpPath = `${liveQaRootPath}/follow-up` as const;

export const liveQaConditionSchema = z.enum(['supportive', 'reference']);
export type LiveQaCondition = z.infer<typeof liveQaConditionSchema>;

export const liveQaModeSchema = z.enum(['direct', 'study']);
export type LiveQaMode = z.infer<typeof liveQaModeSchema>;

export const liveQaFollowUpPreviewStatusSchema = z.enum([
  'not-yet-open',
  'expired',
  'submitted',
  'invalid',
]);
export type LiveQaFollowUpPreviewStatus = z.infer<typeof liveQaFollowUpPreviewStatusSchema>;

export const liveQaFollowUpCaseScenarioSchema = z.enum(['available', 'not-yet-open', 'expired']);
export type LiveQaFollowUpCaseScenario = z.infer<typeof liveQaFollowUpCaseScenarioSchema>;

export type LiveQaRoute =
  | { readonly kind: 'chooser' }
  | { readonly kind: 'follow-up' }
  | {
      readonly kind: 'follow-up-preview';
      readonly status: LiveQaFollowUpPreviewStatus;
    }
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

export function liveQaFollowUpPreviewPath(status: LiveQaFollowUpPreviewStatus): string {
  return `${liveQaFollowUpPath}/${status}`;
}

export function liveQaRouteForPath(pathname: string): LiveQaRoute | null {
  if (pathname === liveQaRootPath || pathname === `${liveQaRootPath}/`) {
    return { kind: 'chooser' };
  }
  if (pathname === liveQaFollowUpPath || pathname === `${liveQaFollowUpPath}/`) {
    return { kind: 'follow-up' };
  }

  const followUpPreviewPrefix = `${liveQaFollowUpPath}/`;
  if (pathname.startsWith(followUpPreviewPrefix)) {
    const candidate = pathname.slice(followUpPreviewPrefix.length);
    const status = liveQaFollowUpPreviewStatusSchema.safeParse(candidate);
    return status.success ? { kind: 'follow-up-preview', status: status.data } : null;
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

const liveQaFollowUpMessageSchema = z
  .object({
    kind: z.enum(['first-invitation', 'reminder']),
    sender: z.object({ name: z.string().min(1), address: z.email() }).strict(),
    recipient: z.email(),
    subject: z.string().min(1),
    text: z.string().min(1),
    tokenLink: z.url(),
    dueAtIso: z.iso.datetime(),
    closesAtIso: z.iso.datetime(),
  })
  .strict();

export const liveQaFollowUpMessagesResponseSchema = z
  .object({
    invitation: liveQaFollowUpMessageSchema.extend({ kind: z.literal('first-invitation') }),
    reminder: liveQaFollowUpMessageSchema.extend({ kind: z.literal('reminder') }),
  })
  .strict();
export type LiveQaFollowUpMessagesResponse = z.infer<typeof liveQaFollowUpMessagesResponseSchema>;

export const liveQaFollowUpCaseRequestSchema = z
  .object({
    sessionId: z.uuid(),
    scenario: liveQaFollowUpCaseScenarioSchema,
  })
  .strict();
export const liveQaFollowUpCaseResponseSchema = z
  .object({
    token: followUpRawTokenSchema,
    researchId: researchCodeSchema,
    access: followUpAccessResponseSchema,
  })
  .strict();
export type LiveQaFollowUpCaseResponse = z.infer<typeof liveQaFollowUpCaseResponseSchema>;

export const liveQaFollowUpVerificationRequestSchema = z
  .object({ token: followUpRawTokenSchema })
  .strict();
export const liveQaFollowUpVerificationResponseSchema = z
  .object({
    researchId: researchCodeSchema,
    status: z.literal('submitted'),
    storedResponseCount: z.literal(6),
    linkedToMainCase: z.literal(true),
    reminderEligible: z.literal(false),
  })
  .strict();
export type LiveQaFollowUpVerificationResponse = z.infer<
  typeof liveQaFollowUpVerificationResponseSchema
>;
