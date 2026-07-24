import type { CharacterRendererPort, CharacterRendererState } from '@passwo/training-engine';
import { type RefObject, useSyncExternalStore } from 'react';
import styles from './PassWoCharacterAdapter.module.css';

const hiddenCharacterState: CharacterRendererState = {
  pose: 'neutral',
  placement: 'offscreen-right',
  visible: false,
  movementTarget: null,
};

export function toCharacterRendererState(
  character: Pick<CharacterRendererState, 'pose' | 'placement'>,
  movementTarget: string | null = null,
): CharacterRendererState {
  return { ...character, visible: true, movementTarget };
}

export function characterObscuresStage(state: CharacterRendererState): boolean {
  return state.visible && state.placement !== 'bottom-left';
}

export class PassWoCharacterRenderer implements CharacterRendererPort {
  #state: CharacterRendererState;
  readonly #listeners = new Set<() => void>();

  constructor(initialState: CharacterRendererState = hiddenCharacterState) {
    this.#state = initialState;
  }

  render(state: CharacterRendererState): void {
    if (
      this.#state.pose === state.pose &&
      this.#state.placement === state.placement &&
      this.#state.visible === state.visible &&
      this.#state.movementTarget === state.movementTarget
    ) {
      return;
    }
    this.#state = state;
    for (const listener of this.#listeners) listener();
  }

  getSnapshot = (): CharacterRendererState => this.#state;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };
}

function useCharacterState(renderer: PassWoCharacterRenderer): CharacterRendererState {
  return useSyncExternalStore(renderer.subscribe, renderer.getSnapshot, renderer.getSnapshot);
}

function stateAttributes(state: CharacterRendererState) {
  return {
    'data-placement': state.placement,
    'data-pose': state.pose,
    'data-visible': state.visible,
    ...(state.movementTarget === null ? {} : { 'data-movement-target': state.movementTarget }),
  };
}

export interface PassWoGuideCharacterProps {
  readonly renderer: PassWoCharacterRenderer;
  readonly characterRef: RefObject<HTMLButtonElement | null>;
  readonly guideOpen: boolean;
  readonly onToggle: () => void;
  readonly openLabel: string;
  readonly closeLabel: string;
  readonly controlsId: string;
  readonly guideName: string;
}

export function PassWoGuideCharacter({
  renderer,
  characterRef,
  guideOpen,
  onToggle,
  openLabel,
  closeLabel,
  controlsId,
  guideName,
}: PassWoGuideCharacterProps) {
  const state = useCharacterState(renderer);
  const interactive = state.visible && state.placement === 'bottom-left';

  return (
    <div className={styles.studyGuide} {...stateAttributes(state)}>
      <button
        ref={characterRef}
        className={styles.studyGuideButton}
        type="button"
        disabled={!interactive}
        aria-expanded={guideOpen}
        aria-controls={guideOpen ? controlsId : undefined}
        aria-label={guideOpen ? closeLabel : openLabel}
        onClick={onToggle}
      >
        <span className={styles.guideHalo} aria-hidden="true" />
        <span className={styles.guideFace} aria-hidden="true">
          PW
        </span>
        <span className={styles.guideBody} aria-hidden="true">
          <strong>{guideName}</strong>
        </span>
      </button>
    </div>
  );
}

export interface PassWoNetworkCharacterProps {
  readonly renderer: PassWoCharacterRenderer;
  readonly characterRef: RefObject<HTMLDivElement | null>;
}

export function PassWoNetworkCharacter({ renderer, characterRef }: PassWoNetworkCharacterProps) {
  const state = useCharacterState(renderer);

  return (
    <div
      ref={characterRef}
      className={styles.networkGuide}
      {...stateAttributes(state)}
      role="img"
      aria-label={`PassWo bei CampusID, Pose ${state.pose}`}
    >
      <span className={styles.networkGuideFace} aria-hidden="true">
        PW
      </span>
      <span className={styles.networkGuideLabel} aria-hidden="true">
        PassWo
      </span>
    </div>
  );
}
