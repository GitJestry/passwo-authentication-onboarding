import type { PasswordRelation, S06AccountId } from '@passwo/contracts';
import { s06ConsequenceContent } from '@passwo/training-content';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import { useCallback } from 'react';
import attackerAsset from '../../../assets/passwo/attacker.png';
import passwordFactorShieldAsset from '../../../assets/s05/password-factor-shield.png';
import type { NetworkPresentationSnapshot } from '../../../adapters/network/NetworkMotionAdapter.js';
import {
  ReactFlowNetwork,
  type ReactFlowNetworkAdapter,
} from '../../../adapters/network/ReactFlowNetworkAdapter.js';
import styles from './AccountAssessmentNetwork.module.css';

export type AccountComparisonResults = Readonly<
  Partial<Record<S06AccountId, PasswordRelation['kind']>>
>;

const emptyComparisonResults: AccountComparisonResults = {};

function ignoreNodeSelect(_nodeId: string): void {}

function comparisonResultForNode(
  nodeId: string,
  comparisonResults: AccountComparisonResults,
): PasswordRelation['kind'] | null {
  if (nodeId === 'campusgram' || nodeId === 'master-campus' || nodeId === 'campus-email') {
    return comparisonResults[nodeId] ?? null;
  }
  return null;
}

function AccountStatusOverlay({
  node,
  showAttacker,
  attackerAttemptStatus,
  showDataLeakLabel,
  comparisonResult,
}: {
  readonly node: NetworkSceneSnapshot['nodes'][number];
  readonly showAttacker: boolean;
  readonly attackerAttemptStatus: NetworkSceneSnapshot['nodes'][number]['status'] | null;
  readonly showDataLeakLabel: boolean;
  readonly comparisonResult: PasswordRelation['kind'] | null;
}) {
  const showsShield = node.status === 'protected' && node.kind !== 'shield';
  if (!showAttacker && !showsShield && comparisonResult === null) return null;

  return (
    <>
      {showAttacker ? (
        <span
          className={styles.attackAttempt}
          data-account-attack-attempt={attackerAttemptStatus ?? node.status}
          aria-hidden="true"
        >
          <span className={styles.attackConnection} />
          <span className={styles.attacker} data-account-attacker>
            {showDataLeakLabel ? (
              <strong className={styles.attackerLabel}>
                {s06ConsequenceContent.page.dataLeak}
              </strong>
            ) : null}
            <img src={attackerAsset} alt="" />
          </span>
        </span>
      ) : null}
      {showsShield ? (
        <img
          className={styles.shield}
          data-account-shield
          data-main={node.kind === 'account' || undefined}
          src={passwordFactorShieldAsset}
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
}) {
  const showDataLeakLabel =
    attackPhase === undefined ||
    attackPhase === 'found' ||
    attackPhase === 'hypothetical-intro' ||
    attackPhase === 'incident-check';
  const renderNodeOverlay = useCallback(
    (node: NetworkSceneSnapshot['nodes'][number]) => (
      <AccountStatusOverlay
        node={node}
        showAttacker={node.id === attackerAccountId}
        attackerAttemptStatus={attackerAttemptStatus}
        showDataLeakLabel={showDataLeakLabel}
        comparisonResult={comparisonResultForNode(node.id, comparisonResults)}
      />
    ),
    [attackerAccountId, attackerAttemptStatus, comparisonResults, showDataLeakLabel],
  );

  return (
    <div
      className={styles.network}
      data-attack-phase={attackPhase}
      data-attack-target={attackTargetId ?? undefined}
      data-attack-blocked={attackBlocked || undefined}
    >
      <ReactFlowNetwork
        adapter={adapter}
        presentation={presentation}
        onNodeSelect={ignoreNodeSelect}
        interactionDisabled
        visualVariant="account-map"
        showEdgeLabels={false}
        showNodeLabels={false}
        showStatusMarkers={false}
        dimInactiveNodes={false}
        renderNodeOverlay={renderNodeOverlay}
        currentAttackEdgeId={attackEdgeId}
        {...(ariaLabel === undefined ? {} : { ariaLabel })}
        {...(canvasAriaLabel === undefined ? {} : { canvasAriaLabel })}
      />
    </div>
  );
}
