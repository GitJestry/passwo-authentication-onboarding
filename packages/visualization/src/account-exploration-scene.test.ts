import { describe, expect, it } from 'vitest';
import {
  createAccountExplorationScene,
  transitionAccountExplorationScene,
  type AccountExplorationSceneDefinition,
  type AccountExplorationSceneSnapshot,
} from './account-exploration-scene.js';

const definition = {
  id: 'account-exploration-test',
  introAnimationId: 'intro',
  initialNarrationId: 'intro',
  summaries: {
    initial: 'Konten auswählen.',
    complete: 'Alle Konten angesehen.',
  },
  accounts: [
    {
      id: 'master',
      label: 'Master',
      symbolId: 'account',
      position: { x: 0.1, y: 0.1 },
      detailKind: 'service',
      edgeKind: 'dependency',
      edgeLabel: 'verbunden',
      unlockAnimationId: 'unlock-master',
      detailRevealAnimationId: 'reveal-master',
      previewSequence: ['master-service', 'master-option'],
      narrationId: 'master',
      descriptions: {
        locked: 'geschlossen',
        opening: 'öffnet',
        ready: 'bereit',
        viewed: 'angesehen',
      },
      summaries: {
        locked: 'geschlossen',
        opening: 'öffnet',
        ready: 'bereit',
        checking: '{detail} wird geöffnet.',
        viewed: 'angesehen',
      },
      details: [
        {
          id: 'master-service',
          label: 'Dienst',
          symbolId: 'service',
          position: { x: 0.1, y: 0.4 },
          preview: { animationId: 'preview-master-service' },
          descriptions: { available: 'Vorschau öffnen', opened: 'Vorschau erneut öffnen' },
        },
        {
          id: 'master-option',
          label: 'Option',
          symbolId: 'service',
          position: { x: 0.2, y: 0.6 },
          preview: { animationId: 'preview-master-option' },
          descriptions: { available: 'Vorschau öffnen', opened: 'Vorschau erneut öffnen' },
        },
      ],
    },
    {
      id: 'email',
      label: 'E-Mail',
      symbolId: 'account',
      position: { x: 0.7, y: 0.1 },
      detailKind: 'function',
      edgeKind: 'association',
      edgeLabel: 'enthält',
      unlockAnimationId: 'unlock-email',
      detailRevealAnimationId: 'reveal-email',
      previewSequence: ['email-link'],
      narrationId: 'email',
      descriptions: {
        locked: 'geschlossen',
        opening: 'öffnet',
        ready: 'bereit',
        viewed: 'angesehen',
      },
      summaries: {
        locked: 'geschlossen',
        opening: 'öffnet',
        ready: 'bereit',
        checking: '{detail} wird geöffnet.',
        viewed: 'angesehen',
      },
      details: [
        {
          id: 'email-link',
          label: 'Link',
          symbolId: 'function',
          position: { x: 0.7, y: 0.4 },
          preview: { animationId: 'preview-email-link' },
          descriptions: { available: 'Vorschau öffnen', opened: 'Vorschau erneut öffnen' },
        },
      ],
    },
    {
      id: 'campusgram',
      label: 'Campusgram',
      symbolId: 'account',
      position: { x: 0.4, y: 0.3 },
      detailKind: 'content',
      edgeKind: 'association',
      edgeLabel: 'enthält',
      unlockAnimationId: 'unlock-campusgram',
      detailRevealAnimationId: 'reveal-campusgram',
      previewSequence: ['campusgram-message'],
      narrationId: 'campusgram',
      descriptions: {
        locked: 'geschlossen',
        opening: 'öffnet',
        ready: 'bereit',
        viewed: 'angesehen',
      },
      summaries: {
        locked: 'geschlossen',
        opening: 'öffnet',
        ready: 'bereit',
        checking: '{detail} wird geöffnet.',
        viewed: 'angesehen',
      },
      details: [
        {
          id: 'campusgram-message',
          label: 'Nachricht',
          symbolId: 'content',
          position: { x: 0.4, y: 0.7 },
          preview: { animationId: 'preview-campusgram-message' },
          descriptions: { available: 'Vorschau öffnen', opened: 'Vorschau erneut öffnen' },
        },
      ],
    },
  ],
} as const satisfies AccountExplorationSceneDefinition;

