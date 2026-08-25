import type { S06AccountId, SupportiveS08ResumeState } from '@passwo/contracts';
import {
  s08NetworkReplayContent,
  s09PasswordSummaryContent,
  s12PasswordManagerContent,
  s13PasswordManagerPracticeContent,
} from '@passwo/training-content';
import type { DesktopPlatform } from '@passwo/ui';
import { DesktopSurface } from '@passwo/ui';
import type {
  NetworkSceneSnapshot,
  PasswordConsequencePlanStep,
  PasswordConsequenceScenePlan,
  PasswordConsequenceStepId,
} from '@passwo/visualization';
import { useMachine } from '@xstate/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { assign, setup } from 'xstate';
import { ReactFlowNetworkAdapter } from '../../../../adapters/network/ReactFlowNetworkAdapter.js';
import blueShieldAsset from '../../../../assets/s05/password-factor-shield.webp';
import greenShieldAsset from '../../../../assets/s06/comparison-path-shield.webp';
import { CelebrationConfetti } from '../../CelebrationConfetti.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { SectionTransition } from '../../SectionTransition.js';
import { AccountAssessmentNetwork } from '../AccountAssessmentNetwork.js';
import { createS06BlockedReplayTriangle } from '../S06/S06ConsequenceController.js';
import {
  PasswordManagerVaultVisual,
  S12PasswordManagerTraining,
  type PasswordManagerVaultEntry,
} from '../S12/S12PasswordManagerTraining.js';
import { S13PasswordManagerPractice } from '../S13/S13PasswordManagerPractice.js';
import {
  blockedS08ProtectionSteps,
  createCompletedS02Network,
  createExpandedS09AccountNetwork,
  createProtectedS08Network,
  createS08ProtectionNetwork,
  createS08ProtectionRiskModel,
  createS08ProtectionRiskModelFromResumeState,
  createS09ScalingComparisonResults,
  createS09ScalingRiskNetwork,
  createS13MyShopNetwork,
  s08AccountHasOpenActionNeed,
  s08HasOpenActionNeed,
  type S08ProtectionRiskModel,
  staticNetworkPresentation,
} from '../account-network.js';
import styles from './S08NetworkRewindStage.module.css';

export type S08ChangeableAccountId = Exclude<S06AccountId, 'campusgram'>;

interface S08Context {
  readonly initialStage: 's08' | 's09' | 'manager' | 's13' | 's13-network';
  readonly phaseDurationMs: number;
  readonly protectionResolutionDurationMs: number;
  readonly reductionDurationMs: number;
  readonly newAccountShieldDelayMs: number;
  readonly newAccountConnectionDelayMs: number;
  readonly networkReturnDelayMs: number;
  readonly protectedAccountIds: readonly S08ChangeableAccountId[];
  readonly resolvingAccountId: S08ChangeableAccountId | null;
  readonly riskModel: S08ProtectionRiskModel;
}

type S08Event =
  | {
      readonly type: 'PROTECT_WITH_UNIQUE_PASSPHRASE';
      readonly accountId: S08ChangeableAccountId;
    }
  | { readonly type: 'TRIANGLE_ANIMATION_COMPLETE' }
  | { readonly type: 'ANSWER_SELECTED' }
  | { readonly type: 'TRANSITION_COMPLETE' }
  | { readonly type: 'OPEN_BROWSER' }
  | { readonly type: 'S13_BROWSER_CLOSED' }
  | { readonly type: 'NEXT' };

