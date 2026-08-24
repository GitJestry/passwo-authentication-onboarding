import type { PasswordRelation, S06AccountId } from '@passwo/contracts';
import { s06ConsequenceContent } from '@passwo/training-content';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import { useCallback, useMemo, type CSSProperties } from 'react';
import attackerAsset from '../../../assets/passwo/attacker.webp';
import passwordFactorShieldAsset from '../../../assets/s05/password-factor-shield.webp';
import comparisonPathShieldAsset from '../../../assets/s06/comparison-path-shield.webp';
import type { NetworkPresentationSnapshot } from '../../../adapters/network/NetworkMotionAdapter.js';
import { CelebrationConfetti } from '../CelebrationConfetti.js';
import {
  ReactFlowNetwork,
  type ReactFlowNetworkAdapter,
} from '../../../adapters/network/ReactFlowNetworkAdapter.js';
import styles from './AccountAssessmentNetwork.module.css';

export type AccountComparisonResults = Readonly<
  Partial<Record<string, PasswordRelation['kind']>>
>;

const emptyComparisonResults: AccountComparisonResults = {};
const emptyEdgeRevealDelaysMs: Readonly<Partial<Record<string, number>>> = {};
const emptyNodeActionLabels: Readonly<Partial<Record<S06AccountId, string>>> = {};

function ignoreNodeSelect(_nodeId: string): void {}

function actionLabelForNode(
  nodeId: string,
  labels: Readonly<Partial<Record<S06AccountId, string>>>,
): string | null {
  if (nodeId === 'campusgram' || nodeId === 'master-campus' || nodeId === 'campus-email') {
    return labels[nodeId] ?? null;
  }
  return null;
}

function AccountStatusOverlay({
  node,
  attackerRole,
  attackerAttemptStatus,
  comparisonResult,
  comparisonResultAriaHidden,
  comparisonResultRevealIndex,
  compactComparisonResult,
  actionLabel,
  celebrate,
  showAccountShield,
  shieldAsset,
}: {
  readonly node: NetworkSceneSnapshot['nodes'][number];
  readonly attackerRole: 'active' | 'departing' | null;
  readonly attackerAttemptStatus: NetworkSceneSnapshot['nodes'][number]['status'] | null;
  readonly comparisonResult: PasswordRelation['kind'] | null;
  readonly comparisonResultAriaHidden: boolean;
  readonly comparisonResultRevealIndex: number | null;
  readonly compactComparisonResult: boolean;
  readonly actionLabel: string | null;
  readonly celebrate: boolean;
  readonly showAccountShield: boolean;
  readonly shieldAsset: string;
}) {
  const showsShield =
    showAccountShield && node.status === 'protected' && node.kind !== 'shield';
  const showsComparisonPathShield =
    node.status === 'protected' && node.symbolId === 'comparison-path-shield';
  const attackerStatus = attackerAttemptStatus ?? node.status;
  if (
    attackerRole === null &&
    !showsShield &&
    !showsComparisonPathShield &&
    comparisonResult === null &&
    actionLabel === null &&
    !celebrate
  ) {
    return null;
  }

  return (
    <>
      {attackerRole === null ? null : (
        <span
          key={`${node.id}-${attackerRole}-${attackerStatus}`}
          className={styles.attackAttempt}
          data-account-attack-attempt={attackerStatus}
          data-account-attack-source={node.id}
          data-account-attacker-role={attackerRole}
          aria-hidden="true"
        >
          <span className={styles.attackConnection} />
          <span className={styles.attacker} data-account-attacker>
            <strong className={styles.attackerLabel}>
              {s06ConsequenceContent.page.dataLeak}
            </strong>
            <img src={attackerAsset} width={1024} height={1024} alt="" />
          </span>
        </span>
      )}
      {showsShield ? (
        <img
          className={styles.shield}
          data-account-shield
          data-main={node.kind === 'account' || undefined}
          src={shieldAsset}
          width={512}
          height={768}
          alt=""
          aria-hidden="true"
        />
      ) : null}
      {showsComparisonPathShield ? (
        <img
          className={styles.comparisonPathShield}
          data-comparison-path-shield
          src={comparisonPathShieldAsset}
          width={512}
          height={768}
          alt=""
          aria-hidden="true"
        />
      ) : null}
      {comparisonResult === null ? null : (
        <strong
          className={styles.comparisonResult}
          data-comparison-result={comparisonResult}
          data-comparison-result-compact={compactComparisonResult || undefined}
          data-comparison-result-reveal={
            comparisonResultRevealIndex === null ? undefined : true
          }
          aria-hidden={comparisonResultAriaHidden || undefined}
          style={
            comparisonResultRevealIndex === null
              ? undefined
              : ({
                  animationDelay: `${comparisonResultRevealIndex * 55}ms`,
                } satisfies CSSProperties)
          }
        >
          {s06ConsequenceContent.comparisonResultLabels[comparisonResult]}
        </strong>
      )}
      {actionLabel === null ? null : (
        <strong className={styles.nodeActionLabel} data-node-action-label>
          {actionLabel}
        </strong>
      )}
      {celebrate ? <CelebrationConfetti /> : null}
    </>
  );
}

