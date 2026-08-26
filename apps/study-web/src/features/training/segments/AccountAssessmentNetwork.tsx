import type { PasswordRelation, S06AccountId } from '@passwo/contracts';
import { s06ConsequenceContent } from '@passwo/training-content';
import { BugStatusIcon } from '@passwo/ui';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import { memo, useCallback, useMemo, type CSSProperties } from 'react';
import attackerAsset from '../../../assets/passwo/attacker.webp';
import passwordFactorShieldAsset from '../../../assets/s05/password-factor-shield.webp';
import comparisonPathShieldAsset from '../../../assets/s06/comparison-path-shield.webp';
import easyToGuessAsset from '../../../assets/s06/easy-to-guess.png';
import type { NetworkPresentationSnapshot } from '../../../adapters/network/NetworkMotionAdapter.js';
import { CelebrationConfetti } from '../CelebrationConfetti.js';
import {
  ReactFlowNetwork,
  type ReactFlowNetworkAdapter,
} from '../../../adapters/network/ReactFlowNetworkAdapter.js';
import { NetworkSymbol } from '../../../adapters/network/NetworkSymbolRegistry.js';
import styles from './AccountAssessmentNetwork.module.css';

export type AccountComparisonResults = Readonly<
  Partial<Record<string, PasswordRelation['kind']>>
>;

const emptyComparisonResults: AccountComparisonResults = {};
const emptyEdgeRevealDelaysMs: Readonly<Partial<Record<string, number>>> = {};
const emptyNodeActionLabels: Readonly<Partial<Record<S06AccountId, string>>> = {};
const emptyAccountIds: readonly string[] = [];

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

function isEasyToGuessAccount(
  nodeId: string,
  accountIds: readonly string[],
): boolean {
  return accountIds.includes(nodeId);
}