const s08Machine = setup({
  types: {
    context: {} as S08Context,
    events: {} as S08Event,
    input: {} as {
      readonly recommendedAccountIds: readonly S08ChangeableAccountId[];
      readonly initialStage: 's08' | 's09' | 'manager' | 's13' | 's13-network';
      readonly phaseDurationMs: number;
      readonly protectionResolutionDurationMs: number;
      readonly reductionDurationMs: number;
      readonly newAccountShieldDelayMs: number;
      readonly newAccountConnectionDelayMs: number;
      readonly networkReturnDelayMs: number;
      readonly riskModel: S08ProtectionRiskModel;
    },
  },
  delays: {
    phaseDuration: ({ context }) => context.phaseDurationMs,
    protectionResolutionDuration: ({ context }) =>
      context.protectionResolutionDurationMs,
    reductionDuration: ({ context }) => context.reductionDurationMs,
    newAccountShieldDelay: ({ context }) => context.newAccountShieldDelayMs,
    newAccountConnectionDelay: ({ context }) => context.newAccountConnectionDelayMs,
    networkReturnDelay: ({ context }) => context.networkReturnDelayMs,
  },
  guards: {
    allResolved: ({ context }) =>
      !s08HasOpenActionNeed(context.riskModel, context.protectedAccountIds),
    canProtectAccount: ({ context, event }) =>
      event.type === 'PROTECT_WITH_UNIQUE_PASSPHRASE' &&
      s08AccountHasOpenActionNeed(
        context.riskModel,
        context.protectedAccountIds,
        event.accountId,
      ),
    startsAtS09: ({ context }) => context.initialStage === 's09',
    startsAtManager: ({ context }) => context.initialStage === 'manager',
    startsAtS13: ({ context }) => context.initialStage === 's13',
    startsAtS13Network: ({ context }) => context.initialStage === 's13-network',
  },
  actions: {
    startProtectionResolution: assign({
      resolvingAccountId: ({ event }) =>
        event.type === 'PROTECT_WITH_UNIQUE_PASSPHRASE'
          ? event.accountId
          : null,
    }),
    finishProtectionResolution: assign({
      protectedAccountIds: ({ context }) =>
        context.resolvingAccountId === null ||
        context.protectedAccountIds.includes(context.resolvingAccountId)
          ? context.protectedAccountIds
          : [...context.protectedAccountIds, context.resolvingAccountId],
      resolvingAccountId: () => null,
    }),
  },
}).createMachine({
  id: 's08ProtectionAndReplay',
  initial: 'entry',
  context: ({ input }) => ({
    initialStage: input.initialStage,
    phaseDurationMs: input.phaseDurationMs,
    protectionResolutionDurationMs: input.protectionResolutionDurationMs,
    reductionDurationMs: input.reductionDurationMs,
    newAccountShieldDelayMs: input.newAccountShieldDelayMs,
    newAccountConnectionDelayMs: input.newAccountConnectionDelayMs,
    networkReturnDelayMs: input.networkReturnDelayMs,
    protectedAccountIds:
      input.initialStage === 's08' ? [] : [...input.recommendedAccountIds],
    resolvingAccountId: null,
    riskModel: input.riskModel,
  }),
  states: {
    entry: {
      always: [
        { guard: 'startsAtS13Network', target: 'managerPracticeNetworkReturn' },
        { guard: 'startsAtS13', target: 'managerPractice' },
        { guard: 'startsAtManager', target: 'managerTransition' },
        { guard: 'startsAtS09', target: 's09Summary' },
        { target: 'protection' },
      ],
    },
    protection: {
      always: [{ guard: 'allResolved', target: 'attackReady' }],
      on: {
        PROTECT_WITH_UNIQUE_PASSPHRASE: {
          guard: 'canProtectAccount',
          target: 'protectionDissolving',
          actions: 'startProtectionResolution',
        },
      },
    },
    protectionDissolving: {
      after: {
        protectionResolutionDuration: {
          target: 'protection',
          actions: 'finishProtectionResolution',
        },
      },
    },
    attackReady: { on: { NEXT: { target: 'incidentAttack' } } },
    incidentAttack: { after: { phaseDuration: { target: 'triangleAnimating' } } },
    triangleAnimating: {
      on: { TRIANGLE_ANIMATION_COMPLETE: { target: 'replayComplete' } },
    },
    replayComplete: { on: { NEXT: { target: 's09Summary' } } },
    s09Summary: { tags: ['s09'], on: { NEXT: { target: 's09Intro' } } },
    s09Intro: { tags: ['s09'], on: { NEXT: { target: 's09Expansion' } } },
    s09Expansion: {
      tags: ['s09', 'expanded'],
      on: { NEXT: { target: 's09Reduction' } },
    },
    s09Reduction: {
      tags: ['s09', 'expanded', 'reducing'],
      after: { reductionDuration: { target: 's09Question' } },
    },
    s09Question: {
      tags: ['s09', 'expanded'],
      on: { ANSWER_SELECTED: { target: 'passWoDifficulty' } },
    },
    passWoDifficulty: {
      tags: ['s09', 'expanded'],
      on: { NEXT: { target: 'passWoWorkarounds' } },
    },
    passWoWorkarounds: {
      tags: ['s09', 'expanded'],
      on: { NEXT: { target: 'passWoRisks' } },
    },
    passWoRisks: {
      tags: ['s09', 'expanded'],
      on: { NEXT: { target: 'passWoSolution' } },
    },
    passWoSolution: {
      tags: ['s09', 'expanded'],
      on: { NEXT: { target: 'managerTransition' } },
    },
    managerTransition: {
      tags: ['manager-transition', 'expanded'],
      on: { TRANSITION_COMPLETE: { target: 'managerLesson' } },
    },
    managerLesson: {
      tags: ['manager'],
      on: { OPEN_BROWSER: { target: 'managerPractice' } },
    },
    managerPractice: {
      tags: ['manager', 'expanded'],
      on: { S13_BROWSER_CLOSED: { target: 'managerPracticeNetworkReturn' } },
    },
    managerPracticeNetworkReturn: {
      tags: ['manager', 'expanded', 's13-network'],
      after: { networkReturnDelay: { target: 'managerPracticeNewAccountReveal' } },
    },
    managerPracticeNewAccountReveal: {
      tags: ['manager', 'expanded', 's13-network', 's13-new-account'],
      after: { newAccountShieldDelay: { target: 'managerPracticeNewAccountShield' } },
    },
    managerPracticeNewAccountShield: {
      tags: ['manager', 'expanded', 's13-network', 's13-new-account'],
      after: {
        newAccountConnectionDelay: { target: 'managerPracticeNewAccountConnections' },
      },
    },
    managerPracticeNewAccountConnections: {
      tags: ['manager', 'expanded', 's13-network', 's13-new-account'],
      on: { NEXT: { target: 'managerPracticeExistingAccount' } },
    },
    managerPracticeExistingAccount: {
      tags: ['manager', 'expanded', 's13-network', 's13-existing-account'],
      on: { NEXT: { target: 'managerPracticeExistingAccountUnchanged' } },
    },
    managerPracticeExistingAccountUnchanged: {
      tags: ['manager', 'expanded', 's13-network', 's13-existing-account'],
      on: { NEXT: { target: 'managerPracticeExistingAccountRelation' } },
    },
    managerPracticeExistingAccountRelation: {
      tags: ['manager', 'expanded', 's13-network', 's13-existing-account'],
      on: { NEXT: { target: 'managerPracticeExistingAccountReplace' } },
    },
    managerPracticeExistingAccountReplace: {
      tags: ['manager', 'expanded', 's13-network', 's13-existing-account'],
      on: { NEXT: { target: 'managerPracticeBrowserPrompt' } },
    },
    managerPracticeBrowserPrompt: {
      tags: ['manager', 'expanded', 's13-network'],
      on: { OPEN_BROWSER: { target: 'complete' } },
    },
    complete: { tags: ['manager', 'expanded', 's13-network'] },
  },
});

