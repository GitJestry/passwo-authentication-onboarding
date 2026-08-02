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
      coreAction: {
        id: 'open-master-service',
        animationId: 'complete-master',
        targetDetailIds: ['master-service'],
      },
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
          descriptions: { available: 'Vorschau öffnen', opened: 'Vorschau erneut öffnen' },
        },
        {
          id: 'master-option',
          label: 'Option',
          symbolId: 'service',
          position: { x: 0.2, y: 0.6 },
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
      coreAction: {
        id: 'open-email-link',
        animationId: 'complete-email',
        targetDetailIds: ['email-link'],
      },
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
      coreAction: {
        id: 'open-campusgram-message',
        animationId: 'complete-campusgram',
        targetDetailIds: ['campusgram-message'],
      },
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
          descriptions: { available: 'Vorschau öffnen', opened: 'Vorschau erneut öffnen' },
        },
      ],
    },
  ],
} as const satisfies AccountExplorationSceneDefinition;

function settleAccountOpening(
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

function completeCoreAction(
  snapshot: AccountExplorationSceneSnapshot,
  accountId: string,
): AccountExplorationSceneSnapshot {
  const account = definition.accounts.find(({ id }) => id === accountId);
  const targetDetailId = account?.coreAction.targetDetailIds[0];
  if (account === undefined || targetDetailId === undefined) {
    throw new Error(`missing core action: ${accountId}`);
  }
  const started = transitionAccountExplorationScene(definition, snapshot, {
    type: 'core-action-started',
    accountId,
    targetDetailId,
  }).snapshot;
  return transitionAccountExplorationScene(definition, started, {
    type: 'animation-settled',
    animationId: account.coreAction.animationId,
  }).snapshot;
}

describe('account exploration scene', () => {
  it('allows accounts to be opened in a free order', () => {
    const initial = createAccountExplorationScene(definition);
    const campusgramReady = settleAccountOpening(initial, 'campusgram');
    const masterSelected = transitionAccountExplorationScene(definition, campusgramReady, {
      type: 'node-selected',
      nodeId: 'master',
    }).snapshot;

    expect(masterSelected.activeAccountId).toBe('master');
    expect(masterSelected.pendingAnimationId).toBe('unlock-master');
  });

  it('keeps optional detail previews out of the required account progress', () => {
    const masterReady = settleAccountOpening(createAccountExplorationScene(definition), 'master');
    const optionalPreview = transitionAccountExplorationScene(definition, masterReady, {
      type: 'node-selected',
      nodeId: 'master-option',
    }).snapshot;

    expect(optionalPreview.activePreviewDetailId).toBe('master-option');
    expect(optionalPreview.viewedAccountIds).toEqual([]);
    expect(optionalPreview.isComplete).toBe(false);
  });

  it('requires one core action per account before completing', () => {
    const masterViewed = completeCoreAction(
      settleAccountOpening(createAccountExplorationScene(definition), 'master'),
      'master',
    );
    const campusgramViewed = completeCoreAction(
      settleAccountOpening(masterViewed, 'campusgram'),
      'campusgram',
    );
    const complete = completeCoreAction(
      settleAccountOpening(campusgramViewed, 'email'),
      'email',
    );

    expect(masterViewed.viewedAccountIds).toEqual(['master']);
    expect(campusgramViewed.viewedAccountIds).toEqual(['master', 'campusgram']);
    expect(complete.viewedAccountIds).toEqual(['master', 'email', 'campusgram']);
    expect(complete.isComplete).toBe(true);
  });
});
