import { getS02CampusIdAnimation, s02CampusIdContent } from '@passwo/training-content';
import type { AnimationPlayerPort } from '@passwo/training-engine';
import { BrowserShell, type BrowserShellSnapshot } from '@passwo/ui';
import {
  type AccountServiceSceneEvent,
  createAccountServiceScene,
  transitionAccountServiceScene,
} from '@passwo/visualization';
import { type RefObject, useEffect, useRef, useState } from 'react';
import {
  createInitialNetworkPresentation,
  NetworkMotionAdapter,
  type NetworkPresentationSnapshot,
} from '../../../../adapters/network/NetworkMotionAdapter.js';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import styles from './S02CampusIdTraining.module.css';

const definition = s02CampusIdContent.scene;

const browserSnapshot: BrowserShellSnapshot = {
  tabs: [s02CampusIdContent.browser.tab],
  activeTabId: s02CampusIdContent.browser.tab.id,
  address: s02CampusIdContent.browser.address,
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function PassWoNetworkGuide({
  presentation,
  characterRef,
}: {
  readonly presentation: NetworkPresentationSnapshot;
  readonly characterRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={characterRef}
      className={styles.passWo}
      data-placement={presentation.character.placement}
      data-pose={presentation.character.pose}
      role="img"
      aria-label={`PassWo bei CampusID, Pose ${presentation.character.pose}`}
    >
      <span className={styles.passWoFace} aria-hidden="true">
        PW
      </span>
      <span className={styles.passWoLabel} aria-hidden="true">
        PassWo
      </span>
    </div>
  );
}

export function S02CampusIdTraining() {
  const initialScene = createAccountServiceScene(definition);
  const [scene, setScene] = useState(initialScene);
  const sceneRef = useRef(initialScene);
  const [presentation, setPresentation] = useState(() =>
    createInitialNetworkPresentation(definition.account.id),
  );
  const [renderer] = useState(() => new ReactFlowNetworkAdapter(initialScene.network));
  const animationPlayerRef = useRef<AnimationPlayerPort | null>(null);
  const dispatchRef = useRef<(event: AccountServiceSceneEvent) => void>(() => undefined);
  const characterRef = useRef<HTMLDivElement | null>(null);
  const networkHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const animationPlayer = new NetworkMotionAdapter({
      initialNodeId: definition.account.id,
      applySnapshot: setPresentation,
      getCharacterElement: () => characterRef.current,
      getNodeElement: (nodeId) =>
        networkHostRef.current?.querySelector<HTMLElement>(
          `[data-scene-node-button="${nodeId}"]`,
        ) ?? null,
      prefersReducedMotion,
    });
    animationPlayerRef.current = animationPlayer;

    return () => {
      if (animationPlayerRef.current === animationPlayer) animationPlayerRef.current = null;
      void animationPlayer.cancel();
    };
  }, []);

  function dispatchSceneEvent(event: AccountServiceSceneEvent): void {
    const transition = transitionAccountServiceScene(definition, sceneRef.current, event);
    if (transition.snapshot !== sceneRef.current) {
      sceneRef.current = transition.snapshot;
      setScene(transition.snapshot);
      renderer.render(transition.snapshot.network);
    }

    for (const effect of transition.effects) {
      if (effect.type === 'focus-node') {
        renderer.focusNode(effect.nodeId);
        continue;
      }

      const animation = getS02CampusIdAnimation(effect.animationId);
      const animationPlayer = animationPlayerRef.current;
      if (animation === undefined || animationPlayer === null) continue;

      void animationPlayer.play(animation).then(() => {
        if (animationPlayerRef.current !== animationPlayer) return;
        dispatchRef.current({
          type: 'animation-settled',
          animationId: effect.animationId,
        });
      });
    }
  }
  dispatchRef.current = dispatchSceneEvent;

  const activePreview = s02CampusIdContent.scene.services.find(
    ({ id }) => id === scene.activePreviewServiceId,
  );
  const narration = s02CampusIdContent.narration.messages[scene.narrationId] ?? '';
  const animationAnnouncement =
    presentation.announcedMessageId === null
      ? ''
      : (s02CampusIdContent.narration.messages[presentation.announcedMessageId] ?? '');

  return (
    <section className={styles.training} aria-label={s02CampusIdContent.trainingAriaLabel}>
      <BrowserShell
        snapshot={browserSnapshot}
        ariaLabel={s02CampusIdContent.browser.ariaLabel}
        onTabSelect={() => undefined}
      >
        <article className={styles.page} aria-labelledby="s02-campus-id-title">
          <header className={styles.pageHeader}>
            <div>
              <p className={styles.eyebrow}>{s02CampusIdContent.page.eyebrow}</p>
              <h1 id="s02-campus-id-title">{s02CampusIdContent.page.title}</h1>
              <p className={styles.pageInstruction}>{s02CampusIdContent.page.instruction}</p>
            </div>
            <div className={styles.progressBlock}>
              <strong>
                {scene.openedServiceIds.length} / {definition.services.length}
              </strong>
              <span>{s02CampusIdContent.page.progressLabel}</span>
              <progress
                max={definition.services.length}
                value={scene.openedServiceIds.length}
                aria-label={`${scene.openedServiceIds.length} von ${definition.services.length} Vorschauen geöffnet`}
              />
            </div>
          </header>

          <div className={styles.workspace}>
            <div ref={networkHostRef} className={styles.networkPanel}>
              <ReactFlowNetwork
                adapter={renderer}
                presentation={presentation}
                onNodeSelect={(nodeId) =>
                  dispatchSceneEvent({
                    type: 'node-selected',
                    nodeId,
                  })
                }
              />
              <PassWoNetworkGuide presentation={presentation} characterRef={characterRef} />
            </div>

            <aside className={styles.sidebar} aria-label="CampusID-Erklärung und Vorschau">
              <section className={styles.narration} aria-labelledby="s02-passwo-title">
                <p className={styles.cardLabel}>{s02CampusIdContent.narration.guideName}</p>
                <h2 id="s02-passwo-title">Ein Konto, mehrere Dienste</h2>
                <p>{narration}</p>
              </section>

              {scene.phase === 'understood' ? (
                <p className={styles.completion} role="status">
                  <span aria-hidden="true">✓</span>
                  {s02CampusIdContent.page.completion}
                </p>
              ) : null}

              <section className={styles.preview} aria-labelledby="s02-preview-title">
                <p className={styles.cardLabel}>{s02CampusIdContent.page.previewTitle}</p>
                <h2 id="s02-preview-title">
                  {activePreview?.label ?? 'Noch keine Vorschau geöffnet'}
                </h2>
                <p>
                  {activePreview?.preview ??
                    (scene.phase === 'locked' || scene.phase === 'opening-account'
                      ? s02CampusIdContent.page.previewLocked
                      : s02CampusIdContent.page.previewEmpty)}
                </p>
              </section>
            </aside>
          </div>
          <p className={styles.screenReaderOnly} aria-live="polite" aria-atomic="true">
            {animationAnnouncement}
          </p>
        </article>
      </BrowserShell>
    </section>
  );
}
