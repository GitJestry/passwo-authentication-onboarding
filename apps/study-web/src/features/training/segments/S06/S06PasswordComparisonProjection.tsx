import type {
  PasswordRelation,
  PasswordTransformationStep,
  S06AccountId,
} from '@passwo/contracts';
import { s06ConsequenceContent } from '@passwo/training-content';
import { BugStatusIcon } from '@passwo/ui';
import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import comparisonPathShieldAsset from '../../../../assets/s06/comparison-path-shield.webp';
import samePasswordAsset from '../../../../assets/password-relations/same.png';
import similarPasswordAsset from '../../../../assets/password-relations/similar.png';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import styles from './S06PasswordComparisonProjection.module.css';

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

interface PasswordDisplaySegment {
  readonly id: string;
  readonly value: string;
  readonly kind: 'unchanged' | 'changed' | 'empty' | 'neutral';
  readonly stepIndex: number | null;
}

interface TransformationLink {
  readonly stepIndex: number;
  readonly path: string;
}

type ComparisonAnimationStyle = CSSProperties & {
  readonly '--comparison-step-delay'?: string;
  readonly '--comparison-result-delay'?: string;
};

type PasswordSequenceStyle = CSSProperties & {
  readonly '--password-character-size': string;
};

const firstStepDelayMs = 1_180;
const stepIntervalMs = 560;
const stepAnimationDurationMs = 380;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function layoutOffsetWithin(
  element: HTMLElement,
  ancestor: HTMLElement,
): { readonly left: number; readonly top: number } | null {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;
  while (current !== null && current !== ancestor) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent instanceof HTMLElement ? current.offsetParent : null;
  }
  return current === ancestor ? { left, top } : null;
}

function stepDelay(index: number): number {
  return firstStepDelayMs + index * stepIntervalMs;
}

function completedPathDelay(stepCount: number): number {
  return stepDelay(Math.max(0, stepCount - 1)) + stepAnimationDurationMs + 320;
}

function timedStepStyle(index: number): ComparisonAnimationStyle {
  return { '--comparison-step-delay': `${stepDelay(index)}ms` };
}

function displayToken(value: string): string {
  return value.length === 0 ? s06ConsequenceContent.comparisonPathLabels.emptyValue : value;
}

function passwordCharacterSize(visualUnitCount: number): string {
  const scale = clamp(24 / Math.max(1, visualUnitCount), 0.58, 1);
  return `${5 * scale}cqi`;
}

function orderedStepEvidence(
  steps: readonly PasswordTransformationStep[],
  side: 'source' | 'target',
): readonly {
  readonly step: PasswordTransformationStep;
  readonly stepIndex: number;
}[] {
  return steps
    .map((step, stepIndex) => ({ step, stepIndex }))
    .sort((left, right) => {
      const leftEvidence =
        side === 'source' ? left.step.sourceEvidence : left.step.targetEvidence;
      const rightEvidence =
        side === 'source' ? right.step.sourceEvidence : right.step.targetEvidence;
      return (
        leftEvidence.start - rightEvidence.start ||
        leftEvidence.end - rightEvidence.end ||
        left.stepIndex - right.stepIndex
      );
    });
}

function passwordDisplaySegments(
  password: string,
  relation: PasswordRelation,
  side: 'source' | 'target',
): readonly PasswordDisplaySegment[] {
  if (relation.kind === 'exact-match') {
    return [
      {
        id: `${side}:exact`,
        value: password,
        kind: 'unchanged',
        stepIndex: null,
      },
    ];
  }
  if (relation.kind !== 'derived-variant-match') {
    return [
      {
        id: `${side}:neutral`,
        value: password,
        kind: 'neutral',
        stepIndex: null,
      },
    ];
  }

  const segments: PasswordDisplaySegment[] = [];
  let cursor = 0;
  for (const { step, stepIndex } of orderedStepEvidence(relation.steps, side)) {
    const evidence = side === 'source' ? step.sourceEvidence : step.targetEvidence;
    if (evidence.start > cursor) {
      segments.push({
        id: `${side}:unchanged:${cursor}-${evidence.start}`,
        value: password.slice(cursor, evidence.start),
        kind: 'unchanged',
        stepIndex: null,
      });
    }
    segments.push({
      id: `${side}:changed:${step.id}`,
      value: displayToken(evidence.token),
      kind: evidence.start === evidence.end ? 'empty' : 'changed',
      stepIndex,
    });
    cursor = Math.max(cursor, evidence.end);
  }
  if (cursor < password.length) {
    segments.push({
      id: `${side}:unchanged:${cursor}-${password.length}`,
      value: password.slice(cursor),
      kind: 'unchanged',
      stepIndex: null,
    });
  }
  return segments;
}

