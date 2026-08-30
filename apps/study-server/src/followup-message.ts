import { createHash } from 'node:crypto';
import { followUpInstrument } from '@passwo/contracts';
import { z } from 'zod';

export const followUpDeliveryKindSchema = z.enum(['first-invitation', 'reminder']);
export type FollowUpDeliveryKind = z.infer<typeof followUpDeliveryKindSchema>;

export const followUpSenderIdentitySchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    address: z.email(),
  })
  .strict();
export type FollowUpSenderIdentity = z.infer<typeof followUpSenderIdentitySchema>;

export interface FollowUpMessageTemplateInput {
  readonly kind: FollowUpDeliveryKind;
  readonly email: string;
  readonly rawToken: string;
  readonly tokenHash: string;
  readonly firstInvitationAtIso: string;
  readonly operationAtIso: string;
  readonly dueAtIso: string;
  readonly closesAtIso: string;
}

export interface FollowUpDeliveryMessage {
  /** Stable contact-operations identifier; an idempotent transport must use it as its key. */
  readonly operationId: string;
  readonly kind: FollowUpDeliveryKind;
  readonly sender: FollowUpSenderIdentity;
  readonly recipient: string;
  readonly subject: string;
  readonly text: string;
  readonly tokenLink: string;
  readonly dueAtIso: string;
  readonly closesAtIso: string;
}

export function followUpOperationId(
  tokenHash: string,
  kind: FollowUpDeliveryKind,
  dueAtIso: string,
): string {
  return createHash('sha256')
    .update(`passwo-follow-up-delivery-v1\0${tokenHash}\0${kind}\0${dueAtIso}`, 'utf8')
    .digest('hex');
}

export function followUpUrl(baseUrl: string, token: string): string {
  const url = new URL(baseUrl);
  if (
    url.protocol !== 'https:' ||
    url.hostname.length === 0 ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.pathname !== '/follow-up' ||
    url.search.length > 0 ||
    url.hash.length > 0
  ) {
    throw new Error('followup-base-url-must-be-canonical-https-route');
  }
  url.searchParams.set('token', token);
  return url.href;
}

function germanDate(value: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'long',
    timeZone: 'Europe/Berlin',
  }).format(new Date(value));
}

function germanDateTime(value: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  }).format(new Date(value));
}

export function renderFollowUpEmailBody(
  template: string,
  tokenLink: string,
  firstInvitationAtIso: string,
  closesAtIso: string,
): string {
  return template
    .replaceAll('[TOKEN_LINK]', tokenLink)
    .replaceAll('[STICHTAG]', germanDate(firstInvitationAtIso))
    .replaceAll('[CLOSES_AT]', germanDateTime(closesAtIso));
}

export function renderFollowUpDeliveryMessage(
  input: FollowUpMessageTemplateInput,
  baseUrl: string,
  senderInput: FollowUpSenderIdentity,
): FollowUpDeliveryMessage {
  const sender = followUpSenderIdentitySchema.parse(senderInput);
  const template =
    input.kind === 'first-invitation' ? followUpInstrument.email : followUpInstrument.reminderEmail;
  const tokenLink = followUpUrl(baseUrl, input.rawToken);
  return {
    operationId: followUpOperationId(input.tokenHash, input.kind, input.operationAtIso),
    kind: input.kind,
    sender,
    recipient: z.email().parse(input.email),
    subject: template.subject,
    text: renderFollowUpEmailBody(
      template.body,
      tokenLink,
      input.firstInvitationAtIso,
      input.closesAtIso,
    ),
    tokenLink,
    dueAtIso: input.dueAtIso,
    closesAtIso: input.closesAtIso,
  };
}
