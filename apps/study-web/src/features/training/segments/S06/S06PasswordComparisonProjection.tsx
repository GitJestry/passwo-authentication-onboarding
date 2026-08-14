import type { PasswordEvidenceSpan, PasswordRelation, S06AccountId } from '@passwo/contracts';
import { s06ConsequenceContent } from '@passwo/training-content';
import { BugStatusIcon } from '@passwo/ui';
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import passwordFactorShieldAsset from '../../../../assets/s05/password-factor-shield.png';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { PasswordBuildingBlocks } from '../S05/PasswordBuildingBlocks.js';
import styles from './S06PasswordComparisonProjection.module.css';

interface ComparisonPart {
  readonly value: string;
  readonly kind: 'common' | 'variation';
}

interface ProjectionLayout {
  readonly left: number;
  readonly top: number;
  readonly projection: {
    readonly startA: readonly [number, number];
    readonly startB: readonly [number, number];
    readonly endA: readonly [number, number];
    readonly endB: readonly [number, number];
  };
}

interface CoreLink {
  readonly sourceX: number;
  readonly sourceY: number;
  readonly targetX: number;
  readonly targetY: number;
  readonly caseVariation: boolean;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function comparisonPasswordScale(value: string): number {
  const characterCount = Math.max(Array.from(value).length, 1);
  return Math.min(1, 24 / characterCount);
}

function sortedEvidence(evidence: readonly PasswordEvidenceSpan[]): readonly PasswordEvidenceSpan[] {
  return [...evidence].sort((left, right) => left.start - right.start);
}

function pairedComparisonParts(
  sourcePassword: string,
  targetPassword: string,
  relation: PasswordRelation,
): { readonly source: readonly ComparisonPart[]; readonly target: readonly ComparisonPart[] } {
  if (relation.kind === 'exact-match') {
    const part = { value: sourcePassword, kind: 'common' } as const;
    return { source: [part], target: [part] };
  }
  if (relation.kind !== 'derived-variant-match') {
    return {
      source: [{ value: sourcePassword, kind: 'variation' }],
      target: [{ value: targetPassword, kind: 'variation' }],
    };
  }

  const source: ComparisonPart[] = [];
  const target: ComparisonPart[] = [];
  const sourceEvidence = sortedEvidence(relation.sourceEvidence);
  const targetEvidence = sortedEvidence(relation.targetEvidence);
  let sourceCursor = 0;
  let targetCursor = 0;

  for (let index = 0; index < Math.max(sourceEvidence.length, targetEvidence.length); index += 1) {
    const sourceChange = sourceEvidence[index];
    const targetChange = targetEvidence[index];
    if (sourceChange === undefined || targetChange === undefined) continue;
    const sourceCore = sourcePassword.slice(sourceCursor, sourceChange.start);
    const targetCore = targetPassword.slice(targetCursor, targetChange.start);
    if (sourceCore.length > 0 || targetCore.length > 0) {
      const coreIsRelated =
        sourceCore.length > 0 &&
        targetCore.length > 0 &&
        sourceCore.toLocaleLowerCase('de-DE') === targetCore.toLocaleLowerCase('de-DE');
      source.push({
        value: sourceCore,
        kind: coreIsRelated ? 'common' : 'variation',
      });
      target.push({
        value: targetCore,
        kind: coreIsRelated ? 'common' : 'variation',
      });
    }
    const changedIsRelated =
      sourceChange.token.length > 0 &&
      targetChange.token.length > 0 &&
      sourceChange.token.toLocaleLowerCase('de-DE') ===
        targetChange.token.toLocaleLowerCase('de-DE');
    source.push({
      value: sourceChange.token,
      kind: changedIsRelated ? 'common' : 'variation',
    });
    target.push({
      value: targetChange.token,
      kind: changedIsRelated ? 'common' : 'variation',
    });
    sourceCursor = sourceChange.end;
    targetCursor = targetChange.end;
  }

  const sourceTail = sourcePassword.slice(sourceCursor);
  const targetTail = targetPassword.slice(targetCursor);
  if (sourceTail.length > 0 || targetTail.length > 0) {
    const tailIsRelated =
      sourceTail.length > 0 &&
      targetTail.length > 0 &&
      sourceTail.toLocaleLowerCase('de-DE') === targetTail.toLocaleLowerCase('de-DE');
    source.push({
      value: sourceTail,
      kind: tailIsRelated ? 'common' : 'variation',
    });
    target.push({
      value: targetTail,
      kind: tailIsRelated ? 'common' : 'variation',
    });
  }
  return {
    source: source.filter(({ value }) => value.length > 0),
    target: target.filter(({ value }) => value.length > 0),
  };
}

function CommonCoreLinks({ hostRef }: { readonly hostRef: RefObject<HTMLDivElement | null> }) {
  const [links, setLinks] = useState<readonly CoreLink[]>([]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    let frame: number | null = null;
    const update = () => {
      const hostRect = host.getBoundingClientRect();
      const sourceParts = [
        ...host.querySelectorAll<HTMLElement>(
          '[data-comparison-row="source"] [data-categories~="common-components"]',
        ),
      ];
      const targetParts = [
        ...host.querySelectorAll<HTMLElement>(
          '[data-comparison-row="target"] [data-categories~="common-components"]',
        ),
      ];
      setLinks(
        sourceParts.flatMap((sourcePart, index) => {
          const targetPart = targetParts[index];
          if (targetPart === undefined) return [];
          const sourceRect = sourcePart.getBoundingClientRect();
          const targetRect = targetPart.getBoundingClientRect();
          return [
            {
              sourceX: sourceRect.left + sourceRect.width / 2 - hostRect.left,
              sourceY: sourceRect.bottom - hostRect.top,
              targetX: targetRect.left + targetRect.width / 2 - hostRect.left,
              targetY: targetRect.top - hostRect.top,
              caseVariation:
                sourcePart.textContent?.toLocaleLowerCase('de-DE') ===
                  targetPart.textContent?.toLocaleLowerCase('de-DE') &&
                sourcePart.textContent !== targetPart.textContent,
            },
          ];
        }),
      );
    };
    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        update();
      });
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(host);
    schedule();
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [hostRef]);

  return (
    <svg className={styles.coreLinks} aria-hidden="true">
      {links.map((link, index) => (
        <path
          key={`${link.sourceX}-${link.targetX}-${index}`}
          data-case-variation={link.caseVariation || undefined}
          d={`M ${link.sourceX} ${link.sourceY} C ${link.sourceX} ${(link.sourceY + link.targetY) / 2}, ${link.targetX} ${(link.sourceY + link.targetY) / 2}, ${link.targetX} ${link.targetY}`}
        />
      ))}
    </svg>
  );
}

