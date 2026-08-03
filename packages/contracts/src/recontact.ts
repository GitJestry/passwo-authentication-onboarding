import { z } from 'zod';

export const recontactEmailSchema = z.string().trim().min(3).max(254).email();
export type RecontactEmail = z.infer<typeof recontactEmailSchema>;

export const followUpTokenHashSchema = z.string().regex(/^[a-f0-9]{64}$/u);
export type FollowUpTokenHash = z.infer<typeof followUpTokenHashSchema>;

export const followUpRawTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/u);
export type FollowUpRawToken = z.infer<typeof followUpRawTokenSchema>;