export interface S08NetworkRewindStageProps {
  readonly displayName?: string;
  readonly recommendedAccountIds?: readonly S08ChangeableAccountId[];
  readonly network?: NetworkSceneSnapshot | null;
  readonly plan?: PasswordConsequenceScenePlan | null;
  readonly resumeState?: SupportiveS08ResumeState;
  readonly platform: DesktopPlatform;
  readonly initialStage?: 's08' | 's09' | 'manager' | 's13' | 's13-network';
  readonly onComplete?: () => void;
}

function replayDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 1450;
}

function accountReductionDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 760;
}

function protectionResolutionDuration(): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 460;
}

function newAccountMotionDurations(): Readonly<{
  shieldDelayMs: number;
  connectionDelayMs: number;
  networkReturnDelayMs: number;
}> {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? { shieldDelayMs: 0, connectionDelayMs: 0, networkReturnDelayMs: 0 }
    : { shieldDelayMs: 2600, connectionDelayMs: 650, networkReturnDelayMs: 700 };
}

const s13ImportedVaultEntries: readonly PasswordManagerVaultEntry[] =
  s13PasswordManagerPracticeContent.network.importedVault.entries.map(
    (entry, index) => ({
      id: entry.id,
      account: entry.label,
      maskedPassword:
        s13PasswordManagerPracticeContent.network.importedVault.maskedPassword,
      symbolId: entry.symbolId,
      muted: index >= 5,
    }),
  );

function S13ImportedVault({ highlighted }: { readonly highlighted: boolean }) {
  const vault = s13PasswordManagerPracticeContent.network.importedVault;
  return (
    <aside
      className={styles.importedVault}
      data-s13-import-vault
      data-highlighted={highlighted || undefined}
      aria-label={vault.ariaLabel}
    >
      <PasswordManagerVaultVisual
        className={styles.importedVaultSafe}
        open
        entries={s13ImportedVaultEntries}
        title={vault.title}
        moreLabel={vault.moreLabel}
      />
    </aside>
  );
}

function changeableAccountId(nodeId: string): S08ChangeableAccountId | null {
  if (nodeId === 'master-campus' || nodeId === 'campus-email') return nodeId;
  return null;
}

function planStep(
  plan: PasswordConsequenceScenePlan | null | undefined,
  stepId: PasswordConsequenceStepId,
): PasswordConsequencePlanStep | null {
  return plan?.steps.find(({ id }) => id === stepId) ?? null;
}

function authoredReplayStep(
  network: NetworkSceneSnapshot,
  id: Extract<
    PasswordConsequenceStepId,
    | 's06-step-campusgram-master-campus'
    | 's06-step-campusgram-campus-email'
    | 's06-step-master-campus-campus-email'
  >,
  sourceAccountId: S06AccountId,
  targetAccountId: S06AccountId,
): PasswordConsequencePlanStep {
  return {
    id,
    mode: 'actual',
    narrationId: `${id}-protected-replay`,
    sourceAccountId,
    targetAccountId,
    relation: {
      kind: 'no-derived-path-recognized',
      relationId: `${id}-protected-replay`,
      sourceEvidence: [],
      targetEvidence: [],
      explanationId: 's06.relation.no-derived-path-recognized',
    },
    network: {
      ...network,
      id: `${network.id}-${id}-protected-replay`,
      edges: [
        ...network.edges,
        {
          id: `${id}-path`,
          sourceId: sourceAccountId,
          targetId: targetAccountId,
          kind: 'blocked-path',
          status: 'blocked',
          label: null,
        },
      ],
    },
    visibleChange: { targetId: targetAccountId, emphasis: 'positive' },
  };
}

function authoredReplaySteps(
  network: NetworkSceneSnapshot,
): readonly PasswordConsequencePlanStep[] {
  return [
    authoredReplayStep(
      network,
      's06-step-campusgram-master-campus',
      'campusgram',
      'master-campus',
    ),
    authoredReplayStep(
      network,
      's06-step-campusgram-campus-email',
      'campusgram',
      'campus-email',
    ),
    authoredReplayStep(
      network,
      's06-step-master-campus-campus-email',
      'master-campus',
      'campus-email',
    ),
  ];
}

