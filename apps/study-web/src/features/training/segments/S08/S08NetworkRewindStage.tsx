import type { DesktopPlatform } from '@passwo/ui';
import { DesktopSurface } from '@passwo/ui';
import type { NetworkSceneSnapshot } from '@passwo/visualization';
import { useMemo } from 'react';
import {
  ReactFlowNetwork,
  ReactFlowNetworkAdapter,
} from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import {
  createCompletedS02Network,
  createRewoundAccountNetwork,
  staticNetworkPresentation,
} from '../account-network.js';
import styles from './S08NetworkRewindStage.module.css';

export interface S08NetworkRewindStageProps {
  readonly network?: NetworkSceneSnapshot | null;
  readonly platform: DesktopPlatform;
}

export function S08NetworkRewindStage({ network, platform }: S08NetworkRewindStageProps) {
  const rewoundNetwork = useMemo(
    () => createRewoundAccountNetwork(network ?? createCompletedS02Network()),
    [network],
  );
  const adapter = useMemo(() => new ReactFlowNetworkAdapter(rewoundNetwork), [rewoundNetwork]);
  const presentation = useMemo(
    () => staticNetworkPresentation(rewoundNetwork),
    [rewoundNetwork],
  );

  return (
    <section className={styles.training} aria-labelledby="awaiting-s08-title">
      <DesktopSurface
        platform={platform}
        browserDock={{ active: false, enabled: false, label: 'Browser geschlossen' }}
      >
        <div className={styles.network} aria-hidden="true">
          <ReactFlowNetwork
            adapter={adapter}
            presentation={presentation}
            onNodeSelect={() => undefined}
            interactionDisabled
            visualVariant="account-map"
            showEdgeLabels={false}
          />
        </div>
        <div className={styles.statusCard}>
          <h1 id="awaiting-s08-title">Auswertung abgeschlossen.</h1>
        </div>
      </DesktopSurface>
    </section>
  );
}
