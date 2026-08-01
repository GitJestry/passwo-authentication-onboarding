import type {
  S07RecommendationProjection,
  S07RecommendationProjectionInput,
} from '@passwo/contracts';
import { projectS07Recommendations } from '@passwo/password-analysis';
import {
  type S07AccountCardDefinition,
  type S07AccountCardModel,
  type S07CardDeckModel,
  projectS07CardDeck,
} from '@passwo/visualization';

export interface S07EvaluationControllerSnapshot {
  readonly phase: 'account-card' | 'summary' | 'complete';
  readonly cardIndex: number;
  readonly currentCard: S07AccountCardModel | null;
  readonly viewedCardCount: number;
  readonly deck: S07CardDeckModel;
  readonly controls: {
    readonly canContinue: boolean;
    readonly canComplete: boolean;
  };
}

export interface S07EvaluationControllerOptions {
  readonly input: S07RecommendationProjectionInput;
  readonly accountDefinitions: readonly S07AccountCardDefinition[];
  readonly onProjectionReady?: (projection: S07RecommendationProjection) => void;
  readonly onComplete?: () => void;
}

type Listener = (snapshot: S07EvaluationControllerSnapshot) => void;

export class S07EvaluationController {
  readonly #listeners = new Set<Listener>();
  readonly #onComplete: () => void;
  #projection: S07RecommendationProjection | null;
  #snapshot: S07EvaluationControllerSnapshot;
  #disposed = false;

  constructor({ input, accountDefinitions, onProjectionReady, onComplete }: S07EvaluationControllerOptions) {
    const projection = projectS07Recommendations(input);
    const deck = projectS07CardDeck(projection, accountDefinitions);
    const firstCard = deck.cards[0];
    if (firstCard === undefined) throw new Error('S07 card deck is empty.');
    this.#projection = projection;
    this.#onComplete = onComplete ?? (() => undefined);
    this.#snapshot = {
      phase: 'account-card',
      cardIndex: 0,
      currentCard: firstCard,
      viewedCardCount: 1,
      deck,
      controls: { canContinue: true, canComplete: false },
    };
    onProjectionReady?.(projection);
  }

  getSnapshot = (): S07EvaluationControllerSnapshot => this.#snapshot;

  subscribe = (listener: Listener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  continue(): void {
    if (this.#disposed || !this.#snapshot.controls.canContinue) return;
    const nextIndex = this.#snapshot.cardIndex + 1;
    const nextCard = this.#snapshot.deck.cards[nextIndex];
    if (nextCard !== undefined) {
      this.#snapshot = {
        ...this.#snapshot,
        cardIndex: nextIndex,
        currentCard: nextCard,
        viewedCardCount: nextIndex + 1,
      };
    } else {
      this.#snapshot = {
        ...this.#snapshot,
        phase: 'summary',
        currentCard: null,
        controls: { canContinue: false, canComplete: true },
      };
    }
    this.#emit();
  }

  complete(): void {
    if (this.#disposed || !this.#snapshot.controls.canComplete || this.#projection === null) return;
    this.#snapshot = {
      ...this.#snapshot,
      phase: 'complete',
      controls: { canContinue: false, canComplete: false },
    };
    this.#emit();
    this.#onComplete();
  }

  dispose(): void {
    this.#disposed = true;
    this.#projection = null;
    this.#listeners.clear();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#snapshot);
  }
}