function PasswordRelationSequence({
  accountId,
  password,
  relation,
  side,
}: {
  readonly accountId: S06AccountId;
  readonly password: string;
  readonly relation: PasswordRelation;
  readonly side: 'source' | 'target';
}) {
  const segments = passwordDisplaySegments(password, relation, side);
  const sequenceStyle: PasswordSequenceStyle = {
    '--password-character-size': passwordCharacterSize(
      password.length + Math.max(0, segments.length - 1) * 2,
    ),
  };
  return (
    <div
      className={styles.passwordRow}
      data-comparison-row={side}
      data-relation={relation.kind}
    >
      <code
        className={styles.passwordSequence}
        style={sequenceStyle}
        aria-label={`${s06ConsequenceContent.accounts[accountId].label}: ${password}`}
      >
        {segments.map((segment) => (
          <span
            key={segment.id}
            className={styles.passwordSegment}
            data-kind={segment.kind}
            data-step-index={segment.stepIndex ?? undefined}
            style={segment.stepIndex === null ? undefined : timedStepStyle(segment.stepIndex)}
            aria-hidden="true"
          >
            {segment.value}
          </span>
        ))}
      </code>
    </div>
  );
}

function transformationSummary(
  sourcePassword: string,
  targetPassword: string,
  relation: PasswordRelation,
): string {
  if (relation.kind === 'exact-match') {
    return `Die Passwörter „${sourcePassword}“ und „${targetPassword}“ sind identisch.`;
  }
  if (relation.kind === 'no-derived-path-recognized') {
    return `Zwischen „${sourcePassword}“ und „${targetPassword}“ wurde innerhalb der festgelegten Grenzen kein leichter Abwandlungsweg erkannt.`;
  }
  const changes = relation.steps
    .map((step) => {
      const label = s06ConsequenceContent.transformationStepLabels[step.kind];
      return `„${displayToken(step.sourceEvidence.token)}“ wird zu „${displayToken(step.targetEvidence.token)}“: ${label}. Danach lautet der Kandidat „${step.resultingCandidate}“`;
    })
    .join('; ');
  return `Aus „${sourcePassword}“ wird „${targetPassword}“. ${changes}.`;
}