export function AccountAssessmentNetwork({
  adapter,
  presentation,
  ariaLabel,
  canvasAriaLabel,
  attackPhase,
  attackerAccountId = 'campusgram',
  attackerDepartureAccountId = null,
  attackerAttemptStatus = null,
  attackTargetId,
  attackEdgeId = null,
  attackBlocked = false,
  comparisonResults = emptyComparisonResults,
  comparisonResultsAriaHidden = false,
  comparisonResultsCompact = false,
  comparisonResultsSequential = false,
  edgeRevealDelaysMs = emptyEdgeRevealDelaysMs,
  animateEdgeReveals = false,
  statusCascadeStartDelayMs,
  nodeActionLabels = emptyNodeActionLabels,
  celebratingNodeId = null,
  onNodeSelect = ignoreNodeSelect,
  interactionDisabled = true,
  accountShieldAsset = passwordFactorShieldAsset,
  showAccountShields = true,
  showEdgeLabels = false,
  overview = false,
}: {
  readonly adapter: ReactFlowNetworkAdapter;
  readonly presentation: NetworkPresentationSnapshot;
  readonly ariaLabel?: string;
  readonly canvasAriaLabel?: string;
  readonly attackPhase?:
    | 'found'
    | 'hypothetical-intro'
    | 'incident-check'
    | 'source-transition'
    | 'attacking'
    | 'preview-ready'
    | 'resolving';
  readonly attackerAccountId?: S06AccountId | null;
  readonly attackerDepartureAccountId?: S06AccountId | null;
  readonly attackerAttemptStatus?: NetworkSceneSnapshot['nodes'][number]['status'] | null;
  readonly attackTargetId?: S06AccountId | null;
  readonly attackEdgeId?: string | null;
  readonly attackBlocked?: boolean;
  readonly comparisonResults?: AccountComparisonResults;
  readonly comparisonResultsAriaHidden?: boolean;
  readonly comparisonResultsCompact?: boolean;
  readonly comparisonResultsSequential?: boolean;
  readonly edgeRevealDelaysMs?: Readonly<Partial<Record<string, number>>>;
  readonly animateEdgeReveals?: boolean;
  readonly statusCascadeStartDelayMs?: number;
  readonly nodeActionLabels?: Readonly<Partial<Record<S06AccountId, string>>>;
  readonly celebratingNodeId?: S06AccountId | null;
  readonly onNodeSelect?: (nodeId: string) => void;
  readonly interactionDisabled?: boolean;
  readonly accountShieldAsset?: string;
  readonly showAccountShields?: boolean;
  readonly showEdgeLabels?: boolean;
  readonly overview?: boolean;
}) {
  const comparisonResultOrder = useMemo(
    () => Object.keys(comparisonResults),
    [comparisonResults],
  );
  const renderNodeOverlay = useCallback(
    (node: NetworkSceneSnapshot['nodes'][number]) => (
      <AccountStatusOverlay
        node={node}
        attackerRole={
          node.id === attackerDepartureAccountId
            ? 'departing'
            : node.id === attackerAccountId
              ? 'active'
              : null
        }
        attackerAttemptStatus={attackerAttemptStatus}
        comparisonResult={comparisonResults[node.id] ?? null}
        comparisonResultAriaHidden={comparisonResultsAriaHidden}
        comparisonResultRevealIndex={
          comparisonResultsSequential ? comparisonResultOrder.indexOf(node.id) : null
        }
        compactComparisonResult={comparisonResultsCompact}
        actionLabel={actionLabelForNode(node.id, nodeActionLabels)}
        celebrate={node.id === celebratingNodeId}
        showAccountShield={showAccountShields}
        shieldAsset={accountShieldAsset}
      />
    ),
    [
      attackerAccountId,
      attackerDepartureAccountId,
      attackerAttemptStatus,
      comparisonResults,
      comparisonResultsAriaHidden,
      comparisonResultsCompact,
      comparisonResultsSequential,
      comparisonResultOrder,
      nodeActionLabels,
      celebratingNodeId,
      accountShieldAsset,
      showAccountShields,
    ],
  );

  return (
    <div
      className={styles.network}
      data-attack-phase={attackPhase}
      data-attack-source={attackerAccountId ?? undefined}
      data-attack-target={attackTargetId ?? undefined}
      data-attack-blocked={attackBlocked || undefined}
      data-attack-attempt={attackerAttemptStatus ?? undefined}
    >
      <ReactFlowNetwork
        adapter={adapter}
        presentation={presentation}
        onNodeSelect={onNodeSelect}
        interactionDisabled={interactionDisabled}
        visualVariant="account-map"
        visualDensity={overview ? 'overview' : 'default'}
        showEdgeLabels={showEdgeLabels}
        showNodeLabels={false}
        showStatusMarkers={false}
        dimInactiveNodes={false}
        renderNodeOverlay={renderNodeOverlay}
        edgeRevealDelaysMs={edgeRevealDelaysMs}
        animateEdgeReveals={animateEdgeReveals}
        currentAttackEdgeId={attackEdgeId}
        {...(statusCascadeStartDelayMs === undefined ? {} : { statusCascadeStartDelayMs })}
        {...(ariaLabel === undefined ? {} : { ariaLabel })}
        {...(canvasAriaLabel === undefined ? {} : { canvasAriaLabel })}
      />
    </div>
  );
}
