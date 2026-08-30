import { describe, expect, it } from 'vitest';
import {
  readSupportiveReloadCheckpoint,
  SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY,
  SUPPORTIVE_RELOAD_CHECKPOINT_TTL_MS,
  writeSupportiveReloadCheckpoint,
} from './supportive-reload-checkpoint.js';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

const transientState = {
  displayName: 'Alex',
  activeAccountId: 'campusgram',
  passwordValues: {
    'master-campus': 'MasterCampus!23',
    'campus-email': 'CampusMail!45',
    campusgram: 'Campusgram!67',
  },
  configuredAccountIds: ['master-campus', 'campus-email', 'campusgram'],
  s02ContentCompleted: true,
  retrievalResults: {
    'master-campus': 'assisted' as const,
    'campus-email': 'retrievable' as const,
    campusgram: 'retrievable' as const,
  },
} as const;

describe('supportive reload checkpoint', () => {
  it('restores only the matching session and exact segment checkpoint', () => {
    const storage = createStorage();
    const saved = writeSupportiveReloadCheckpoint(
      {
        sessionId: 'session-a',
        segmentId: 'S05',
        platform: 'mac',
        transientState,
        semanticEvidenceByAccount: {},
      },
      storage,
      1_000,
    );

    expect(saved).toBe(true);
    expect(readSupportiveReloadCheckpoint('session-a', 'S05', storage, 2_000)).toMatchObject({
      sessionId: 'session-a',
      segmentId: 'S05',
      platform: 'mac',
      transientState,
    });
  });

  it('removes a checkpoint when the server segment does not match', () => {
    const storage = createStorage();
    expect(
      writeSupportiveReloadCheckpoint(
        {
          sessionId: 'session-a',
          segmentId: 'S05',
          platform: 'windows',
          transientState,
          semanticEvidenceByAccount: {},
        },
        storage,
        1_000,
      ),
    ).toBe(true);

    expect(readSupportiveReloadCheckpoint('session-a', 'S06', storage, 2_000)).toBeNull();
    expect(storage.getItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY)).toBeNull();
  });

  it('rejects a locally tampered checkpoint that extends the fixed TTL', () => {
    const storage = createStorage();
    expect(
      writeSupportiveReloadCheckpoint(
        {
          sessionId: 'session-a',
          segmentId: 'S05',
          platform: 'mac',
          transientState,
          semanticEvidenceByAccount: {},
        },
        storage,
        1_000,
      ),
    ).toBe(true);

    const raw = storage.getItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    if (raw === null) throw new Error('missing-checkpoint-fixture');
    const tampered = JSON.parse(raw) as { expiresAtMs: number };
    tampered.expiresAtMs += 60_000;
    storage.setItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY, JSON.stringify(tampered));

    expect(readSupportiveReloadCheckpoint('session-a', 'S05', storage, 2_000)).toBeNull();
    expect(storage.getItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY)).toBeNull();
  });

  it('expires the tab-local checkpoint after the fixed short TTL', () => {
    const storage = createStorage();
    expect(
      writeSupportiveReloadCheckpoint(
        {
          sessionId: 'session-a',
          segmentId: 'S05',
          platform: 'linux',
          transientState,
          semanticEvidenceByAccount: {},
        },
        storage,
        1_000,
      ),
    ).toBe(true);

    expect(
      readSupportiveReloadCheckpoint(
        'session-a',
        'S05',
        storage,
        1_000 + SUPPORTIVE_RELOAD_CHECKPOINT_TTL_MS,
      ),
    ).toBeNull();
    expect(storage.getItem(SUPPORTIVE_RELOAD_CHECKPOINT_STORAGE_KEY)).toBeNull();
  });
});
