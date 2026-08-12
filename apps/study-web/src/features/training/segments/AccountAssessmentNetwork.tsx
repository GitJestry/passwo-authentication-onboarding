import type { S06AccountId } from '@passwo/contracts';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import attackerAsset from '../../../assets/passwo/attacker.png';
import passwordFactorShieldAsset from '../../../assets/s05/password-factor-shield.png';
import type { NetworkPresentationSnapshot } from '../../../adapters/network/NetworkMotionAdapter.js';
import {
  ReactFlowNetwork,
  type ReactFlowNetworkAdapter,
} from '../../../adapters/network/ReactFlowNetworkAdapter.js';
import styles from './AccountAssessmentNetwork.module.css';

function AccountStatusOverlay({
  node,
}: {
  readonly node: NetworkSceneSnapshot['nodes'][number];
}) {
  const showsCampusgramAttempt = node.id === 'campusgram';
  const showsShield = node.status === 'protected' && node.kind !== 'shield';
  if (!showsCampusgramAttempt && !showsShield) return null;

  return (
    <>
      {showsCampusgramAttempt ? (
        <span
          className={styles.attackAttempt}
          data-account-attack-attempt={node.status}
          aria-hidden="true"
        >
          <span className={styles.attackConnection} />
          <span className={styles.attacker} data-account-attacker>
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
    </>
  );
}

export function AccountAssessmentNetwork({
  adapter,
  presentation,
  ariaLabel,
  canvasAriaLabel,
  attackPhase,
  attackTargetId,
  attackBlocked = false,
}: {
  readonly adapter: ReactFlowNetworkAdapter;
  readonly presentation: NetworkPresentationSnapshot;
  readonly ariaLabel?: string;
  readonly canvasAriaLabel?: string;
  readonly attackPhase?: 'found' | 'attacking' | 'preview-ready' | 'resolving';
  readonly attackTargetId?: S06AccountId | null;
  readonly attackBlocked?: boolean;
}) {
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
        onNodeSelect={() => undefined}
        interactionDisabled
        visualVariant="account-map"
        showEdgeLabels={false}
        showNodeLabels={false}
        showStatusMarkers={false}
        dimInactiveNodes={false}
        renderNodeOverlay={(node) => <AccountStatusOverlay node={node} />}
        {...(ariaLabel === undefined ? {} : { ariaLabel })}
        {...(canvasAriaLabel === undefined ? {} : { canvasAriaLabel })}
      />
    </div>
  );
}