function AccountStatusOverlay({
  node,
  attackerRole,
  attackerAttemptStatus,
  attackerLabel,
  attackerPreview,
  attackerPreviewSymbolId,
  comparisonResult,
  comparisonResultAriaHidden,
  comparisonResultRevealIndex,
  compactComparisonResult,
  actionLabel,
  celebrate,
  celebrationDelayMs,
  compactCelebration,
  showAccountShield,
  shieldAsset,
  easyToGuess,
  compromised,
}: {
  readonly node: NetworkSceneSnapshot['nodes'][number];
  readonly attackerRole: 'active' | 'departing' | null;
  readonly attackerAttemptStatus: NetworkSceneSnapshot['nodes'][number]['status'] | null;
  readonly attackerLabel: string;
  readonly attackerPreview: boolean;
  readonly attackerPreviewSymbolId: string | null;
  readonly comparisonResult: PasswordRelation['kind'] | null;
  readonly comparisonResultAriaHidden: boolean;
  readonly comparisonResultRevealIndex: number | null;
  readonly compactComparisonResult: boolean;
  readonly actionLabel: string | null;
  readonly celebrate: boolean;
  readonly celebrationDelayMs: number;
  readonly compactCelebration: boolean;
  readonly showAccountShield: boolean;
  readonly shieldAsset: string;
  readonly easyToGuess: boolean;
  readonly compromised: boolean;
}) {
  const showsShield =
    showAccountShield && !easyToGuess && node.status === 'protected' && node.kind !== 'shield';
  const showsComparisonPathShield =
    node.status === 'protected' && node.symbolId === 'comparison-path-shield';
  const attackerStatus = attackerAttemptStatus ?? node.status;
  if (
    attackerRole === null &&
    !showsShield &&
    !showsComparisonPathShield &&
    !easyToGuess &&
    comparisonResult === null &&
    actionLabel === null &&
    !celebrate &&
    !compromised
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
          {attackerPreview ? (
            <svg
              className={styles.attackerProjection}
              data-account-attacker-projection
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polygon points="0,0 100,12 100,88 0,4" />
              <line x1="0" y1="0" x2="100" y2="12" />
              <line x1="0" y1="4" x2="100" y2="88" />
            </svg>
          ) : (
            <span className={styles.attackConnection} data-account-attack-connection />
          )}
          <span
            className={styles.attacker}
            data-account-attacker
            data-account-attacker-preview={attackerPreview || undefined}
          >
            {attackerPreview ? (
              <span
                className={styles.attackerPreviewBug}
                data-account-attacker-preview-bug
              >
                <BugStatusIcon />
              </span>
            ) : null}
            <strong className={styles.attackerLabel} data-account-attacker-label>
              {attackerPreviewSymbolId === null ? null : (
                <span className={styles.attackerPreviewSymbol}>
                  <NetworkSymbol symbolId={attackerPreviewSymbolId} />
                </span>
              )}
              <span>{attackerLabel}</span>
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
      {easyToGuess ? (
        <img
          className={styles.easyToGuess}
          data-easy-to-guess
          src={easyToGuessAsset}
          width={1024}
          height={1024}
          alt=""
          aria-hidden="true"
        />
      ) : null}
      {compromised ? (
        <span className={styles.compromisedBug} data-compromised-bug aria-hidden="true">
          <BugStatusIcon />
        </span>
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
      {celebrate ? (
        <CelebrationConfetti
          delayMs={celebrationDelayMs}
          compact={compactCelebration}
        />
      ) : null}
    </>
  );
}

function AccountAssessmentNetworkView({
  adapter,
  presentation,
  ariaLabel,
  canvasAriaLabel,
  attackPhase,
  attackerAccountId = 'campusgram',
  attackerDepartureAccountId = null,
  attackerAttemptStatus = null,
  attackerLabel = s06ConsequenceContent.page.dataLeak,
  attackerPreview = false,
  attackerPreviewSymbolId = null,
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
  celebratingNodeIds = emptyAccountIds,
  celebrationDelayStepMs = 0,
  compactCelebration = false,
  onNodeSelect = ignoreNodeSelect,
  interactionDisabled = true,
  accountShieldAsset = passwordFactorShieldAsset,
  showAccountShields = true,
  showEdgeLabels = false,
  overview = false,
  easyToGuessAccountIds = emptyAccountIds,
  hideDetailSymbols = false,
  compromisedNodeId = null,
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
  readonly attackerLabel?: string;
  readonly attackerPreview?: boolean;
  readonly attackerPreviewSymbolId?: string | null;
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
  readonly celebratingNodeId?: string | null;
  readonly celebratingNodeIds?: readonly string[];
  readonly celebrationDelayStepMs?: number;
  readonly compactCelebration?: boolean;
  readonly onNodeSelect?: (nodeId: string) => void;
  readonly interactionDisabled?: boolean;
  readonly accountShieldAsset?: string;
  readonly showAccountShields?: boolean;
  readonly showEdgeLabels?: boolean;
  readonly overview?: boolean;
  readonly easyToGuessAccountIds?: readonly string[];
  readonly hideDetailSymbols?: boolean;
  readonly compromisedNodeId?: string | null;
}) {
  const comparisonResultOrder = useMemo(
    () => Object.keys(comparisonResults),
    [comparisonResults],
  );
  const renderNodeOverlay = useCallback(
    (node: NetworkSceneSnapshot['nodes'][number]) => {
      const celebrationIndex = celebratingNodeIds.indexOf(node.id);
      return (
        <AccountStatusOverlay
          node={node}
          attackerRole={
            node.id === attackerDepartureAccountId
              ? 'departing'
              : node.id === attackerAccountId
                ? 'active'
                : null
          }
          attackerAttemptStatus={
            node.id === attackerAccountId ? attackerAttemptStatus : null
          }
          attackerLabel={attackerLabel}
          attackerPreview={attackerPreview}
          attackerPreviewSymbolId={attackerPreviewSymbolId}
          comparisonResult={comparisonResults[node.id] ?? null}
          comparisonResultAriaHidden={comparisonResultsAriaHidden}
          comparisonResultRevealIndex={
            comparisonResultsSequential ? comparisonResultOrder.indexOf(node.id) : null
          }
          compactComparisonResult={comparisonResultsCompact}
          actionLabel={actionLabelForNode(node.id, nodeActionLabels)}
          celebrate={node.id === celebratingNodeId || celebrationIndex >= 0}
          celebrationDelayMs={
            celebrationIndex < 0 ? 0 : celebrationIndex * celebrationDelayStepMs
          }
          compactCelebration={compactCelebration}
          showAccountShield={showAccountShields}
          shieldAsset={accountShieldAsset}
          easyToGuess={isEasyToGuessAccount(node.id, easyToGuessAccountIds)}
          compromised={node.id === compromisedNodeId}
        />
      );
    },
    [
      attackerAccountId,
      attackerDepartureAccountId,
      attackerAttemptStatus,
      attackerLabel,
      attackerPreview,
      attackerPreviewSymbolId,
      comparisonResults,
      comparisonResultsAriaHidden,
      comparisonResultsCompact,
      comparisonResultsSequential,
      comparisonResultOrder,
      nodeActionLabels,
      celebratingNodeId,
      celebratingNodeIds,
      celebrationDelayStepMs,
      compactCelebration,
      accountShieldAsset,
      showAccountShields,
      easyToGuessAccountIds,
      compromisedNodeId,
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
      data-hide-detail-symbols={hideDetailSymbols || undefined}
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

export const AccountAssessmentNetwork = memo(AccountAssessmentNetworkView);
