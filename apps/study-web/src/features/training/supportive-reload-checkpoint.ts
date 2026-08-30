import type { TransientPasswordSemanticEvidence } from '@passwo/contracts';
import {
  isPermittedFictionalPassword,
  type PasswordModuleTransientResumeState,
  type RetrievalResult,
} from '@passwo/training-engine';
import type { DesktopPlatform } from '@passwo/ui';

export const SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY = 'passwo:supportive-reload-checkpoint:v1';
export const SUPPORTIVE_RELOAD_CHECKPOINT_TTL_MS = 2 * 60 * 60 * 1000;

export type SupportiveReloadSegmentId = 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S07';

export type SupportiveReloadSemanticEvidence = Partial<
  Record<'master-campus' | 'campus-email' | 'campusgram', TransientPasswordSemanticEvidence>
>;

export interface SupportiveReloadCheckpoint {
  readonly schemaVersion: 'supportive-reload-checkpoint-v1';
  readonly sessionId: string;
  readonly segmentId: SupportiveReloadSegmentId;
  readonly savedAtMs: number;
  readonly expiresAtMs: number;
  readonly platform: DesktopPlatform;
  readonly transientState: PasswordModuleTransientResumeState;
  readonly semanticEvidenceByAccount: SupportiveReloadSemanticEvidence;
}

export interface SupportiveReloadCheckpointInput {
  readonly sessionId: string;
  readonly segmentId: SupportiveReloadSegmentId;
  readonly platform: DesktopPlatform;
  readonly transientState: PasswordModuleTransientResumeState;
  readonly semanticEvidenceByAccount: SupportiveReloadSemanticEvidence;
}

interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const accountIds = ['master-campus', 'campus-email', 'campusgram'] as const;
const accountIdSet = new Set<string>(accountIds);
const retrievalResults = new Set<RetrievalResult>([
  'pending',
  'retrievable',
  'not-remembered',
  'assisted',
]);
const semanticRelationKinds = new Set<string>([
  'personal-context',
  'shared-content',
  'sentence-or-phrase',
]);
const reloadSegmentIds = new Set<SupportiveReloadSegmentId>([
  'S01',
  'S02',
  'S03',
  'S04',
  'S05',
  'S06',
  'S07',
]);

let browserExpiryTimer: number | null = null;

function browserSessionStorage(): SessionStorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function cancelBrowserExpiryTimer(): void {
  if (browserExpiryTimer === null) return;
  if (typeof window !== 'undefined') window.clearTimeout(browserExpiryTimer);
  browserExpiryTimer = null;
}

function scheduleBrowserExpiry(expiresAtMs: number, nowMs: number): void {
  if (typeof window === 'undefined') return;
  cancelBrowserExpiryTimer();
  const delayMs = Math.max(0, expiresAtMs - nowMs);
  browserExpiryTimer = window.setTimeout(() => {
    browserExpiryTimer = null;
    const storage = browserSessionStorage();
    if (storage === null) return;
    try {
      const raw = storage.getItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY);
      if (raw === null) return;
      const checkpoint = parseCheckpoint(JSON.parse(raw) as unknown);
      if (checkpoint === null || checkpoint.expiresAtMs <= Date.now()) {
        storage.removeItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY);
      } else {
        scheduleBrowserExpiry(checkpoint.expiresAtMs, Date.now());
      }
    } catch {
      try {
        storage.removeItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY);
      } catch {
        // Recovery storage is best-effort.
      }
    }
  }, delayMs);
}