function openAccount(
  snapshot: AccountExplorationSceneSnapshot,
  accountId: string,
): AccountExplorationSceneSnapshot {
  const account = definition.accounts.find(({ id }) => id === accountId);
  if (account === undefined) throw new Error(`missing test account: ${accountId}`);
  const selected = transitionAccountExplorationScene(definition, snapshot, {
    type: 'node-selected',
    nodeId: account.id,
  }).snapshot;
  const unlocked = transitionAccountExplorationScene(definition, selected, {
    type: 'animation-settled',
    animationId: account.unlockAnimationId,
  }).snapshot;
  return transitionAccountExplorationScene(definition, unlocked, {
    type: 'animation-settled',
    animationId: account.detailRevealAnimationId,
  }).snapshot;
}

function settleActivePreview(
  snapshot: AccountExplorationSceneSnapshot,
): AccountExplorationSceneSnapshot {
  if (snapshot.pendingAnimationId === null) throw new Error('missing active preview animation');
  return transitionAccountExplorationScene(definition, snapshot, {
    type: 'animation-settled',
    animationId: snapshot.pendingAnimationId,
  }).snapshot;
}

function completeAccount(
  snapshot: AccountExplorationSceneSnapshot,
  accountId: string,
): AccountExplorationSceneSnapshot {
  let current = openAccount(snapshot, accountId);
  const account = definition.accounts.find(({ id }) => id === accountId);
  if (account === undefined) throw new Error(`missing account: ${accountId}`);
  for (let index = 0; index < account.previewSequence.length; index += 1) {
    current = settleActivePreview(current);
    current = transitionAccountExplorationScene(definition, current, {
      type: 'preview-advance-requested',
    }).snapshot;
  }
  return current;
}

describe('account exploration scene', () => {
  it('allows accounts to be opened in a free order', () => {
    const initial = createAccountExplorationScene(definition);
    const campusgramComplete = completeAccount(initial, 'campusgram');
    const masterSelected = transitionAccountExplorationScene(definition, campusgramComplete, {
      type: 'node-selected',
      nodeId: 'master',
    }).snapshot;

    expect(masterSelected.activeAccountId).toBe('master');
    expect(masterSelected.pendingAnimationId).toBe('unlock-master');
  });

  it('locks other accounts and detail-node clicks while a guided account tour is active', () => {
    const masterTour = openAccount(createAccountExplorationScene(definition), 'master');
    const otherAccount = transitionAccountExplorationScene(definition, masterTour, {
      type: 'node-selected',
      nodeId: 'email',
    }).snapshot;
    const detailClick = transitionAccountExplorationScene(definition, masterTour, {
      type: 'node-selected',
      nodeId: 'master-option',
    }).snapshot;

    expect(masterTour.activePreviewDetailId).toBe('master-service');
    expect(otherAccount).toBe(masterTour);
    expect(detailClick).toBe(masterTour);
  });

  it('enables advancing only after playback and visits previews in authored order', () => {
    const playingFirst = openAccount(createAccountExplorationScene(definition), 'master');
    const blockedAdvance = transitionAccountExplorationScene(definition, playingFirst, {
      type: 'preview-advance-requested',
    }).snapshot;
    const readyFirst = settleActivePreview(playingFirst);
    const playingSecond = transitionAccountExplorationScene(definition, readyFirst, {
      type: 'preview-advance-requested',
    }).snapshot;

    expect(blockedAdvance).toBe(playingFirst);
    expect(readyFirst.previewPlayback).toBe('ready');
    expect(playingSecond.activePreviewDetailId).toBe('master-option');
    expect(playingSecond.previewPlayback).toBe('playing');
  });

  it('replays the active preview without clearing completed detail progress', () => {
    const ready = settleActivePreview(openAccount(createAccountExplorationScene(definition), 'master'));
    const replaying = transitionAccountExplorationScene(definition, ready, {
      type: 'preview-replay-requested',
    }).snapshot;

    expect(replaying.activePreviewDetailId).toBe('master-service');
    expect(replaying.previewPlayback).toBe('playing');
    expect(replaying.accountProgress[0]?.viewedDetailIds).toEqual(['master-service']);
  });

  it('requires every preview in all three accounts before completing', () => {
    const masterViewed = completeAccount(createAccountExplorationScene(definition), 'master');
    const campusgramViewed = completeAccount(masterViewed, 'campusgram');
    const complete = completeAccount(campusgramViewed, 'email');

    expect(masterViewed.viewedAccountIds).toEqual(['master']);
    expect(campusgramViewed.viewedAccountIds).toEqual(['master', 'campusgram']);
    expect(complete.viewedAccountIds).toEqual(['master', 'email', 'campusgram']);
    expect(complete.isComplete).toBe(true);
  });
});