function TransformationLinks({
  relation,
}: {
  readonly relation: PasswordRelation;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [links, setLinks] = useState<readonly TransformationLink[]>([]);
  const markerId = `comparison-arrow-${useId().replaceAll(':', '')}`;

  useLayoutEffect(() => {
    const host = svgRef.current?.parentElement;
    if (
      host === null ||
      host === undefined ||
      relation.kind === 'no-derived-path-recognized'
    ) {
      return;
    }
    let frame: number | null = null;
    const update = () => {
      const stepIndexes =
        relation.kind === 'derived-variant-match'
          ? relation.steps.map((_, stepIndex) => stepIndex)
          : [0];
      setLinks(
        stepIndexes.flatMap((stepIndex) => {
          const segmentSelector =
            relation.kind === 'exact-match'
              ? `.${styles.passwordSegment}`
              : `[data-step-index="${stepIndex}"]`;
          const sourceSegment = host.querySelector<HTMLElement>(
            `[data-comparison-row="source"] ${segmentSelector}`,
          );
          const targetSegment = host.querySelector<HTMLElement>(
            `[data-comparison-row="target"] ${segmentSelector}`,
          );
          if (sourceSegment === null || targetSegment === null) return [];
          const sourceOffset = layoutOffsetWithin(sourceSegment, host);
          const targetOffset = layoutOffsetWithin(targetSegment, host);
          if (sourceOffset === null || targetOffset === null) return [];
          const sourceX = sourceOffset.left + sourceSegment.offsetWidth / 2;
          const sourceY = sourceOffset.top + sourceSegment.offsetHeight;
          const targetX = targetOffset.left + targetSegment.offsetWidth / 2;
          const targetY = targetOffset.top;
          const controlY = sourceY + (targetY - sourceY) / 2;
          return [
            {
              stepIndex,
              path: `M ${sourceX} ${sourceY} C ${sourceX} ${controlY}, ${targetX} ${controlY}, ${targetX} ${targetY}`,
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
  }, [relation]);

  return (
    <svg ref={svgRef} className={styles.transformationLinks} aria-hidden="true">
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 8 4 L 0 8 Z" />
        </marker>
      </defs>
      {links.map((link) => (
        <g
          key={link.stepIndex}
          data-step-index={link.stepIndex}
          style={timedStepStyle(link.stepIndex)}
        >
          <path d={link.path} pathLength="1" markerEnd={`url(#${markerId})`} />
        </g>
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
          src={comparisonPathShieldAsset}
          width={512}
          height={768}
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
  const [resultVisible, setResultVisible] = useState(false);
  const [resultRevealed, setResultRevealed] = useState(false);
  const [playbackIteration, setPlaybackIteration] = useState(0);
  const [replayInProgress, setReplayInProgress] = useState(false);
  const successful = relation.kind !== 'no-derived-path-recognized';
  const relationLogoAsset =
    relation.kind === 'exact-match'
      ? samePasswordAsset
      : relation.kind === 'derived-variant-match'
        ? similarPasswordAsset
        : null;
  const resultDelayMs =
    relation.kind === 'derived-variant-match'
      ? completedPathDelay(relation.steps.length)
      : relation.kind === 'exact-match'
        ? 1_850
        : 1_450;
  const cardStyle = {
    '--comparison-result-delay': `${resultDelayMs}ms`,
  } as ComparisonAnimationStyle;

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const frame = requestAnimationFrame(() => {
      setResultVisible(true);
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
      // The entry animation scales the card visually. Layout must use its untransformed border box,
      // otherwise the final full-size card can extend beyond the scene after the animation settles.
      const cardWidth = card.offsetWidth;
      const cardHeight = card.offsetHeight;
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
          ? Math.min(sceneRect.width * 0.51 - cardWidth, targetX - cardWidth - 82)
          : Math.max(sceneRect.width * 0.49, targetX + 82),
        20,
        Math.max(20, sceneRect.width - cardWidth - 24),
      );
      const networkBottom = networkRect.bottom - sceneRect.top;
      const top = clamp(
        targetY - cardHeight / 2,
        20,
        Math.max(20, networkBottom - cardHeight - 16),
      );
      const cardNearX = projectsLeft ? left + cardWidth : left;
      const targetEdgeX = targetX + (projectsLeft ? -3 : 3);
      setLayout({
        left,
        top,
        projection: {
          startA: [targetEdgeX, targetY - 5],
          startB: [targetEdgeX, targetY + 5],
          endA: [cardNearX, top + cardHeight * 0.22],
          endB: [cardNearX, top + cardHeight * 0.78],
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
      setResultVisible(true);
      setResultRevealed(true);
      setPlaybackIteration((iteration) => iteration + 1);
      return;
    }
    setResultVisible(false);
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
          style={cardStyle}
          role="group"
          aria-label={transformationSummary(sourcePassword, targetPassword, relation)}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && phase === 'resolving') {
              onResolutionComplete();
            }
          }}
        >
          <Fragment key={playbackIteration}>
            {successful ? <TransformationLinks relation={relation} /> : null}
            <div className={styles.comparisonGrid}>
              <PreviewAttackPath blocked={!successful} resultRevealed={resultRevealed} />
              <span className={styles.accountSymbol} data-attack-symbol="source" aria-hidden="true">
                <NetworkSymbol symbolId={sourceAccountId} />
              </span>
              <PasswordRelationSequence
                accountId={sourceAccountId}
                password={sourcePassword}
                relation={relation}
                side="source"
              />
              <span className={styles.accountSymbol} data-attack-symbol="target" aria-hidden="true">
                <NetworkSymbol symbolId={targetAccountId} />
              </span>
              <PasswordRelationSequence
                accountId={targetAccountId}
                password={targetPassword}
                relation={relation}
                side="target"
              />
            </div>
            <strong
              className={styles.result}
              role={resultVisible ? 'status' : undefined}
              aria-hidden={resultVisible ? undefined : true}
              onAnimationStart={(event) => {
                if (event.target === event.currentTarget) setResultVisible(true);
              }}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) return;
                setResultRevealed(true);
                if (phase === 'attacking') onPreviewComplete();
                if (replayInProgress) setReplayInProgress(false);
              }}
            >
              {relationLogoAsset === null ? null : (
                <img
                  className={styles.resultLogo}
                  src={relationLogoAsset}
                  width={512}
                  height={512}
                  alt=""
                  aria-hidden="true"
                />
              )}
              <span>{s06ConsequenceContent.comparisonResultLabels[relation.kind]}</span>
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
              <span aria-hidden="true">
                {finishLabel === s06ConsequenceContent.page.finish ? '✓' : '→'}
              </span>
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
