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
  if (node.id === 'campusgram' && node.status === 'exposed') {
    return (
      <span className={styles.attacker} data-account-attacker aria-hidden="true">
        <img src={attackerAsset} alt="" />
      </span>
    );
  }
  if (node.status === 'protected' && node.kind !== 'shield') {
    return (
      <img
        className={styles.shield}
        data-account-shield
        data-main={node.kind === 'account' || undefined}
        src={passwordFactorShieldAsset}
        alt=""
        aria-hidden="true"
      />
    );
  }
  return null;
}

export function AccountAssessmentNetwork({
  adapter,
  presentation,
  ariaLabel,
  canvasAriaLabel,
}: {
  readonly adapter: ReactFlowNetworkAdapter;
  readonly presentation: NetworkPresentationSnapshot;
  readonly ariaLabel?: string;
  readonly canvasAriaLabel?: string;
}) {
  return (
    <div className={styles.network}>
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