function isBrowserSessionStorage(storage: SessionStorageLike): boolean {
  const browserStorage = browserSessionStorage();
  return browserStorage !== null && storage === browserStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDesktopPlatform(value: unknown): value is DesktopPlatform {
  return value === 'mac' || value === 'windows' || value === 'linux';
}

export function isSupportiveReloadSegmentId(value: unknown): value is SupportiveReloadSegmentId {
  return typeof value === 'string' && reloadSegmentIds.has(value as SupportiveReloadSegmentId);
}

function isPasswordRecord(value: unknown): value is Readonly<Record<string, string>> {
  if (!isRecord(value)) return false;
  return accountIds.every((accountId) => {
    const password = value[accountId];
    return typeof password === 'string' && isPermittedFictionalPassword(password);
  });
}

function isRetrievalResultRecord(
  value: unknown,
): value is Readonly<Record<string, RetrievalResult>> {
  if (!isRecord(value)) return false;
  return accountIds.every((accountId) => {
    const result = value[accountId];
    return typeof result === 'string' && retrievalResults.has(result as RetrievalResult);
  });
}

function isTransientResumeState(value: unknown): value is PasswordModuleTransientResumeState {
  if (!isRecord(value)) return false;
  if (typeof value.displayName !== 'string' || value.displayName.length > 40) return false;
  if (
    value.activeAccountId !== null &&
    (typeof value.activeAccountId !== 'string' || !accountIdSet.has(value.activeAccountId))
  ) {
    return false;
  }
  if (!isPasswordRecord(value.passwordValues)) return false;
  if (
    !Array.isArray(value.configuredAccountIds) ||
    value.configuredAccountIds.some(
      (accountId) => typeof accountId !== 'string' || !accountIdSet.has(accountId),
    ) ||
    new Set(value.configuredAccountIds).size !== value.configuredAccountIds.length
  ) {
    return false;
  }
  if (typeof value.s02ContentCompleted !== 'boolean') return false;
  return isRetrievalResultRecord(value.retrievalResults);
}

function isSemanticEvidence(
  value: unknown,
  fictionalPassword: string,
): value is TransientPasswordSemanticEvidence {
  if (!isRecord(value)) return false;
  if (value.kind !== 'transient-password-semantic-evidence' || value.confirmed !== true)
    return false;
  if (!Array.isArray(value.relations) || value.relations.length > 32) return false;

  return value.relations.every((relation) => {
    if (!isRecord(relation)) return false;
    if (typeof relation.id !== 'string' || relation.id.length > 160) return false;
    if (typeof relation.kind !== 'string' || !semanticRelationKinds.has(relation.kind)) {
      return false;
    }
    if (!Array.isArray(relation.evidence) || relation.evidence.length > 64) return false;
    return relation.evidence.every((span) => {
      if (!isRecord(span) || span.type !== 'span') return false;
      if (
        typeof span.start !== 'number' ||
        !Number.isInteger(span.start) ||
        typeof span.end !== 'number' ||
        !Number.isInteger(span.end) ||
        typeof span.token !== 'string'
      ) {
        return false;
      }
      const start = span.start as number;
      const end = span.end as number;
      return (
        start >= 0 &&
        end > start &&
        end <= fictionalPassword.length &&
        span.token === fictionalPassword.slice(start, end)
      );
    });
  });
}

function isSemanticEvidenceRecord(
  value: unknown,
  passwordValues: Readonly<Record<string, string>>,
): value is SupportiveReloadSemanticEvidence {
  if (!isRecord(value)) return false;
  for (const [accountId, evidence] of Object.entries(value)) {
    if (!accountIdSet.has(accountId)) return false;
    const password = passwordValues[accountId];
    if (password === undefined || !isSemanticEvidence(evidence, password)) return false;
  }
  return true;
}

function hasCompleteConfiguredPasswords(state: PasswordModuleTransientResumeState): boolean {
  return (
    accountIds.every((accountId) => state.configuredAccountIds.includes(accountId)) &&
    accountIds.every((accountId) => (state.passwordValues[accountId] ?? '').length > 0)
  );
}

function hasCompletedRetrieval(state: PasswordModuleTransientResumeState): boolean {
  return accountIds.every((accountId) => {
    const result = state.retrievalResults[accountId];
    return result === 'retrievable' || result === 'assisted';
  });
}

function isCheckpointStateConsistent(checkpoint: SupportiveReloadCheckpoint): boolean {
  if (
    checkpoint.segmentId !== 'S01' &&
    !hasCompleteConfiguredPasswords(checkpoint.transientState)
  ) {
    return false;
  }
  if (
    (checkpoint.segmentId === 'S04' ||
      checkpoint.segmentId === 'S05' ||
      checkpoint.segmentId === 'S06' ||
      checkpoint.segmentId === 'S07') &&
    !hasCompletedRetrieval(checkpoint.transientState)
  ) {
    return false;
  }
  return true;
}

function parseCheckpoint(value: unknown): SupportiveReloadCheckpoint | null {
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== 'supportive-reload-checkpoint-v1') return null;
  if (
    typeof value.sessionId !== 'string' ||
    value.sessionId.length === 0 ||
    value.sessionId.length > 80
  ) {
    return null;
  }
  if (!isSupportiveReloadSegmentId(value.segmentId)) return null;
  if (
    typeof value.savedAtMs !== 'number' ||
    !Number.isSafeInteger(value.savedAtMs) ||
    value.savedAtMs < 0 ||
    typeof value.expiresAtMs !== 'number' ||
    !Number.isSafeInteger(value.expiresAtMs) ||
    value.expiresAtMs - value.savedAtMs !== SUPPORTIVE_RELOAD_CHECKPOINT_TTL_MS
  ) {
    return null;
  }
  if (!isDesktopPlatform(value.platform)) return null;
  if (!isTransientResumeState(value.transientState)) return null;
  if (
    !isSemanticEvidenceRecord(value.semanticEvidenceByAccount, value.transientState.passwordValues)
  ) {
    return null;
  }

  const checkpoint: SupportiveReloadCheckpoint = {
    schemaVersion: 'supportive-reload-checkpoint-v1',
    sessionId: value.sessionId,
    segmentId: value.segmentId,
    savedAtMs: value.savedAtMs,
    expiresAtMs: value.expiresAtMs,
    platform: value.platform,
    transientState: value.transientState,
    semanticEvidenceByAccount: value.semanticEvidenceByAccount,
  };
  return isCheckpointStateConsistent(checkpoint) ? checkpoint : null;
}

