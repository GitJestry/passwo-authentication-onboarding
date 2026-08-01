import {
  getS03Animation,
  type S01AccountId,
  type S03RetrievalResult,
  s01Content,
  s02Content,
  s03Content,
} from '@passwo/training-content';
import type { AnimationPlayerPort, AnimationResult } from '@passwo/training-engine';
import type {
  NetworkRendererPort,
  NetworkSceneSnapshot,
  SceneEdge,
  SceneNode,
} from '@passwo/visualization';
import type { NetworkPresentationSnapshot } from '../../../../adapters/network/NetworkMotionAdapter.js';

type ControllerListener = (snapshot: S03RetrievalControllerSnapshot) => void;

export interface S03RetrievalControllerSnapshot {
  readonly network: NetworkSceneSnapshot;
  readonly presentation: NetworkPresentationSnapshot;
  readonly warningState: 'idle' | 'playing' | 'ready' | 'failed' | 'confirmed';
}

export interface S03RetrievalControllerOptions {
  readonly animationPlayer: AnimationPlayerPort;
  readonly onWarningConfirmed: () => void;
}

interface RetrievalSceneInput {
  readonly activeAccountId: string | null;
  readonly retrievalResults: Readonly<Record<string, S03RetrievalResult>>;
}

function accountDetails(accountId: string) {
  const account = s02Content.scene.accounts.find(({ id }) => id === accountId);
  if (account === undefined) throw new Error(`missing-s03-account-details:${accountId}`);
  return account;
}

function nodeDescription(accountId: S01AccountId, result: S03RetrievalResult): string {
  if (result === 'retrievable') return s03Content.statuses.retrievable;
  if (result === 'assisted') return s03Content.statuses.assisted;
  if (result === 'not-remembered') return s03Content.statuses.notRemembered;
  return s03Content.accountLoginTitles[accountId];
}

function nodeStatus(result: S03RetrievalResult): SceneNode['status'] {
  if (result === 'assisted') return 'retrievable';
  return result === 'pending' ? 'neutral' : result;
}

function isOpened(result: S03RetrievalResult): boolean {
  return result === 'retrievable' || result === 'assisted';
}

export function createS03RetrievalNetwork({
  activeAccountId,
  retrievalResults,
}: RetrievalSceneInput): NetworkSceneSnapshot {
  const resolvedActiveAccountId = activeAccountId ?? s01Content.browser.accounts[0]?.id;
  const activeAccount =
    resolvedActiveAccountId === undefined ? undefined : accountDetails(resolvedActiveAccountId);
  const accountNodes: readonly SceneNode[] = s01Content.browser.accounts.map((account) => ({
    id: account.id,
    kind: 'account',
    label: account.label,
    description: nodeDescription(account.id, retrievalResults[account.id] ?? 'pending'),
    status: nodeStatus(retrievalResults[account.id] ?? 'pending'),
    position: accountDetails(account.id).position,
    selectable: false,
  }));
  const activeResult =
    activeAccount === undefined ? 'pending' : (retrievalResults[activeAccount.id] ?? 'pending');
  const detailNodes: readonly SceneNode[] =
    activeAccount === undefined
      ? []
      : activeAccount.details.map((detail) => ({
          id: detail.id,
          kind: activeAccount.detailKind,
          label: detail.label,
          description:
            isOpened(activeResult)
              ? activeResult === 'assisted'
                ? s03Content.statuses.assisted
                : s03Content.statuses.retrievable
              : activeResult === 'not-remembered'
                ? s03Content.statuses.notRemembered
                : s03Content.accountLoginTitles[activeAccount.id],
          status: isOpened(activeResult) ? 'understood' : 'neutral',
          position: detail.position,
          selectable: false,
        }));
  const activeEdgeKind = activeAccount?.edgeKind ?? null;
  const edges: readonly SceneEdge[] =
    activeAccount === undefined || activeEdgeKind === null
      ? []
      : activeAccount.details.map((detail) => ({
          id: `${activeAccount.id}--${detail.id}`,
          sourceId: activeAccount.id,
          targetId: detail.id,
          kind: activeEdgeKind,
          status: isOpened(activeResult) ? 'opened' : 'neutral',
          label: activeAccount.edgeLabel,
        }));

  return {
    id: 's03-retrieval-network',
    nodes: [...accountNodes, ...detailNodes],
    edges,
    accessibleSummary: s03Content.page.progress(
      Object.values(retrievalResults).filter((result) => result !== 'pending').length,
    ),
  };
}