function PreviewAttackPath({
  blocked,
  resultRevealed,
}: {
  readonly blocked: boolean;
  readonly resultRevealed: boolean;
}) {
  return (
    <div
      className={styles.previewAttack}
      data-blocked={blocked || undefined}
      data-result-revealed={resultRevealed || undefined}
      aria-hidden="true"
    >
      <span className={styles.previewAttackLine} />
      <span className={styles.previewBug}>
        <BugStatusIcon />
      </span>
      {blocked && resultRevealed ? (
        <img
          className={styles.previewShield}
          src={passwordFactorShieldAsset}
          alt=""
        />
      ) : null}
    </div>
  );
}

export function S06PasswordComparisonProjection({
  sceneRef,
  networkHostRef,
  sourceAccountId,
  targetAccountId,
  sourcePassword,
  targetPassword,
  relation,
  phase,
  onPreviewComplete,
  onAdvance,
  finishLabel,
  onResolutionComplete,
}: {
  readonly sceneRef: RefObject<HTMLElement | null>;
  readonly networkHostRef: RefObject<HTMLDivElement | null>;
  readonly sourceAccountId: S06AccountId;
  readonly targetAccountId: S06AccountId;
  readonly sourcePassword: string;
  readonly targetPassword: string;
  readonly relation: PasswordRelation;
  readonly phase: 'attacking' | 'preview-ready' | 'resolving';
  readonly onPreviewComplete: () => void;
  readonly onAdvance: () => void;
  readonly finishLabel: string;
  readonly onResolutionComplete: () => void;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const advanceButtonRef = useRef<HTMLButtonElement | null>(null);
  const [layout, setLayout] = useState<ProjectionLayout | null>(null);
  const [resultRevealed, setResultRevealed] = useState(false);
  const [playbackIteration, setPlaybackIteration] = useState(0);
  const [replayInProgress, setReplayInProgress] = useState(false);
  const parts = pairedComparisonParts(sourcePassword, targetPassword, relation);
  const sourceCommonIndices = parts.source.flatMap(({ kind }, index) =>
    kind === 'common' ? [index] : [],
  );
  const targetCommonIndices = parts.target.flatMap(({ kind }, index) =>
    kind === 'common' ? [index] : [],
  );
  const successful = relation.kind !== 'no-derived-path-recognized';

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const frame = requestAnimationFrame(() => {
      setResultRevealed(true);
      if (phase === 'attacking') onPreviewComplete();
      if (phase === 'resolving') onResolutionComplete();
    });
    return () => cancelAnimationFrame(frame);
  }, [onPreviewComplete, onResolutionComplete, phase]);

  useEffect(() => {
    if (phase === 'preview-ready') advanceButtonRef.current?.focus();
  }, [phase]);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const networkHost = networkHostRef.current;
    const card = cardRef.current;
    if (scene === null || networkHost === null || card === null) return;
    let frame: number | null = null;
    const update = () => {
      const sceneRect = scene.getBoundingClientRect();
      const networkRect = networkHost.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const target = networkHost.querySelector<HTMLElement>(
        `[data-scene-node-button="${targetAccountId}"]`,
      );
      if (target === null) return;
      const targetRect = target.getBoundingClientRect();
      const targetX = targetRect.left + targetRect.width / 2 - sceneRect.left;
      const targetY = targetRect.top + targetRect.height / 2 - sceneRect.top;
      const projectsLeft = targetAccountId === 'campusgram';
      const left = clamp(
        projectsLeft
          ? Math.min(sceneRect.width * 0.51 - cardRect.width, targetX - cardRect.width - 82)
          : Math.max(sceneRect.width * 0.49, targetX + 82),
        20,
        Math.max(20, sceneRect.width - cardRect.width - 24),
      );
      const networkBottom = networkRect.bottom - sceneRect.top;
      const top = clamp(
        targetY - cardRect.height / 2,
        20,
        Math.max(20, networkBottom - cardRect.height - 16),
      );
      const cardNearX = projectsLeft ? left + cardRect.width : left;
      const targetEdgeX = targetX + (projectsLeft ? -3 : 3);
      setLayout({
        left,
        top,
        projection: {
          startA: [targetEdgeX, targetY - 5],
          startB: [targetEdgeX, targetY + 5],
          endA: [cardNearX, top + cardRect.height * 0.22],
          endB: [cardNearX, top + cardRect.height * 0.78],
        },
      });
    };
    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        update();
      });
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(scene);
    observer.observe(card);
    schedule();
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [networkHostRef, sceneRef, targetAccountId]);

  const replayPreview = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setResultRevealed(true);
      setPlaybackIteration((iteration) => iteration + 1);
      return;
    }
    setResultRevealed(false);
    setReplayInProgress(true);
    setPlaybackIteration((iteration) => iteration + 1);
  };

  const projectionStyle = {
    left: layout?.left ?? 20,
    top: layout?.top ?? 20,
  } satisfies CSSProperties;
  return (
    <div
      className={styles.layer}
      data-positioned={layout !== null || undefined}
      data-relation={relation.kind}
      data-phase={phase}
      data-result-revealed={resultRevealed || undefined}
    >
      {layout === null ? null : (
        <svg className={styles.projection} aria-hidden="true">
          <polygon
            points={`${layout.projection.startA.join(',')} ${layout.projection.endA.join(',')} ${layout.projection.endB.join(',')} ${layout.projection.startB.join(',')}`}
          />
          <line
            x1={layout.projection.startA[0]}
            y1={layout.projection.startA[1]}
            x2={layout.projection.endA[0]}
            y2={layout.projection.endA[1]}
          />
          <line
            x1={layout.projection.startB[0]}
            y1={layout.projection.startB[1]}
            x2={layout.projection.endB[0]}
            y2={layout.projection.endB[1]}
          />
        </svg>
      )}
      <div className={styles.preview} style={projectionStyle}>
        <div
          ref={cardRef}
          className={styles.card}
          aria-label={s06ConsequenceContent.relationLabels[relation.kind]}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && phase === 'resolving') {
              onResolutionComplete();
            }
          }}
        >
          <Fragment key={playbackIteration}>
            <CommonCoreLinks hostRef={cardRef} />
            <div className={styles.comparisonGrid}>
              <PreviewAttackPath blocked={!successful} resultRevealed={resultRevealed} />
              <span className={styles.accountSymbol} data-attack-symbol="source" aria-hidden="true">
                <NetworkSymbol symbolId={sourceAccountId} />
              </span>
              <div className={styles.passwordRow} data-comparison-row="source">
                <PasswordBuildingBlocks
                  value={sourcePassword}
                  parts={parts.source.map(({ value }) => value)}
                  display="decomposed"
                  appearance="analysis"
                  animate
                  visualScale={comparisonPasswordScale(sourcePassword)}
                  highlightedIndices={sourceCommonIndices}
                  categoryIds={parts.source.map(({ kind }) =>
                    kind === 'common' ? ['common-components'] : [],
                  )}
                  ariaLabel={`${s06ConsequenceContent.accounts[sourceAccountId].label}: ${sourcePassword}`}
                />
              </div>
              <span className={styles.accountSymbol} data-attack-symbol="target" aria-hidden="true">
                <NetworkSymbol symbolId={targetAccountId} />
              </span>
              <div className={styles.passwordRow} data-comparison-row="target">
                <PasswordBuildingBlocks
                  value={targetPassword}
                  parts={parts.target.map(({ value }) => value)}
                  display="decomposed"
                  appearance="analysis"
                  animate
                  visualScale={comparisonPasswordScale(targetPassword)}
                  highlightedIndices={targetCommonIndices}
                  categoryIds={parts.target.map(({ kind }) =>
                    kind === 'common' ? ['common-components'] : [],
                  )}
                  ariaLabel={`${s06ConsequenceContent.accounts[targetAccountId].label}: ${targetPassword}`}
                />
              </div>
            </div>
            <strong
              className={styles.result}
              role={resultRevealed ? 'status' : undefined}
              aria-hidden={resultRevealed ? undefined : true}
              onAnimationStart={(event) => {
                if (event.target === event.currentTarget) {
                  setResultRevealed(true);
                }
              }}
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) {
                  if (phase === 'attacking') onPreviewComplete();
                  if (replayInProgress) setReplayInProgress(false);
                }
              }}
            >
              {s06ConsequenceContent.comparisonResultLabels[relation.kind]}
            </strong>
          </Fragment>
        </div>
        {phase === 'preview-ready' ? (
          <footer className={styles.previewFooter}>
            <button
              type="button"
              className={styles.previewReplayButton}
              disabled={replayInProgress}
              onClick={replayPreview}
            >
              {s06ConsequenceContent.page.replay}
              <span aria-hidden="true">↻</span>
            </button>
            <button
              ref={advanceButtonRef}
              type="button"
              className={styles.previewAdvanceButton}
              disabled={replayInProgress}
              onClick={onAdvance}
            >
              {finishLabel}
              <span aria-hidden="true">{finishLabel === s06ConsequenceContent.page.finish ? '✓' : '→'}</span>
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
