import {
  type S01AccountId,
  type S03RetrievalResult,
  s01Content,
  s02Content,
  s03Content,
} from '@passwo/training-content';
import type {
  NetworkRendererPort,
  NetworkSceneSnapshot,
  SceneEdge,
  SceneNode,
} from '@passwo/visualization';
type ControllerListener = (snapshot: S03RetrievalControllerSnapshot) => void;

export interface S03RetrievalControllerSnapshot {
  readonly network: NetworkSceneSnapshot;
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

export class S03RetrievalController {
  readonly #listeners = new Set<ControllerListener>();
  #renderer: NetworkRendererPort | null = null;
  #snapshot: S03RetrievalControllerSnapshot;
  #disposed = false;

  constructor() {
    this.#snapshot = {
      network: createS03RetrievalNetwork({
        activeAccountId: s01Content.browser.accounts[0]?.id ?? null,
        retrievalResults: {},
      }),
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

  synchronize(input: RetrievalSceneInput): void {
    if (this.#disposed) return;
    const network = createS03RetrievalNetwork(input);
    this.#snapshot = { ...this.#snapshot, network };
    this.#renderer?.render(network);
    this.#emit();
  }

  dispose(): void {
    this.#disposed = true;
    this.#listeners.clear();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
