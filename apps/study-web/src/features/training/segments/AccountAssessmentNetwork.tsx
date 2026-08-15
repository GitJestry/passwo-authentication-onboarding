import type { PasswordRelation, S06AccountId } from '@passwo/contracts';
import { s06ConsequenceContent } from '@passwo/training-content';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import { useCallback } from 'react';
import attackerAsset from '../../../assets/passwo/attacker.png';
import passwordFactorShieldAsset from '../../../assets/s05/password-factor-shield.png';
import comparisonPathShieldAsset from '../../../assets/s06/comparison-path-shield.png';
import type { NetworkPresentationSnapshot } from '../../../adapters/network/NetworkMotionAdapter.js';
import { CelebrationConfetti } from '../CelebrationConfetti.js';
import {
  ReactFlowNetwork,
  type ReactFlowNetworkAdapter,
} from '../../../adapters/network/ReactFlowNetworkAdapter.js';
import styles from './AccountAssessmentNetwork.module.css';

export type AccountComparisonResults = Readonly<
  Partial<Record<S06AccountId, PasswordRelation['kind']>>
>;

const emptyComparisonResults: AccountComparisonResults = {};
const emptyNodeActionLabels: Readonly<Partial<Record<S06AccountId, string>>> = {};

function ignoreNodeSelect(_nodeId: string): void {}

function comparisonResultForNode(
  nodeId: string,
  campusgramResult: PasswordRelation['kind'] | null,
  masterCampusResult: PasswordRelation['kind'] | null,
  campusEmailResult: PasswordRelation['kind'] | null,
): PasswordRelation['kind'] | null {
  if (nodeId === 'campusgram') return campusgramResult;
  if (nodeId === 'master-campus') return masterCampusResult;
  return nodeId === 'campus-email' ? campusEmailResult : null;
}

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
  showAttacker,
  attackerAttemptStatus,
  comparisonResult,
  actionLabel,
  celebrate,
  shieldAsset,
}: {
  readonly node: NetworkSceneSnapshot['nodes'][number];
  readonly showAttacker: boolean;
  readonly attackerAttemptStatus: NetworkSceneSnapshot['nodes'][number]['status'] | null;
  readonly comparisonResult: PasswordRelation['kind'] | null;
  readonly actionLabel: string | null;
  readonly celebrate: boolean;
  readonly shieldAsset: string;
}) {
  const showsShield = node.status === 'protected' && node.kind !== 'shield';
  const showsComparisonPathShield =
    node.status === 'protected' && node.symbolId === 'comparison-path-shield';
  const attackerStatus = attackerAttemptStatus ?? node.status;
  if (
    !showAttacker &&
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
      {showAttacker ? (
        <span
          key={`${node.id}-${attackerStatus}`}
          className={styles.attackAttempt}
          data-account-attack-attempt={attackerStatus}
          data-account-attack-source={node.id}
          aria-hidden="true"
        >
          <span className={styles.attackConnection} />
          <span className={styles.attacker} data-account-attacker>
            <strong className={styles.attackerLabel}>
              {s06ConsequenceContent.page.dataLeak}
            </strong>
            <img src={attackerAsset} alt="" />
          </span>
        </span>
      ) : null}
      {showsShield ? (
        <img
          className={styles.shield}
          data-account-shield
          data-main={node.kind === 'account' || undefined}
          src={shieldAsset}
          alt=""
          aria-hidden="true"
        />
      ) : null}
      {showsComparisonPathShield ? (
        <img
          className={styles.comparisonPathShield}
          data-comparison-path-shield
          src={comparisonPathShieldAsset}
          alt=""
          aria-hidden="true"
        />
      ) : null}
      {comparisonResult === null ? null : (
        <strong
          className={styles.comparisonResult}
          data-comparison-result={comparisonResult}
        >
          {s06ConsequenceContent.comparisonResultLabels[comparisonResult]}
        </strong>
      )}
      {actionLabel === null ? null : (
        <strong className={styles.nodeActionLabel}>{actionLabel}</strong>
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
  attackerAttemptStatus = null,
  attackTargetId,
  attackEdgeId = null,
  attackBlocked = false,
  comparisonResults = emptyComparisonResults,
  statusCascadeStartDelayMs,
  nodeActionLabels = emptyNodeActionLabels,
  celebratingNodeId = null,
  onNodeSelect = ignoreNodeSelect,
  interactionDisabled = true,
  accountShieldAsset = passwordFactorShieldAsset,
}: {
  readonly adapter: ReactFlowNetworkAdapter;
  readonly presentation: NetworkPresentationSnapshot;
  readonly ariaLabel?: string;
  readonly canvasAriaLabel?: string;
  readonly attackPhase?:
    | 'found'
    | 'hypothetical-intro'
    | 'incident-check'
    | 'attacking'
    | 'preview-ready'
    | 'resolving';
  readonly attackerAccountId?: S06AccountId | null;
  readonly attackerAttemptStatus?: NetworkSceneSnapshot['nodes'][number]['status'] | null;
  readonly attackTargetId?: S06AccountId | null;
  readonly attackEdgeId?: string | null;
  readonly attackBlocked?: boolean;
  readonly comparisonResults?: AccountComparisonResults;
  readonly statusCascadeStartDelayMs?: number;
  readonly nodeActionLabels?: Readonly<Partial<Record<S06AccountId, string>>>;
  readonly celebratingNodeId?: S06AccountId | null;
  readonly onNodeSelect?: (nodeId: string) => void;
  readonly interactionDisabled?: boolean;
  readonly accountShieldAsset?: string;
}) {
  const campusgramResult = comparisonResults.campusgram ?? null;
  const masterCampusResult = comparisonResults['master-campus'] ?? null;
  const campusEmailResult = comparisonResults['campus-email'] ?? null;
  const renderNodeOverlay = useCallback(
    (node: NetworkSceneSnapshot['nodes'][number]) => (
      <AccountStatusOverlay
        node={node}
        showAttacker={node.id === attackerAccountId}
        attackerAttemptStatus={attackerAttemptStatus}
        comparisonResult={comparisonResultForNode(
          node.id,
          campusgramResult,
          masterCampusResult,
          campusEmailResult,
        )}
        actionLabel={actionLabelForNode(node.id, nodeActionLabels)}
        celebrate={node.id === celebratingNodeId}
        shieldAsset={accountShieldAsset}
      />
    ),
    [
      attackerAccountId,
      attackerAttemptStatus,
      campusEmailResult,
      campusgramResult,
      masterCampusResult,
      nodeActionLabels,
      celebratingNodeId,
      accountShieldAsset,
    ],
  );

  return (
    <div
      className={styles.network}
      data-attack-phase={attackPhase}
      data-attack-source={attackerAccountId ?? undefined}
      data-attack-target={attackTargetId ?? undefined}
      data-attack-blocked={attackBlocked || undefined}
    >
      <ReactFlowNetwork
        adapter={adapter}
        presentation={presentation}
        onNodeSelect={onNodeSelect}
        interactionDisabled={interactionDisabled}
        visualVariant="account-map"
        showEdgeLabels={false}
        showNodeLabels={false}
        showStatusMarkers={false}
        dimInactiveNodes={false}
        renderNodeOverlay={renderNodeOverlay}
        currentAttackEdgeId={attackEdgeId}
        {...(statusCascadeStartDelayMs === undefined ? {} : { statusCascadeStartDelayMs })}
        {...(ariaLabel === undefined ? {} : { ariaLabel })}
        {...(canvasAriaLabel === undefined ? {} : { canvasAriaLabel })}
      />
    </div>
  );
}