function createInitialPresentation(): NetworkPresentationSnapshot {
  return {
    character: { placement: 'bottom-left', pose: 'dock' },
    revealedNodeIds: [
      ...s01Content.browser.accounts.map(({ id }) => id),
      ...s02Content.scene.accounts.flatMap(({ details }) => details.map(({ id }) => id)),
    ],
    highlightedNodeId: null,
    emphasis: null,
    announcedMessageId: null,
  };
}

export class S03RetrievalController {
  readonly #animationPlayer: AnimationPlayerPort;
  readonly #onWarningConfirmed: () => void;
  readonly #listeners = new Set<ControllerListener>();
  #renderer: NetworkRendererPort | null = null;
  #snapshot: S03RetrievalControllerSnapshot;
  #animationQueue: Promise<void> = Promise.resolve();
  #completionSequenceQueued = false;
  #disposed = false;

  constructor({ animationPlayer, onWarningConfirmed }: S03RetrievalControllerOptions) {
    this.#animationPlayer = animationPlayer;
    this.#onWarningConfirmed = onWarningConfirmed;
    this.#snapshot = {
      network: createS03RetrievalNetwork({
        activeAccountId: s01Content.browser.accounts[0]?.id ?? null,
        retrievalResults: {},
      }),
      presentation: createInitialPresentation(),
      warningState: 'idle',
    };
  }

  getSnapshot = (): S03RetrievalControllerSnapshot => this.#snapshot;

  subscribe = (listener: ControllerListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  attachRenderer(renderer: NetworkRendererPort): void {
    if (this.#disposed) return;
    this.#renderer = renderer;
    renderer.render(this.#snapshot.network);
  }

  synchronize(input: RetrievalSceneInput, completionSequenceActive: boolean): void {
    if (this.#disposed) return;
    const network = createS03RetrievalNetwork(input);
    this.#snapshot = { ...this.#snapshot, network };
    this.#renderer?.render(network);
    this.#emit();

    if (completionSequenceActive && !this.#completionSequenceQueued) {
      this.#completionSequenceQueued = true;
      this.#setWarningState('playing');
      this.#queueAnimation('s03-completion-timeskip', true);
    }
  }

  updatePresentation(presentation: NetworkPresentationSnapshot): void {
    if (this.#disposed || presentation === this.#snapshot.presentation) return;
    this.#snapshot = { ...this.#snapshot, presentation };
    this.#emit();
  }

  confirmWarning(): void {
    if (this.#disposed || this.#snapshot.warningState !== 'ready') return;
    this.#setWarningState('confirmed');
    this.#onWarningConfirmed();
  }

  async dispose(): Promise<void> {
    this.#disposed = true;
    await this.#animationPlayer.cancel();
    this.#listeners.clear();
  }

  #queueAnimation(animationId: string, completesWarningSequence = false): void {
    const animation = getS03Animation(animationId);
    if (animation === undefined) return;
    this.#animationQueue = this.#animationQueue
      .then(async () => {
        const result: AnimationResult = await this.#animationPlayer.play(animation);
        if (this.#disposed || !completesWarningSequence) return;
        const reachedWarningEndScene =
          result.status === 'finished' &&
          this.#snapshot.presentation.announcedMessageId === 's03.campus-board.warning';
        this.#setWarningState(reachedWarningEndScene ? 'ready' : 'failed');
      })
      .catch(() => {
        if (!this.#disposed && completesWarningSequence) this.#setWarningState('failed');
      });
  }

  #setWarningState(warningState: S03RetrievalControllerSnapshot['warningState']): void {
    this.#snapshot = { ...this.#snapshot, warningState };
    this.#emit();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