export function readSupportiveReloadCheckpoint(
  sessionId: string,
  expectedSegmentId: SupportiveReloadSegmentId,
  storage: SessionStorageLike | null = browserSessionStorage(),
  nowMs = Date.now(),
): SupportiveReloadCheckpoint | null {
  if (storage === null) return null;
  try {
    const raw = storage.getItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY);
    if (raw === null) return null;
    const checkpoint = parseCheckpoint(JSON.parse(raw) as unknown);
    if (
      checkpoint === null ||
      checkpoint.sessionId !== sessionId ||
      checkpoint.segmentId !== expectedSegmentId ||
      checkpoint.expiresAtMs <= nowMs ||
      checkpoint.savedAtMs > nowMs + 60_000
    ) {
      storage.removeItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY);
      if (isBrowserSessionStorage(storage)) cancelBrowserExpiryTimer();
      return null;
    }
    if (isBrowserSessionStorage(storage)) scheduleBrowserExpiry(checkpoint.expiresAtMs, nowMs);
    return checkpoint;
  } catch {
    try {
      storage.removeItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY);
    } catch {
      // Recovery storage is best-effort; the ordinary S01 fallback remains available.
    }
    return null;
  }
}

export function writeSupportiveReloadCheckpoint(
  input: SupportiveReloadCheckpointInput,
  storage: SessionStorageLike | null = browserSessionStorage(),
  nowMs = Date.now(),
): boolean {
  if (storage === null) return false;
  const checkpoint = parseCheckpoint({
    schemaVersion: 'supportive-reload-checkpoint-v1',
    sessionId: input.sessionId,
    segmentId: input.segmentId,
    savedAtMs: nowMs,
    expiresAtMs: nowMs + SUPPORTIVE_RELOAD_CHECKPOINT_TTL_MS,
    platform: input.platform,
    transientState: input.transientState,
    semanticEvidenceByAccount: input.semanticEvidenceByAccount,
  });
  if (checkpoint === null) return false;
  try {
    storage.setItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY, JSON.stringify(checkpoint));
    if (isBrowserSessionStorage(storage)) scheduleBrowserExpiry(checkpoint.expiresAtMs, nowMs);
    return true;
  } catch {
    return false;
  }
}

export function clearSupportiveReloadCheckpoint(
  storage: SessionStorageLike | null = browserSessionStorage(),
): void {
  if (storage === null) return;
  if (isBrowserSessionStorage(storage)) cancelBrowserExpiryTimer();
  try {
    storage.removeItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY);
  } catch {
    // Clearing recovery storage must never block training progression.
  }
}