export function S08NetworkRewindStage({
  displayName = '',
  recommendedAccountIds = [],
  network,
  plan,
  resumeState,
  platform,
  initialStage = 's08',
  onComplete,
}: S08NetworkRewindStageProps) {
  const networkHostRef = useRef<HTMLDivElement | null>(null);
  const [celebratingNodeId, setCelebratingNodeId] = useState<S08ChangeableAccountId | null>(null);
  const [browserHighlighted, setBrowserHighlighted] = useState(false);
  const sourceNetwork = useMemo(
    () => network ?? createCompletedS02Network(),
    [network],
  );
  const protectionRiskModel = useMemo(
    () =>
      resumeState === undefined
        ? createS08ProtectionRiskModel(sourceNetwork, plan)
        : createS08ProtectionRiskModelFromResumeState(resumeState),
    [plan, resumeState, sourceNetwork],
  );
  const newAccountDurations = newAccountMotionDurations();
  const [state, send] = useMachine(s08Machine, {
    input: {
      recommendedAccountIds,
      initialStage,
      phaseDurationMs: replayDuration(),
      protectionResolutionDurationMs: protectionResolutionDuration(),
      reductionDurationMs: accountReductionDuration(),
      newAccountShieldDelayMs: newAccountDurations.shieldDelayMs,
      newAccountConnectionDelayMs: newAccountDurations.connectionDelayMs,
      networkReturnDelayMs: newAccountDurations.networkReturnDelayMs,
      riskModel: protectionRiskModel,
    },
  });
  const preparationVisible =
    state.matches('protection') || state.matches('protectionDissolving');
  const firstPathStep = useMemo(
    () => planStep(plan, 's06-step-campusgram-master-campus'),
    [plan],
  );
  const secondPathStep = useMemo(
    () => planStep(plan, 's06-step-campusgram-campus-email'),
    [plan],
  );
  const thirdPathStep = useMemo(
    () => planStep(plan, 's06-step-master-campus-campus-email'),
    [plan],
  );
  const replaySteps = useMemo(
    () => {
      const plannedSteps = [firstPathStep, secondPathStep, thirdPathStep].filter(
        (step): step is PasswordConsequencePlanStep => step !== null,
      );
      return plannedSteps.length === 3 ? plannedSteps : authoredReplaySteps(sourceNetwork);
    },
    [firstPathStep, secondPathStep, sourceNetwork, thirdPathStep],
  );
  const replayPhase = state.matches('incidentAttack')
    ? 'attack'
    : state.matches('attackReady')
      ? 'ready'
      : 'complete';
  const replayBaseNetwork = useMemo(
    () => createProtectedS08Network(sourceNetwork, replayPhase),
    [replayPhase, sourceNetwork],
  );
  const triangleNetwork = useMemo(
    () => createS06BlockedReplayTriangle(replayBaseNetwork, replaySteps),
    [replayBaseNetwork, replaySteps],
  );
  const preparationNetwork = useMemo(() => {
    const protectionNetwork = createS08ProtectionNetwork(
      sourceNetwork,
      state.context.protectedAccountIds,
      state.context.riskModel,
    );
    const networkWithBlockedConnections = createS06BlockedReplayTriangle(
      protectionNetwork,
      blockedS08ProtectionSteps(
        state.context.riskModel,
        state.context.protectedAccountIds,
        replaySteps,
      ),
    );
    return {
      ...networkWithBlockedConnections,
      accessibleSummary: protectionNetwork.accessibleSummary,
    };
  }, [
    replaySteps,
    sourceNetwork,
    state.context.protectedAccountIds,
    state.context.riskModel,
  ]);
  const studyScaleNetwork = useMemo(
    () =>
      createExpandedS09AccountNetwork(
        triangleNetwork,
        s09PasswordSummaryContent.scaling.studyAccountCount,
      ),
    [triangleNetwork],
  );
  const reducingNetwork = useMemo(
    () =>
      createExpandedS09AccountNetwork(
        triangleNetwork,
        s09PasswordSummaryContent.scaling.studyAccountCount,
        s09PasswordSummaryContent.scaling.accountCount,
      ),
    [triangleNetwork],
  );
  const conservativeScaleNetwork = useMemo(
    () =>
      createExpandedS09AccountNetwork(
        triangleNetwork,
        s09PasswordSummaryContent.scaling.accountCount,
      ),
    [triangleNetwork],
  );
  const scalingComparisonResults = useMemo(
    () =>
      createS09ScalingComparisonResults(
        conservativeScaleNetwork,
        s09PasswordSummaryContent.scaling.riskFindingShare,
      ),
    [conservativeScaleNetwork],
  );
  const scalingRiskNetwork = useMemo(
    () =>
      createS09ScalingRiskNetwork(
        conservativeScaleNetwork,
        scalingComparisonResults,
      ),
    [conservativeScaleNetwork, scalingComparisonResults],
  );
  const returnedManagerNetwork = useMemo(
    () =>
      createS13MyShopNetwork(
        scalingRiskNetwork.network,
        s13PasswordManagerPracticeContent.network.accountLabel,
        s13PasswordManagerPracticeContent.network.accountDescription,
        s13PasswordManagerPracticeContent.network.existingAccount.label,
        s13PasswordManagerPracticeContent.network.existingAccount.description,
        'network',
      ),
    [scalingRiskNetwork.network],
  );
  const newAccountRevealedNetwork = useMemo(
    () =>
      createS13MyShopNetwork(
        scalingRiskNetwork.network,
        s13PasswordManagerPracticeContent.network.accountLabel,
        s13PasswordManagerPracticeContent.network.accountDescription,
        s13PasswordManagerPracticeContent.network.existingAccount.label,
        s13PasswordManagerPracticeContent.network.existingAccount.description,
        'revealed',
      ),
    [scalingRiskNetwork.network],
  );
  const newAccountShieldedNetwork = useMemo(
    () =>
      createS13MyShopNetwork(
        scalingRiskNetwork.network,
        s13PasswordManagerPracticeContent.network.accountLabel,
        s13PasswordManagerPracticeContent.network.accountDescription,
        s13PasswordManagerPracticeContent.network.existingAccount.label,
        s13PasswordManagerPracticeContent.network.existingAccount.description,
        'shielded',
      ),
    [scalingRiskNetwork.network],
  );
  const managerPracticeNetwork = useMemo(
    () =>
      createS13MyShopNetwork(
        scalingRiskNetwork.network,
        s13PasswordManagerPracticeContent.network.accountLabel,
        s13PasswordManagerPracticeContent.network.accountDescription,
        s13PasswordManagerPracticeContent.network.existingAccount.label,
        s13PasswordManagerPracticeContent.network.existingAccount.description,
        'connected',
      ),
    [scalingRiskNetwork.network],
  );
  const scalingFindingNodeDelayMs = useMemo(
    () =>
      Object.values(scalingRiskNetwork.edgeRevealDelaysMs).reduce<number>(
        (latestDelay, delay) => Math.max(latestDelay, delay ?? 0),
        0,
      ) + 260,
    [scalingRiskNetwork.edgeRevealDelaysMs],
  );
  const projectedNetwork = useMemo(
    () => {
      if (preparationVisible) {
        return preparationNetwork;
      }
      if (state.matches('managerPracticeNetworkReturn')) {
        return returnedManagerNetwork;
      }
      if (state.matches('managerPracticeNewAccountReveal')) {
        return newAccountRevealedNetwork;
      }
      if (state.matches('managerPracticeNewAccountShield')) {
        return newAccountShieldedNetwork;
      }
      if (state.hasTag('s13-network')) {
        return managerPracticeNetwork;
      }
      if (state.matches('s09Expansion')) {
        return studyScaleNetwork;
      }
      if (state.matches('s09Reduction')) {
        return reducingNetwork;
      }
      if (
        state.matches('passWoDifficulty') ||
        state.matches('passWoWorkarounds') ||
        state.matches('passWoRisks') ||
        state.matches('passWoSolution') ||
        state.matches('managerTransition') ||
        state.matches('managerLesson') ||
        state.matches('managerPractice')
      ) {
        return scalingRiskNetwork.network;
      }
      if (state.hasTag('expanded')) {
        return conservativeScaleNetwork;
      }
      if (
        state.matches('attackReady') ||
        state.matches('triangleAnimating') ||
        state.matches('replayComplete') ||
        state.hasTag('s09')
      ) {
        return triangleNetwork;
      }
      return replayBaseNetwork;
    },
    [
      preparationVisible,
      conservativeScaleNetwork,
      managerPracticeNetwork,
      newAccountRevealedNetwork,
      newAccountShieldedNetwork,
      returnedManagerNetwork,
      preparationNetwork,
      replayBaseNetwork,
      reducingNetwork,
      scalingRiskNetwork,
      state,
      studyScaleNetwork,
      triangleNetwork,
    ],
  );
  const [adapter] = useState(() => new ReactFlowNetworkAdapter(projectedNetwork));
  useLayoutEffect(() => {
    adapter.render(projectedNetwork);
  }, [adapter, projectedNetwork]);
  const bankFocusVisible =
    state.matches('managerPracticeExistingAccountRelation') ||
    state.matches('managerPracticeExistingAccountReplace') ||
    state.matches('managerPracticeBrowserPrompt') ||
    state.matches('complete');
  const presentationHighlightedNodeId = state.hasTag('s13-new-account')
    ? 'my-shop'
    : bankFocusVisible
      ? 'muster-bank'
      : null;
  const presentationDrawsTriangle = state.matches('triangleAnimating');
  const presentation = useMemo(
    () => {
      const base = staticNetworkPresentation(projectedNetwork);
      if (presentationHighlightedNodeId !== null) {
        return { ...base, highlightedNodeId: presentationHighlightedNodeId };
      }
      if (presentationDrawsTriangle) {
        return {
          ...base,
          drawingTargetNodeIds: [
            's06-step-campusgram-master-campus-shield',
            's06-step-campusgram-campus-email-shield',
            's06-step-master-campus-campus-email-shield',
          ],
        };
      }
      return base;
    },
    [
      presentationDrawsTriangle,
      presentationHighlightedNodeId,
      projectedNetwork,
    ],
  );
  const actionLabels = useMemo(
    () => ({
      ...(projectedNetwork.nodes.some(
        ({ id, selectable }) => id === 'master-campus' && selectable,
      )
        ? { 'master-campus': s08NetworkReplayContent.protectionAction }
        : {}),
      ...(projectedNetwork.nodes.some(
        ({ id, selectable }) => id === 'campus-email' && selectable,
      )
        ? { 'campus-email': s08NetworkReplayContent.protectionAction }
        : {}),
    }),
    [projectedNetwork],
  );
  const incidentAttackRunning = state.matches('incidentAttack');
  const pathReplayRunning = state.matches('triangleAnimating');
  const replayRunning = incidentAttackRunning || pathReplayRunning;
  const replayReady = state.matches('attackReady');
  const replayComplete = state.matches('replayComplete');
  const summaryVisible = state.matches('s09Summary');
  const scalingFindingsRevealing = state.matches('passWoDifficulty');
  const scalingFindingsVisible =
    scalingFindingsRevealing ||
    state.matches('passWoWorkarounds') ||
    state.matches('passWoRisks') ||
    state.matches('passWoSolution') ||
    state.matches('managerTransition') ||
    state.matches('managerLesson') ||
    state.hasTag('s13-network');
  const scalingFindingTagsVisible =
    scalingFindingsVisible && !state.hasTag('s13-network');
  const releasingAccountIds = (
    ['master-campus', 'campus-email'] as const
  ).filter((accountId) => {
    const resolvingAccountId = state.context.resolvingAccountId;
    if (
      resolvingAccountId === null ||
      !s08AccountHasOpenActionNeed(
        state.context.riskModel,
        state.context.protectedAccountIds,
        accountId,
      )
    ) {
      return false;
    }
    return !s08AccountHasOpenActionNeed(
      state.context.riskModel,
      [...state.context.protectedAccountIds, resolvingAccountId],
      accountId,
    );
  });
  const releasingLocalFindingAccountIds = releasingAccountIds.filter((accountId) =>
    state.context.riskModel.localFindingAccountIds.includes(accountId),
  );
  const easyToGuessAccountIds = useMemo(
    () =>
      state.context.riskModel.localFindingAccountIds.filter(
        (accountId) =>
          accountId !== 'campusgram' &&
          !state.context.protectedAccountIds.includes(accountId),
      ),
    [state.context.protectedAccountIds, state.context.riskModel],
  );
  const passWoStep = state.matches('s09Intro')
    ? 0
    : state.matches('s09Expansion')
      ? 1
      : state.matches('s09Reduction') || state.matches('s09Question')
        ? 2
        : state.matches('passWoDifficulty')
          ? 3
          : state.matches('passWoWorkarounds')
            ? 4
            : state.matches('passWoRisks')
              ? 5
              : state.matches('passWoSolution')
                ? 6
                : null;
  const s13NetworkSpeech = state.matches('managerPracticeNewAccountConnections')
    ? {
        id: 's13-network-new-account',
        text: s13PasswordManagerPracticeContent.network.guide.newAccount,
      }
    : state.matches('managerPracticeExistingAccount')
      ? {
          id: 's13-network-existing-account',
          text: s13PasswordManagerPracticeContent.network.guide.existingAccount,
        }
      : state.matches('managerPracticeExistingAccountUnchanged')
        ? {
            id: 's13-network-unchanged',
            text: s13PasswordManagerPracticeContent.network.guide.unchangedAtService,
          }
        : state.matches('managerPracticeExistingAccountRelation')
          ? {
              id: 's13-network-reused-password',
              text: s13PasswordManagerPracticeContent.network.guide.reusedPassword,
            }
          : state.matches('managerPracticeExistingAccountReplace')
            ? {
                id: 's13-network-replace-at-service',
                text: s13PasswordManagerPracticeContent.network.guide.replaceAtService,
              }
            : state.matches('managerPracticeBrowserPrompt')
              ? {
                  id: 's13-network-reopen-browser',
                  text: s13PasswordManagerPracticeContent.network.guide.reopenBrowser,
                }
              : null;
  const s13NetworkStep = state.matches('managerPracticeNewAccountReveal')
    ? 'new-account-reveal'
    : state.matches('managerPracticeNetworkReturn')
      ? 'network-return'
      : state.matches('managerPracticeNewAccountShield')
      ? 'new-account-shield'
      : state.matches('managerPracticeNewAccountConnections')
        ? 'new-account-connections'
        : state.matches('managerPracticeExistingAccount')
          ? 'existing-account'
          : state.matches('managerPracticeExistingAccountUnchanged')
            ? 'existing-account-unchanged'
            : state.matches('managerPracticeExistingAccountRelation')
              ? 'existing-account-relation'
              : state.matches('managerPracticeExistingAccountReplace')
                ? 'existing-account-replace'
                : state.matches('managerPracticeBrowserPrompt')
                  ? 'browser-reopen'
                  : undefined;
  const s13FocusTarget = state.hasTag('s13-new-account')
    ? 'my-shop'
    : bankFocusVisible
      ? 'muster-bank'
      : undefined;
  const importedVaultVisible =
    state.hasTag('s13-existing-account') ||
    state.matches('managerPracticeBrowserPrompt') ||
    state.matches('complete');
  const browserReopenPrompt = state.matches('managerPracticeBrowserPrompt');

  const handleNetworkNodeSelect = useCallback(
    (nodeId: string) => {
      if (!preparationVisible) return;
      const accountId = changeableAccountId(nodeId);
      if (accountId === null || actionLabels[accountId] === undefined) return;
      setCelebratingNodeId(accountId);
      send({ type: 'PROTECT_WITH_UNIQUE_PASSPHRASE', accountId });
    },
    [actionLabels, preparationVisible, send],
  );

  useEffect(() => {
    if (
      pathReplayRunning &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      send({ type: 'TRIANGLE_ANIMATION_COMPLETE' });
    }
  }, [pathReplayRunning, send]);

  const completionNotifiedRef = useRef(false);
  useEffect(() => {
    if (!state.matches('complete') || completionNotifiedRef.current) return;
    completionNotifiedRef.current = true;
    onComplete?.();
  }, [onComplete, state]);

  const managerTransitionVisible = state.matches('managerTransition');
  const managerPracticeVisible = state.matches('managerPractice');

  return (
    <div className={styles.stageStack}>
      <section
        className={styles.training}
        aria-hidden={managerTransitionVisible || managerPracticeVisible || undefined}
        aria-label={
          state.hasTag('s13-network')
            ? s13PasswordManagerPracticeContent.trainingAriaLabel
            : state.hasTag('manager') || state.hasTag('manager-transition')
              ? s12PasswordManagerContent.trainingAriaLabel
              : state.hasTag('s09')
                ? s09PasswordSummaryContent.trainingAriaLabel
                : s08NetworkReplayContent.trainingAriaLabel
        }
        data-replay-phase={
          preparationVisible
            ? 'protection'
            : state.matches('triangleAnimating')
              ? 'triangle'
              : replayPhase
        }
        data-s09-expanded={
          state.hasTag('expanded') ||
          state.matches('managerLesson') ||
          undefined
        }
        data-s09-expanding={state.matches('s09Expansion') || undefined}
        data-s09-reducing={state.hasTag('reducing') || undefined}
        data-manager-active={state.matches('managerLesson') || undefined}
        data-s13-browser-active={state.matches('managerPractice') || undefined}
        data-s13-network-step={s13NetworkStep}
        data-s13-focus={s13FocusTarget}
        data-s13-network-dimmed={
          state.matches('managerPractice') || state.hasTag('s13-network') || undefined
        }
        data-s08-resolving-account={state.context.resolvingAccountId ?? undefined}
        data-s08-releasing-master-campus={
          releasingAccountIds.includes('master-campus') || undefined
        }
        data-s08-releasing-campus-email={
          releasingAccountIds.includes('campus-email') || undefined
        }
        data-s08-releasing-local-finding-master-campus={
          releasingLocalFindingAccountIds.includes('master-campus') || undefined
        }
        data-s08-releasing-local-finding-campus-email={
          releasingLocalFindingAccountIds.includes('campus-email') || undefined
        }
      >
        <DesktopSurface
          platform={platform}
          browserDock={{
            active: false,
            enabled: browserHighlighted || browserReopenPrompt,
            highlighted: browserHighlighted || browserReopenPrompt,
            label:
              browserHighlighted || browserReopenPrompt
                ? 'Browser für die Übung öffnen'
                : 'Browser geschlossen',
            ...(browserHighlighted || browserReopenPrompt
              ? {
                  onClick: () => {
                    if (browserReopenPrompt) {
                      send({ type: 'OPEN_BROWSER' });
                      return;
                    }
                    setBrowserHighlighted(false);
                    send({ type: 'OPEN_BROWSER' });
                  },
                }
              : {}),
          }}
        >
        <div
          ref={networkHostRef}
          className={styles.network}
          onAnimationEndCapture={(event) => {
            if (
              pathReplayRunning &&
              event.target instanceof SVGPathElement &&
              event.target.matches('[data-network-edge-draw-mask]')
            ) {
              send({ type: 'TRIANGLE_ANIMATION_COMPLETE' });
            }
          }}
        >
          <AccountAssessmentNetwork
            adapter={adapter}
            presentation={presentation}
            ariaLabel={projectedNetwork.accessibleSummary}
            attackPhase={pathReplayRunning ? 'attacking' : 'incident-check'}
            attackerAccountId={replayRunning || replayComplete ? 'campusgram' : null}
            attackerAttemptStatus={replayRunning || replayComplete ? 'protected' : null}
            attackTargetId={replayRunning || replayComplete ? 'campusgram' : null}
            attackBlocked={replayRunning || replayComplete}
            attackEdgeId={null}
            {...(scalingFindingsRevealing
              ? { statusCascadeStartDelayMs: scalingFindingNodeDelayMs }
              : {})}
            showAccountShields
            easyToGuessAccountIds={
              scalingFindingsVisible
                ? scalingRiskNetwork.easyToGuessAccountIds
                : easyToGuessAccountIds
            }
            overview={state.hasTag('expanded')}
            {...(scalingFindingTagsVisible
              ? {
                  comparisonResults: scalingComparisonResults,
                  comparisonResultsAriaHidden: true,
                  comparisonResultsCompact: true,
                  edgeRevealDelaysMs: scalingRiskNetwork.edgeRevealDelaysMs,
                  animateEdgeReveals: scalingFindingsRevealing,
                  ...(scalingFindingsRevealing
                    ? {
                        comparisonResultsSequential: true,
                      }
                    : {}),
                }
              : {})}
            celebratingNodeId={celebratingNodeId}
            interactionDisabled={!state.matches('protection')}
            nodeActionLabels={actionLabels}
            showEdgeLabels={preparationVisible}
            onNodeSelect={handleNetworkNodeSelect}
          />
          {replayComplete ? (
            <div className={styles.completionMoment} role="status" aria-live="polite">
              <CelebrationConfetti />
              <strong>{s08NetworkReplayContent.replayCompletion}</strong>
            </div>
          ) : null}
        </div>
        {importedVaultVisible ? (
          <S13ImportedVault
            highlighted={state.matches('managerPracticeExistingAccount')}
          />
        ) : null}
        {replayReady ? (
          <button
            type="button"
            className={styles.replayAction}
            autoFocus
            onClick={() => {
              setCelebratingNodeId(null);
              send({ type: 'NEXT' });
            }}
          >
            {s08NetworkReplayContent.replayActions.attack}
          </button>
        ) : replayRunning ? null : replayComplete ? (
          <button
            type="button"
            className={styles.replayAction}
            autoFocus
            onClick={() => send({ type: 'NEXT' })}
          >
            {s08NetworkReplayContent.replayActions.finish}
          </button>
        ) : summaryVisible ? (
          <>
            <div className={styles.summaryDim} aria-hidden="true" />
            <section
              className={styles.summary}
              aria-label={s09PasswordSummaryContent.trainingAriaLabel}
            >
              <h1>{s09PasswordSummaryContent.title}</h1>
              <div className={styles.summaryOverview}>
                <img
                  className={styles.summaryShield}
                  src={greenShieldAsset}
                  width={512}
                  height={768}
                  alt=""
                  aria-hidden="true"
                />
                <ul className={styles.principles}>
                  {s09PasswordSummaryContent.principles.map((principle) => (
                    <li key={principle.id}>
                      <span>
                        {principle.parts.map((part, index) => {
                          if (part.emphasis === 'strong') {
                            return <strong key={index}>{part.text}</strong>;
                          }
                          if (part.emphasis === 'positive-strong') {
                            return (
                              <strong key={index} className={styles.principlePositive}>
                                {part.text}
                              </strong>
                            );
                          }
                          if (part.emphasis === 'info') {
                            return (
                              <span key={index} className={styles.principleInfo}>
                                {part.text}
                              </span>
                            );
                          }
                          return <span key={index}>{part.text}</span>;
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                <img
                  className={styles.summaryShield}
                  src={blueShieldAsset}
                  width={512}
                  height={768}
                  alt=""
                  aria-hidden="true"
                />
              </div>
              <button
                type="button"
                className={styles.summaryAction}
                autoFocus
                onClick={() => send({ type: 'NEXT' })}
              >
                {s09PasswordSummaryContent.finishAction}
              </button>
            </section>
          </>
        ) : s13NetworkSpeech !== null ? (
          <section
            className={styles.passWoScene}
            aria-label="PassWo erklärt neue und bestehende Konten im Passwortmanager"
          >
            <PassWoGuide
              guideName={s13PasswordManagerPracticeContent.guide.name}
              taskLabel="Passwortmanager"
              helpOpen
              helpId="s13-network-speech"
              openHelpLabel="PassWo-Hinweis öffnen"
              speech={[s13NetworkSpeech.text]}
              speechEmphasis={passWoSpeechEmphasisFor(s13NetworkSpeech.id)}
              speechKey={s13NetworkSpeech.id}
              speechObstacleSelector="[data-s13-import-vault]"
              {...(browserReopenPrompt
                ? {}
                : {
                    speechAction: {
                      kind: 'advance' as const,
                      label: 'Weiter',
                      onAction: () => send({ type: 'NEXT' }),
                    },
                  })}
              placement="bottom-left"
              showHelpButton={false}
            />
          </section>
        ) : passWoStep !== null ? (
          <>
            <div className={styles.s09Dim} aria-hidden="true" />
            <section
              className={styles.passWoScene}
              aria-label="PassWo erklärt den Übergang zum Passwortmanager"
            >
              <PassWoGuide
                guideName={s09PasswordSummaryContent.passWo.guideName}
                taskLabel="Passwortmanager"
                helpOpen
                helpId="s09-passwo-speech"
                openHelpLabel="PassWo-Hinweis öffnen"
                speech={[s09PasswordSummaryContent.passWo.steps[passWoStep]]}
                speechEmphasis={
                  passWoSpeechEmphasisFor(
                    [
                      's09-scaling-intro',
                      's09-scaling-expansion',
                      's09-scaling-question',
                      's09-scaling-difficulty',
                      's09-scaling-workarounds',
                      's09-scaling-risks',
                      's09-scaling-solution',
                    ][passWoStep] ?? '',
                  )
                }
                speechKey={`s09-${passWoStep}`}
                {...(state.matches('s09Reduction') || state.matches('passWoSolution')
                  ? {}
                  : {
                      speechAction:
                        passWoStep === 2
                          ? {
                              kind: 'perform',
                              label: s09PasswordSummaryContent.scaling.answer,
                              onAction: () => send({ type: 'ANSWER_SELECTED' }),
                            }
                          : {
                              kind: 'advance',
                              label: 'Weiter',
                              onAction: () => send({ type: 'NEXT' }),
                            },
                    })}
                placement="bottom-left"
                showHelpButton={false}
              />
            </section>
            {state.matches('passWoSolution') ? (
              <button
                type="button"
                className={styles.passwordManagerAction}
                autoFocus
                aria-label={s09PasswordSummaryContent.passwordManagerAction.ariaLabel}
                onClick={() => send({ type: 'NEXT' })}
              >
                <strong>{s09PasswordSummaryContent.passwordManagerAction.title}</strong>
                <span>{s09PasswordSummaryContent.passwordManagerAction.detail}</span>
              </button>
            ) : null}
          </>
        ) : null}
        {state.matches('managerLesson') ? (
          <S12PasswordManagerTraining
            displayName={displayName}
            onBrowserHighlightChange={setBrowserHighlighted}
          />
        ) : null}
        </DesktopSurface>
      </section>
      {managerTransitionVisible ? (
        <div className={styles.stageOverlay}>
          <SectionTransition
            sectionLabel={s09PasswordSummaryContent.passwordManagerTransition.sectionLabel}
            title={s09PasswordSummaryContent.passwordManagerTransition.title}
            currentSection={2}
            totalSections={3}
            parts={s09PasswordSummaryContent.passwordManagerTransition.parts}
            currentPart={1}
            holdDurationMs={s09PasswordSummaryContent.passwordManagerTransition.holdDurationMs}
            onComplete={() => send({ type: 'TRANSITION_COMPLETE' })}
          />
        </div>
      ) : null}
      {managerPracticeVisible ? (
        <div className={styles.stageOverlay}>
          <S13PasswordManagerPractice
            displayName={displayName}
            {...(resumeState === undefined
              ? {}
              : { passphraseIds: resumeState.passphraseIds })}
            platform={platform}
            onBrowserClosed={() => send({ type: 'S13_BROWSER_CLOSED' })}
          />
        </div>
      ) : null}
    </div>
  );
}
