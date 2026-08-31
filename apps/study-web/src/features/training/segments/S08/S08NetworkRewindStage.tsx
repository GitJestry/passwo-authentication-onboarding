import type {
  S06AccountId,
  SupportivePostS08SegmentId,
  SupportiveS08ResumeState,
} from '@passwo/contracts';
import {
  s08NetworkReplayContent,
  s09PasswordSummaryContent,
  s12PasswordManagerContent,
  s13PasswordManagerPracticeContent,
  s15ToS17MfaConclusionContent,
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
import { useInitialFocus } from '../../../../app/useInitialFocus.js';
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
import { S13MusterBankPasswordChange } from '../S13/S13MusterBankPasswordChange.js';
import { S13CampusgramManualLogin } from '../S13/S13CampusgramManualLogin.js';
import {
  S13MfaTransition,
  S13PasswordManagerConclusion,
  type S13PasswordManagerVariant,
} from '../S13/S13PasswordManagerConclusion.js';
import { S13PasswordManagerPractice } from '../S13/S13PasswordManagerPractice.js';
import { S14MfaIntroduction } from '../S14/S14MfaIntroduction.js';
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
  createS13BankProtectedNetwork,
  createS13BankShieldedNetwork,
  createS13FullyProtectedNetwork,
  createS13MfaIncidentNetwork,
  createS13MyShopNetwork,
  createS13PasswordRepairNetwork,
  createS14MfaProtectedNetwork,
  s08AccountHasOpenActionNeed,
  s08HasOpenActionNeed,
  type S08ProtectionRiskModel,
  staticNetworkPresentation,
} from '../account-network.js';
import styles from './S08NetworkRewindStage.module.css';

export type S08ChangeableAccountId = Exclude<S06AccountId, 'campusgram'>;

export type S08NetworkRewindInitialStage =
  | 's08'
  | 's09'
  | 's10'
  | 's11'
  | 's12'
  | 'manager'
  | 's13'
  | 's13-network'
  | 's13-bank'
  | 's13-campusgram'
  | 's13-conclusion'
  | 's14'
  | 's15'
  | 's16'
  | 's17';

interface S08Context {
  readonly initialStage: S08NetworkRewindInitialStage;
  readonly phaseDurationMs: number;
  readonly protectionResolutionDurationMs: number;
  readonly reductionDurationMs: number;
  readonly newAccountShieldDelayMs: number;
  readonly newAccountConnectionDelayMs: number;
  readonly networkReturnDelayMs: number;
  readonly conclusionFadeDurationMs: number;
  readonly recoveryRevealDelayMs: number;
  readonly networkRepairDurationMs: number;
  readonly mfaIncidentDelayMs: number;
  readonly mfaResultCelebrationDurationMs: number;
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
  | { readonly type: 'S13_BANK_BROWSER_CLOSED' }
  | { readonly type: 'S13_CAMPUSGRAM_COMPLETED' }
  | {
      readonly type: 'S13_VARIANT_SELECTED';
      readonly variant: S13PasswordManagerVariant;
    }
  | { readonly type: 'S13_REPAIR_ALL_PASSWORDS' }
  | { readonly type: 'S13_FINISH' }
  | { readonly type: 'S14_BROWSER_CLOSED' }
  | { readonly type: 'S16_EXPAND_PROTECTION' }
  | { readonly type: 'S17_FINISH' }
  | { readonly type: 'NEXT' };

const s08Machine = setup({
  types: {
    context: {} as S08Context,
    events: {} as S08Event,
    input: {} as {
      readonly recommendedAccountIds: readonly S08ChangeableAccountId[];
      readonly initialStage: S08NetworkRewindInitialStage;
      readonly phaseDurationMs: number;
      readonly protectionResolutionDurationMs: number;
      readonly reductionDurationMs: number;
      readonly newAccountShieldDelayMs: number;
      readonly newAccountConnectionDelayMs: number;
      readonly networkReturnDelayMs: number;
      readonly conclusionFadeDurationMs: number;
      readonly recoveryRevealDelayMs: number;
      readonly networkRepairDurationMs: number;
      readonly mfaIncidentDelayMs: number;
      readonly mfaResultCelebrationDurationMs: number;
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
    conclusionFadeDuration: ({ context }) => context.conclusionFadeDurationMs,
    recoveryRevealDelay: ({ context }) => context.recoveryRevealDelayMs,
    networkRepairDuration: ({ context }) => context.networkRepairDurationMs,
    mfaIncidentDelay: ({ context }) => context.mfaIncidentDelayMs,
    mfaResultCelebrationDuration: ({ context }) =>
      context.mfaResultCelebrationDurationMs,
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
    startsAtS10: ({ context }) => context.initialStage === 's10',
    startsAtS11: ({ context }) => context.initialStage === 's11',
    startsAtS12: ({ context }) => context.initialStage === 's12',
    startsAtManager: ({ context }) => context.initialStage === 'manager',
    startsAtS13: ({ context }) => context.initialStage === 's13',
    startsAtS13Network: ({ context }) => context.initialStage === 's13-network',
    startsAtS13Bank: ({ context }) => context.initialStage === 's13-bank',
    startsAtS13Campusgram: ({ context }) => context.initialStage === 's13-campusgram',
    startsAtS13Conclusion: ({ context }) =>
      context.initialStage === 's13-conclusion',
    startsAtS14: ({ context }) => context.initialStage === 's14',
    startsAtS15: ({ context }) => context.initialStage === 's15',
    startsAtS16: ({ context }) => context.initialStage === 's16',
    startsAtS17: ({ context }) => context.initialStage === 's17',
    selectedIntegrated: ({ event }) =>
      event.type === 'S13_VARIANT_SELECTED' && event.variant === 'integrated',
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
    conclusionFadeDurationMs: input.conclusionFadeDurationMs,
    recoveryRevealDelayMs: input.recoveryRevealDelayMs,
    networkRepairDurationMs: input.networkRepairDurationMs,
    mfaIncidentDelayMs: input.mfaIncidentDelayMs,
    mfaResultCelebrationDurationMs: input.mfaResultCelebrationDurationMs,
    protectedAccountIds:
      input.initialStage === 's08' ? [] : [...input.recommendedAccountIds],
    resolvingAccountId: null,
    riskModel: input.riskModel,
  }),
  states: {
    entry: {
      always: [
        { guard: 'startsAtS17', target: 's17HowTo' },
        { guard: 'startsAtS16', target: 's16Effort' },
        { guard: 'startsAtS15', target: 's15ResultCelebration' },
        { guard: 'startsAtS14', target: 'conclusionMfaSectionTransition' },
        {
          guard: 'startsAtS13Conclusion',
          target: 'conclusionRemainingAccountsIntro',
        },
        { guard: 'startsAtS13Campusgram', target: 'managerPracticeCampusgram' },
        { guard: 'startsAtS13Bank', target: 'managerPracticeBank' },
        { guard: 'startsAtS13Network', target: 'managerPracticeNetworkReturn' },
        { guard: 'startsAtS13', target: 'managerNewAccountTransition' },
        { guard: 'startsAtS12', target: 'managerTransition' },
        { guard: 'startsAtManager', target: 'managerTransition' },
        { guard: 'startsAtS11', target: 's09Expansion' },
        { guard: 'startsAtS10', target: 's09Intro' },
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
      on: { OPEN_BROWSER: { target: 'managerNewAccountTransition' } },
    },
    managerNewAccountTransition: {
      tags: ['manager', 'expanded'],
      on: { TRANSITION_COMPLETE: { target: 'managerPractice' } },
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
      on: { OPEN_BROWSER: { target: 'managerExistingAccountTransition' } },
    },
    managerExistingAccountTransition: {
      tags: ['manager', 'expanded', 's13-network'],
      on: { TRANSITION_COMPLETE: { target: 'managerPracticeBank' } },
    },
    managerPracticeBank: {
      tags: ['manager', 'expanded'],
      on: {
        S13_BANK_BROWSER_CLOSED: {
          target: 'managerPracticeBankRelationDissolving',
        },
      },
    },
    managerPracticeBankRelationDissolving: {
      tags: ['manager', 'expanded', 's13-network', 's13-bank-result'],
      after: {
        newAccountShieldDelay: {
          target: 'managerPracticeBankProtectionReveal',
        },
      },
    },
    managerPracticeBankProtectionReveal: {
      tags: ['manager', 'expanded', 's13-network', 's13-bank-result'],
      after: {
        newAccountConnectionDelay: {
          target: 'managerPracticeBankProtected',
        },
      },
    },
    managerPracticeBankProtected: {
      tags: ['manager', 'expanded', 's13-network', 's13-bank-result'],
      on: { NEXT: { target: 'managerPracticeCampusgramPrompt' } },
    },
    managerPracticeCampusgramPrompt: {
      tags: ['manager', 'expanded', 's13-network', 's13-bank-result'],
      on: { OPEN_BROWSER: { target: 'managerPracticeCampusgram' } },
    },
    managerPracticeCampusgram: {
      tags: ['manager', 'expanded'],
      on: {
        S13_CAMPUSGRAM_COMPLETED: { target: 'conclusionRemainingAccountsIntro' },
      },
    },
    conclusionRemainingAccountsIntro: {
      tags: ['manager', 'expanded', 's13-network', 's13-conclusion-clear'],
      on: { NEXT: { target: 'conclusionRemainingAccountsPace' } },
    },
    conclusionRemainingAccountsPace: {
      tags: ['manager', 'expanded', 's13-network', 's13-conclusion-clear'],
      on: { NEXT: { target: 'conclusionNetworkOverview' } },
    },
    conclusionNetworkOverview: {
      tags: ['manager', 'expanded', 's13-network', 's13-conclusion-clear'],
      on: {
        S13_REPAIR_ALL_PASSWORDS: { target: 'conclusionNetworkRepairing' },
      },
    },
    conclusionNetworkRepairing: {
      tags: ['manager', 'expanded', 's13-network', 's13-conclusion-clear'],
      after: { networkRepairDuration: { target: 'conclusionNetworkRepaired' } },
    },
    conclusionNetworkRepaired: {
      tags: ['manager', 'expanded', 's13-network', 's13-conclusion-clear'],
      on: { NEXT: { target: 'conclusionVariantReturn' } },
    },
    conclusionVariantReturn: {
      tags: ['manager', 'expanded', 's13-network', 's13-conclusion-clear'],
      on: { NEXT: { target: 'conclusionNetworkFade' } },
    },
    conclusionNetworkFade: {
      tags: ['manager', 'expanded', 's13-network', 's13-conclusion-clear'],
      after: {
        conclusionFadeDuration: { target: 'conclusionVariantFit' },
      },
    },
    conclusionVariantFit: {
      tags: ['manager', 'expanded', 's13-conclusion-overlay'],
      on: { NEXT: { target: 'conclusionVariantQuestion' } },
    },
    conclusionVariantQuestion: {
      tags: ['manager', 'expanded', 's13-conclusion-overlay'],
      on: {
        S13_VARIANT_SELECTED: [
          {
            guard: 'selectedIntegrated',
            target: 'conclusionVariantSelectedIntegrated',
          },
          { target: 'conclusionVariantSelectedSeparate' },
        ],
      },
    },
    conclusionVariantSelectedIntegrated: {
      tags: ['manager', 'expanded', 's13-conclusion-overlay'],
      after: {
        recoveryRevealDelay: { target: 'conclusionRecoveryLost' },
      },
    },
    conclusionVariantSelectedSeparate: {
      tags: ['manager', 'expanded', 's13-conclusion-overlay'],
      after: {
        recoveryRevealDelay: { target: 'conclusionRecoveryLost' },
      },
    },
    conclusionRecoveryLost: {
      tags: ['manager', 'expanded', 's13-conclusion-overlay'],
      on: { NEXT: { target: 'conclusionRecoveryPath' } },
    },
    conclusionRecoveryPath: {
      tags: ['manager', 'expanded', 's13-conclusion-overlay'],
      on: { NEXT: { target: 'conclusionRecoveryRestored' } },
    },
    conclusionRecoveryRestored: {
      tags: ['manager', 'expanded', 's13-conclusion-overlay'],
      on: { NEXT: { target: 'conclusionMfaIncidentFocus' } },
    },
    conclusionMfaIncidentFocus: {
      tags: ['manager', 'expanded', 's13-network', 's13-mfa'],
      after: { mfaIncidentDelay: { target: 'conclusionMfaPasswordKnown' } },
    },
    conclusionMfaPasswordKnown: {
      tags: ['manager', 'expanded', 's13-network', 's13-mfa', 's13-mfa-preview'],
      on: { NEXT: { target: 'conclusionMfaPasswordInsufficient' } },
    },
    conclusionMfaPasswordInsufficient: {
      tags: ['manager', 'expanded', 's13-network', 's13-mfa', 's13-mfa-preview'],
      on: { NEXT: { target: 'conclusionMfaSecondHurdle' } },
    },
    conclusionMfaSecondHurdle: {
      tags: ['manager', 'expanded', 's13-network', 's13-mfa', 's13-mfa-preview'],
      on: { NEXT: { target: 'conclusionMfaTransition' } },
    },
    conclusionMfaTransition: {
      tags: ['manager', 'expanded', 's13-network', 's13-mfa', 's13-mfa-preview'],
      on: { S13_FINISH: { target: 'conclusionMfaSectionTransition' } },
    },
    conclusionMfaSectionTransition: {
      tags: ['manager', 'expanded'],
      on: { TRANSITION_COMPLETE: { target: 's14' } },
    },
    s14: {
      tags: ['s14'],
      on: { S14_BROWSER_CLOSED: { target: 's15ResultCelebration' } },
    },
    s15ResultCelebration: {
      tags: [
        'manager',
        'expanded',
        'mfa-conclusion',
        'mfa-master-chain',
        's15-result-celebration',
      ],
      after: { mfaResultCelebrationDuration: { target: 's15PasswordAlone' } },
    },
    s15PasswordAlone: {
      tags: ['manager', 'expanded', 'mfa-conclusion', 'mfa-master-chain'],
      on: { NEXT: { target: 's15SecondFactor' } },
    },
    s15SecondFactor: {
      tags: ['manager', 'expanded', 'mfa-conclusion', 'mfa-master-chain'],
      on: { NEXT: { target: 's16Effort' } },
    },
    s16Effort: {
      tags: ['manager', 'expanded', 'mfa-conclusion', 'mfa-master-chain'],
      on: { NEXT: { target: 's16Prioritization' } },
    },
    s16Prioritization: {
      tags: ['manager', 'expanded', 'mfa-conclusion', 'mfa-master-chain'],
      on: { S16_EXPAND_PROTECTION: { target: 's17HowTo' } },
    },
    s17HowTo: {
      tags: ['manager', 'expanded', 'mfa-conclusion', 'mfa-expanded-chains'],
      on: { NEXT: { target: 's17IntegratedSummary' } },
    },
    s17IntegratedSummary: {
      tags: ['manager', 'expanded', 'mfa-conclusion', 'mfa-expanded-chains'],
      on: { S17_FINISH: { target: 'complete' } },
    },
    complete: {
      tags: ['manager', 'expanded', 'mfa-conclusion', 'mfa-expanded-chains'],
    },
  },
});

export interface S08NetworkRewindStageProps {
  readonly displayName?: string;
  readonly recommendedAccountIds?: readonly S08ChangeableAccountId[];
  readonly network?: NetworkSceneSnapshot | null;
  readonly plan?: PasswordConsequenceScenePlan | null;
  readonly resumeState?: SupportiveS08ResumeState;
  readonly platform: DesktopPlatform;
  readonly initialStage?: S08NetworkRewindInitialStage;
  readonly onSegmentCheckpoint?: (
    segmentId: SupportivePostS08SegmentId,
  ) => Promise<void>;
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

function conclusionMotionDurations(): Readonly<{
  fadeDurationMs: number;
  recoveryRevealDelayMs: number;
  repairDurationMs: number;
  mfaIncidentDelayMs: number;
}> {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? {
        fadeDurationMs: 0,
        recoveryRevealDelayMs: 0,
        repairDurationMs: 0,
        mfaIncidentDelayMs: 0,
      }
    : {
        fadeDurationMs: 520,
        recoveryRevealDelayMs: 1500,
        repairDurationMs: 3600,
        mfaIncidentDelayMs: 2000,
      };
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

const passwordRepairConfettiBurstLimit = 12;

function passwordRepairConfettiNodeIds(
  network: NetworkSceneSnapshot,
): readonly string[] {
  const accountNodeIds = network.nodes
    .filter(({ kind }) => kind === 'account')
    .map(({ id }) => id);
  if (accountNodeIds.length >= passwordRepairConfettiBurstLimit) {
    return accountNodeIds.slice(0, passwordRepairConfettiBurstLimit);
  }
  const supportingNodeIds = network.nodes
    .filter(({ kind }) => kind !== 'account' && kind !== 'shield')
    .map(({ id }) => id);
  const supportingBurstLimit = Math.min(
    passwordRepairConfettiBurstLimit - accountNodeIds.length,
    supportingNodeIds.length,
  );

  const distributedSupportingNodeIds = Array.from(
    { length: supportingBurstLimit },
    (_, index) =>
      supportingNodeIds[
        Math.floor((index * supportingNodeIds.length) / supportingBurstLimit)
      ],
  ).filter((nodeId): nodeId is string => nodeId !== undefined);
  return [...accountNodeIds, ...distributedSupportingNodeIds];
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
  onSegmentCheckpoint,
  onComplete,
}: S08NetworkRewindStageProps) {
  const initialActionRef = useInitialFocus<HTMLButtonElement>();
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
  const conclusionDurations = conclusionMotionDurations();
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
      conclusionFadeDurationMs: conclusionDurations.fadeDurationMs,
      recoveryRevealDelayMs: conclusionDurations.recoveryRevealDelayMs,
      networkRepairDurationMs: conclusionDurations.repairDurationMs,
      mfaIncidentDelayMs: conclusionDurations.mfaIncidentDelayMs,
      mfaResultCelebrationDurationMs: window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
        ? s15ToS17MfaConclusionContent.timings.reducedResultConfirmationDurationMs
        : s15ToS17MfaConclusionContent.timings.resultCelebrationDurationMs,
      riskModel: protectionRiskModel,
    },
  });
  const segmentCheckpoint = state.matches('s09Summary')
    ? 'S09'
    : state.matches('s09Intro')
      ? 'S10'
      : state.matches('s09Expansion') ||
          state.matches('s09Reduction') ||
          state.matches('s09Question') ||
          state.matches('passWoDifficulty') ||
          state.matches('passWoWorkarounds') ||
          state.matches('passWoRisks') ||
          state.matches('passWoSolution')
        ? 'S11'
        : state.matches('managerTransition') || state.matches('managerLesson')
          ? 'S12'
          : state.matches('managerNewAccountTransition') ||
              state.matches('managerPractice') ||
              state.matches('managerExistingAccountTransition')
            ? 'S13'
            : state.matches('conclusionMfaSectionTransition') || state.matches('s14')
              ? 'S14'
              : state.matches('s15ResultCelebration') ||
                  state.matches('s15PasswordAlone') ||
                  state.matches('s15SecondFactor')
                ? 'S15'
                : state.matches('s16Effort') || state.matches('s16Prioritization')
                  ? 'S16'
                  : state.matches('s17HowTo') ||
                      state.matches('s17IntegratedSummary') ||
                      state.matches('complete')
                    ? 'S17'
                    : null;
  const confirmedSegmentCheckpointRef = useRef<SupportivePostS08SegmentId | null>(null);
  const requestedSegmentCheckpointRef = useRef<SupportivePostS08SegmentId | null>(null);
  const [segmentCheckpointStatus, setSegmentCheckpointStatus] = useState<
    'ready' | 'pending' | 'error'
  >('ready');
  const confirmSegmentCheckpoint = useCallback(
    (segmentId: SupportivePostS08SegmentId) => {
      if (onSegmentCheckpoint === undefined) return;
      requestedSegmentCheckpointRef.current = segmentId;
      setSegmentCheckpointStatus('pending');
      void onSegmentCheckpoint(segmentId).then(
        () => {
          if (requestedSegmentCheckpointRef.current !== segmentId) return;
          confirmedSegmentCheckpointRef.current = segmentId;
          setSegmentCheckpointStatus('ready');
        },
        () => {
          if (requestedSegmentCheckpointRef.current !== segmentId) return;
          setSegmentCheckpointStatus('error');
        },
      );
    },
    [onSegmentCheckpoint],
  );
  useEffect(() => {
    if (
      onSegmentCheckpoint === undefined ||
      segmentCheckpoint === null ||
      confirmedSegmentCheckpointRef.current === segmentCheckpoint ||
      (requestedSegmentCheckpointRef.current === segmentCheckpoint &&
        segmentCheckpointStatus !== 'ready')
    ) {
      return;
    }
    confirmSegmentCheckpoint(segmentCheckpoint);
  }, [
    confirmSegmentCheckpoint,
    onSegmentCheckpoint,
    segmentCheckpoint,
    segmentCheckpointStatus,
  ]);
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
  const bankProtectedNetwork = useMemo(
    () => createS13BankProtectedNetwork(managerPracticeNetwork),
    [managerPracticeNetwork],
  );
  const bankShieldedNetwork = useMemo(
    () => createS13BankShieldedNetwork(managerPracticeNetwork),
    [managerPracticeNetwork],
  );
  const fullyProtectedNetwork = useMemo(
    () => createS13FullyProtectedNetwork(bankProtectedNetwork),
    [bankProtectedNetwork],
  );
  const passwordRepairNetwork = useMemo(
    () => createS13PasswordRepairNetwork(bankProtectedNetwork),
    [bankProtectedNetwork],
  );
  const passwordRepairCelebrationNodeIds = useMemo(
    () => passwordRepairConfettiNodeIds(passwordRepairNetwork),
    [passwordRepairNetwork],
  );
  const mfaIncidentNetwork = useMemo(
    () => createS13MfaIncidentNetwork(fullyProtectedNetwork),
    [fullyProtectedNetwork],
  );
  const mfaProtectedNetwork = useMemo(
    () => createS14MfaProtectedNetwork(fullyProtectedNetwork),
    [fullyProtectedNetwork],
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
      if (state.matches('managerPracticeBankProtectionReveal')) {
        return bankShieldedNetwork;
      }
      if (state.hasTag('mfa-conclusion')) {
        return mfaProtectedNetwork;
      }
      if (state.hasTag('s13-mfa-preview')) {
        return mfaIncidentNetwork;
      }
      if (
        state.matches('conclusionNetworkRepaired') ||
        state.matches('conclusionVariantReturn') ||
        state.matches('conclusionNetworkFade') ||
        state.matches('conclusionMfaIncidentFocus') ||
        state.hasTag('s13-conclusion-overlay')
      ) {
        return fullyProtectedNetwork;
      }
      if (state.matches('conclusionNetworkRepairing')) {
        return passwordRepairNetwork;
      }
      if (
        state.matches('managerPracticeBankProtected') ||
        state.matches('managerPracticeCampusgramPrompt') ||
        state.matches('conclusionRemainingAccountsIntro') ||
        state.matches('conclusionRemainingAccountsPace') ||
        state.matches('conclusionNetworkOverview')
      ) {
        return bankProtectedNetwork;
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
        state.matches('managerNewAccountTransition') ||
        state.matches('managerPractice') ||
        state.matches('managerPracticeBank')
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
      bankProtectedNetwork,
      bankShieldedNetwork,
      conservativeScaleNetwork,
      fullyProtectedNetwork,
      managerPracticeNetwork,
      mfaIncidentNetwork,
      mfaProtectedNetwork,
      passwordRepairNetwork,
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
  const expandedMfaChainNodeIds = useMemo(() => {
    const knownAccountIds = new Set<string>(
      s15ToS17MfaConclusionContent.network.knownAccountIds,
    );
    return projectedNetwork.nodes.flatMap(({ id, kind }) => {
      if (kind !== 'account') return [];
      if (knownAccountIds.has(id)) return [id];
      const additionalAccountMatch = id.match(/^s09-additional-account-(\d+)$/u);
      if (additionalAccountMatch === null) return [];
      const accountNumber = Number(additionalAccountMatch[1]);
      const receivesMfaChain =
        accountNumber %
          s15ToS17MfaConclusionContent.network.additionalAccountStride ===
        0;
      return receivesMfaChain
        ? [id]
        : [];
    });
  }, [projectedNetwork]);
  const mfaChainNodeIds = state.hasTag('mfa-expanded-chains')
    ? expandedMfaChainNodeIds
    : state.hasTag('mfa-master-chain')
      ? ['master-campus']
      : [];
  const mfaActivationNodeIds = state.matches('s15ResultCelebration')
    ? ['master-campus']
    : state.matches('s17HowTo')
      ? expandedMfaChainNodeIds.filter((nodeId) => nodeId !== 'master-campus')
      : [];
  const bankFocusVisible =
    state.matches('managerPracticeExistingAccountRelation') ||
    state.matches('managerPracticeExistingAccountReplace') ||
    state.hasTag('s13-bank-result');
  const mfaFocusVisible = state.hasTag('s13-mfa-preview');
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
    state.matches('managerNewAccountTransition') ||
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
        text: [s13PasswordManagerPracticeContent.network.guide.newAccount],
      }
    : state.matches('managerPracticeExistingAccount')
      ? {
          id: 's13-network-existing-account',
          text: [s13PasswordManagerPracticeContent.network.guide.existingAccount],
        }
      : state.matches('managerPracticeExistingAccountUnchanged')
        ? {
            id: 's13-network-unchanged',
            text: [s13PasswordManagerPracticeContent.network.guide.unchangedAtService],
          }
        : state.matches('managerPracticeExistingAccountRelation')
          ? {
              id: 's13-network-reused-password',
              text: [s13PasswordManagerPracticeContent.network.guide.reusedPassword],
            }
          : state.matches('managerPracticeExistingAccountReplace')
            ? {
                id: 's13-network-replace-at-service',
                text: [s13PasswordManagerPracticeContent.network.guide.replaceAtService],
              }
            : state.matches('managerPracticeBankProtected')
              ? {
                  id: 's13-network-bank-password-changed',
                  text: [s13PasswordManagerPracticeContent.network.guide.passwordChanged],
                }
              : state.matches('managerPracticeCampusgramPrompt')
                ? {
                    id: 's13-network-campusgram-transition',
                    text: [
                      s13PasswordManagerPracticeContent.network.guide.campusgramTransition,
                    ],
                  }
                : state.matches('conclusionRemainingAccountsIntro')
                  ? {
                      id: 's13-conclusion-remaining-accounts-intro',
                      text: [
                        s13PasswordManagerPracticeContent.conclusion.remainingAccounts.guide
                          .intro,
                      ],
                    }
                  : state.matches('conclusionRemainingAccountsPace')
                    ? {
                        id: 's13-conclusion-remaining-accounts-pace',
                        text: [
                          s13PasswordManagerPracticeContent.conclusion.remainingAccounts.guide
                            .pace,
                        ],
                      }
                    : state.matches('conclusionNetworkRepaired')
                      ? {
                          id: 's13-conclusion-network-repaired',
                          text: [
                            s13PasswordManagerPracticeContent.conclusion.network.guide.repaired,
                          ],
                        }
                      : state.matches('conclusionVariantReturn')
                        ? {
                            id: 's13-conclusion-variant-return',
                            text: [
                              s13PasswordManagerPracticeContent.conclusion.variants.returnGuide,
                            ],
                          }
                        : state.matches('conclusionMfaPasswordKnown')
                          ? {
                              id: 's13-conclusion-mfa-password-known',
                              text: [
                                s13PasswordManagerPracticeContent.conclusion.mfa.guide
                                  .passwordKnown,
                              ],
                            }
                          : state.matches('conclusionMfaPasswordInsufficient')
                            ? {
                                id: 's13-conclusion-mfa-password-insufficient',
                                text: [
                                  s13PasswordManagerPracticeContent.conclusion.mfa.guide
                                    .passwordInsufficient,
                                ],
                              }
                            : state.matches('conclusionMfaSecondHurdle')
                              ? {
                                  id: 's13-conclusion-mfa-second-hurdle',
                                  text: [
                                    s13PasswordManagerPracticeContent.conclusion.mfa.guide
                                      .secondHurdle,
                                  ],
                                }
                              : null;
  const mfaConclusionSpeech = state.matches('s15PasswordAlone')
    ? {
        id: 's15-mfa-password-alone',
        text: [s15ToS17MfaConclusionContent.guide.outcome.passwordAlone],
        action: {
          kind: 'advance' as const,
          label: 'Weiter',
          onAction: () => send({ type: 'NEXT' }),
        },
      }
    : state.matches('s15SecondFactor')
      ? {
          id: 's15-mfa-second-factor',
          text: [s15ToS17MfaConclusionContent.guide.outcome.secondFactor],
          action: {
            kind: 'advance' as const,
            label: 'Weiter',
            onAction: () => send({ type: 'NEXT' }),
          },
        }
      : state.matches('s16Effort')
        ? {
            id: 's16-mfa-effort',
            text: [s15ToS17MfaConclusionContent.guide.prioritize.effort],
            action: {
              kind: 'advance' as const,
              label: 'Weiter',
              onAction: () => send({ type: 'NEXT' }),
            },
          }
        : state.matches('s16Prioritization')
          ? {
              id: 's16-prioritize-mfa',
              text: [
                s15ToS17MfaConclusionContent.guide.prioritize.importantAccounts,
              ],
              action: {
                kind: 'perform' as const,
                label: s15ToS17MfaConclusionContent.guide.expandAction,
                onAction: () => send({ type: 'S16_EXPAND_PROTECTION' }),
              },
            }
          : state.matches('s17HowTo')
            ? {
                id: 's17-mfa-how-to',
                text: [s15ToS17MfaConclusionContent.guide.expanded.howTo],
                action: {
                  kind: 'advance' as const,
                  label: 'Weiter',
                  onAction: () => send({ type: 'NEXT' }),
                },
              }
            : state.matches('s17IntegratedSummary')
              ? {
                  id: 's17-integrated-summary',
                  text: [s15ToS17MfaConclusionContent.guide.expanded.summary],
                  action: null,
                }
              : null;
  const networkSpeech = s13NetworkSpeech ?? mfaConclusionSpeech;
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
                  : state.matches('managerPracticeBankRelationDissolving')
                    ? 'bank-relation-dissolving'
                    : state.matches('managerPracticeBankProtectionReveal')
                      ? 'bank-shield-reveal'
                      : state.matches('conclusionRemainingAccountsPace')
                        ? 'remaining-accounts-pace'
                        : state.matches('managerPracticeBankProtected') ||
                            state.matches('managerPracticeCampusgramPrompt') ||
                            state.matches('conclusionRemainingAccountsIntro')
                          ? 'bank-protected'
                          : state.matches('conclusionNetworkFade')
                            ? 'conclusion-network-fade'
                            : state.matches('conclusionNetworkOverview')
                              ? 'all-accounts-overview'
                              : state.matches('conclusionNetworkRepairing')
                                ? 'all-accounts-repairing'
                                : state.matches('conclusionNetworkRepaired') ||
                                    state.matches('conclusionVariantReturn')
                                  ? 'all-accounts-protected'
                                  : state.hasTag('s13-mfa-preview')
                                    ? 'mfa-incident'
                                    : state.hasTag('mfa-conclusion')
                                      ? 'mfa-protected'
                                      : state.matches('conclusionMfaIncidentFocus')
                                        ? 'all-accounts-protected'
                                        : undefined;
  const s13FocusTarget = state.hasTag('s13-new-account')
    ? 'my-shop'
    : mfaFocusVisible
      ? 'master-campus'
      : bankFocusVisible
        ? 'muster-bank'
        : undefined;
  const importedVaultVisible = state.hasTag('s13-existing-account');
  const s13ExistingAccountRelationVisible =
    state.matches('managerPracticeExistingAccountRelation') ||
    state.matches('managerPracticeExistingAccountReplace');
  const browserReopenPrompt =
    state.matches('managerPracticeExistingAccountReplace') ||
    state.matches('managerPracticeCampusgramPrompt');
  const networkRepairPrompt = state.matches('conclusionNetworkOverview');
  const fullyProtectedVisible =
    state.matches('conclusionNetworkRepairing') ||
    state.matches('conclusionNetworkRepaired') ||
    state.matches('conclusionVariantReturn') ||
    state.matches('conclusionNetworkFade') ||
    state.hasTag('s13-mfa') ||
    state.hasTag('mfa-conclusion');
  const celebratesMyShop =
    state.matches('managerPracticeNewAccountShield') ||
    state.matches('managerPracticeNewAccountConnections');
  const celebratesMusterBank =
    state.matches('managerPracticeBankProtectionReveal') ||
    state.matches('managerPracticeBankProtected');
  const s13CelebratingNodeId = celebratesMyShop
    ? 'my-shop'
    : celebratesMusterBank
      ? 'muster-bank'
      : null;

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

  const passwordManagerTransitionPart = state.matches('managerTransition')
    ? 1
    : state.matches('managerNewAccountTransition')
      ? 2
      : state.matches('managerExistingAccountTransition')
        ? 3
        : null;
  const managerTransitionVisible = passwordManagerTransitionPart !== null;
  const managerPracticeVisible = state.matches('managerPractice');
  const bankPracticeVisible = state.matches('managerPracticeBank');
  const campusgramPracticeVisible = state.matches('managerPracticeCampusgram');
  const conclusionOverlayPhase = state.matches('conclusionVariantFit')
    ? 'variant-fit'
    : state.matches('conclusionVariantQuestion')
      ? 'variant-question'
      : state.matches('conclusionVariantSelectedIntegrated') ||
          state.matches('conclusionVariantSelectedSeparate')
        ? 'variant-selected'
        : state.matches('conclusionRecoveryLost')
          ? 'recovery-lost'
          : state.matches('conclusionRecoveryPath')
            ? 'recovery-path'
            : state.matches('conclusionRecoveryRestored')
              ? 'recovery-restored'
              : null;
  const selectedVariant: S13PasswordManagerVariant | null = state.matches(
    'conclusionVariantSelectedIntegrated',
  )
    ? 'integrated'
    : state.matches('conclusionVariantSelectedSeparate')
      ? 'separate'
      : null;
  const mfaPreviewVisible = state.hasTag('s13-mfa-preview');
  const mfaTransitionVisible = state.matches('conclusionMfaTransition');
  const mfaSectionTransitionVisible = state.matches(
    'conclusionMfaSectionTransition',
  );
  const s14Visible = state.matches('s14');

  const segmentCheckpointBlocked =
    onSegmentCheckpoint !== undefined &&
    segmentCheckpoint !== null &&
    !state.matches('s15ResultCelebration') &&
    confirmedSegmentCheckpointRef.current !== segmentCheckpoint;
  if (segmentCheckpointBlocked) {
    return (
      <div className={styles.stageStack}>
        <section
          className={styles.segmentCheckpointBoundary}
          role={segmentCheckpointStatus === 'error' ? 'alert' : 'status'}
          aria-busy={segmentCheckpointStatus !== 'error'}
        >
          {segmentCheckpointStatus === 'error' ? (
            <>
              <p>Die Segmentgrenze konnte nicht bestätigt werden.</p>
              <p>Fehlercode: resume-segment-checkpoint-failed</p>
              <button
                type="button"
                onClick={() => confirmSegmentCheckpoint(segmentCheckpoint)}
              >
                Erneut versuchen
              </button>
            </>
          ) : (
            <p>Training wird vorbereitet …</p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className={styles.stageStack}>
      <section
        className={styles.training}
        aria-hidden={
          managerTransitionVisible ||
          managerPracticeVisible ||
          bankPracticeVisible ||
          campusgramPracticeVisible ||
          conclusionOverlayPhase !== null ||
          mfaSectionTransitionVisible ||
          s14Visible ||
          undefined
        }
        aria-label={
          state.hasTag('mfa-conclusion')
            ? s15ToS17MfaConclusionContent.trainingAriaLabel
            : state.hasTag('s13-network')
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
        data-s13-browser-active={
          state.matches('managerPractice') ||
          state.matches('managerPracticeBank') ||
          state.matches('managerPracticeCampusgram') ||
          undefined
        }
        data-s13-network-step={s13NetworkStep}
        data-s13-network-hidden={
          conclusionOverlayPhase !== null || mfaSectionTransitionVisible || undefined
        }
        data-s13-focus={s13FocusTarget}
        data-s13-network-dimmed={
          state.matches('managerPractice') ||
          (state.hasTag('s13-network') &&
            !state.hasTag('s13-conclusion-clear') &&
            !state.hasTag('s13-mfa')) ||
          undefined
        }
        data-s15-master-campus-pulse={
          state.matches('s15SecondFactor') || undefined
        }
        data-s13-fully-protected={fullyProtectedVisible || undefined}
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
            ariaLabel={
              state.hasTag('mfa-expanded-chains')
                ? s15ToS17MfaConclusionContent.network.expandedProtectionAriaLabel
                : state.hasTag('mfa-master-chain')
                  ? s15ToS17MfaConclusionContent.network.masterCampusProtectedAriaLabel
                  : state.matches('conclusionNetworkRepaired')
                    ? s13PasswordManagerPracticeContent.conclusion.network.repairedAriaLabel
                    : projectedNetwork.accessibleSummary
            }
            attackPhase={pathReplayRunning ? 'attacking' : 'incident-check'}
            attackerAccountId={
              mfaPreviewVisible
                ? 'master-campus'
                : replayRunning || replayComplete
                  ? 'campusgram'
                  : null
            }
            attackerAttemptStatus={
              mfaPreviewVisible
                ? 'affected'
                : replayRunning || replayComplete
                  ? 'protected'
                  : null
            }
            {...(mfaPreviewVisible
              ? {
                  attackerLabel:
                    s13PasswordManagerPracticeContent.conclusion.mfa.previewLead,
                  attackerPreview: true,
                  attackerPreviewSymbolId:
                    s13PasswordManagerPracticeContent.conclusion.mfa
                      .previewAccountSymbolId,
                }
              : {})}
            attackTargetId={
              mfaPreviewVisible
                ? 'master-campus'
                : replayRunning || replayComplete
                  ? 'campusgram'
                  : null
            }
            attackBlocked={replayRunning || replayComplete}
            attackEdgeId={null}
            {...(scalingFindingsRevealing
              ? { statusCascadeStartDelayMs: scalingFindingNodeDelayMs }
              : {})}
            showAccountShields
            easyToGuessAccountIds={
              fullyProtectedVisible
                ? []
                : networkRepairPrompt
                  ? scalingRiskNetwork.easyToGuessAccountIds.filter(
                      (accountId) => accountId !== 'master-campus',
                    )
                  : scalingFindingsVisible
                  ? scalingRiskNetwork.easyToGuessAccountIds
                  : easyToGuessAccountIds
            }
            compromisedNodeId={mfaPreviewVisible ? 'master-campus' : null}
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
            celebratingNodeId={s13CelebratingNodeId ?? celebratingNodeId}
            celebratingNodeIds={
              state.matches('conclusionNetworkRepairing')
                ? passwordRepairCelebrationNodeIds
                : []
            }
            celebrationDelayStepMs={220}
            compactCelebration={state.matches('conclusionNetworkRepairing')}
            mfaChainNodeIds={mfaChainNodeIds}
            mfaActivationNodeIds={mfaActivationNodeIds}
            mfaActivationLabel={s15ToS17MfaConclusionContent.status.activated}
            interactionDisabled={!state.matches('protection')}
            nodeActionLabels={actionLabels}
            showEdgeLabels={preparationVisible || s13ExistingAccountRelationVisible}
            onNodeSelect={handleNetworkNodeSelect}
          />
          {state.matches('s15ResultCelebration') ? (
            <div className={styles.mfaActivationMoment} role="status" aria-live="polite">
              <strong>
                <span aria-hidden="true">✓</span>{' '}
                {s15ToS17MfaConclusionContent.status.activated}
              </strong>
            </div>
          ) : null}
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
        {state.matches('s17IntegratedSummary') ? (
          <button
            type="button"
            className={styles.trainingCompletionAction}
            data-passwo-speech-obstacle
            ref={initialActionRef}
            onClick={() => send({ type: 'S17_FINISH' })}
          >
            {s15ToS17MfaConclusionContent.guide.completeAction}
          </button>
        ) : null}
        {replayReady ? (
          <button
            type="button"
            className={styles.replayAction}
            ref={initialActionRef}
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
            ref={initialActionRef}
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
                ref={initialActionRef}
                onClick={() => send({ type: 'NEXT' })}
              >
                {s09PasswordSummaryContent.finishAction}
              </button>
            </section>
          </>
        ) : networkSpeech !== null ? (
          <section
            className={styles.passWoScene}
            aria-label={
              mfaConclusionSpeech === null
                ? 'PassWo erklärt neue und bestehende Konten im Passwortmanager'
                : s15ToS17MfaConclusionContent.trainingAriaLabel
            }
          >
            <PassWoGuide
              guideName={
                mfaConclusionSpeech === null
                  ? s13PasswordManagerPracticeContent.guide.name
                  : s15ToS17MfaConclusionContent.guide.name
              }
              taskLabel={
                mfaConclusionSpeech === null
                  ? state.hasTag('s13-mfa')
                    ? 'MFA'
                    : 'Passwortmanager'
                  : s15ToS17MfaConclusionContent.guide.taskLabel
              }
              helpOpen
              helpId={
                mfaConclusionSpeech === null
                  ? 's13-network-speech'
                  : 's15-s17-network-speech'
              }
              openHelpLabel={
                mfaConclusionSpeech === null
                  ? 'PassWo-Hinweis öffnen'
                  : s15ToS17MfaConclusionContent.guide.openHelpLabel
              }
              speech={networkSpeech.text}
              speechEmphasis={passWoSpeechEmphasisFor(networkSpeech.id)}
              speechKey={networkSpeech.id}
              speechObstacleSelector="[data-s13-import-vault]"
              {...(mfaConclusionSpeech !== null
                ? mfaConclusionSpeech.action === null
                  ? {}
                  : { speechAction: mfaConclusionSpeech.action }
                : browserReopenPrompt || networkRepairPrompt
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
                ref={initialActionRef}
                aria-label={s09PasswordSummaryContent.passwordManagerAction.ariaLabel}
                onClick={() => send({ type: 'NEXT' })}
              >
                <strong>{s09PasswordSummaryContent.passwordManagerAction.title}</strong>
                <span>{s09PasswordSummaryContent.passwordManagerAction.detail}</span>
              </button>
            ) : null}
          </>
        ) : null}
        {networkRepairPrompt ? (
          <button
            type="button"
            className={styles.repairAllAction}
            ref={initialActionRef}
            onClick={() => send({ type: 'S13_REPAIR_ALL_PASSWORDS' })}
          >
            {s13PasswordManagerPracticeContent.conclusion.network.repairAction}
          </button>
        ) : null}
        {mfaTransitionVisible ? (
          <S13MfaTransition onAction={() => send({ type: 'S13_FINISH' })} />
        ) : null}
        {state.matches('managerLesson') ? (
          <S12PasswordManagerTraining
            displayName={displayName}
            onBrowserHighlightChange={setBrowserHighlighted}
          />
        ) : null}
        </DesktopSurface>
      </section>
      {passwordManagerTransitionPart !== null ? (
        <div className={styles.stageOverlay}>
          <SectionTransition
            sectionLabel={s09PasswordSummaryContent.passwordManagerTransition.sectionLabel}
            title={s09PasswordSummaryContent.passwordManagerTransition.title}
            currentSection={2}
            totalSections={3}
            parts={s09PasswordSummaryContent.passwordManagerTransition.parts}
            currentPart={passwordManagerTransitionPart}
            holdDurationMs={s09PasswordSummaryContent.passwordManagerTransition.holdDurationMs}
            onComplete={() => send({ type: 'TRANSITION_COMPLETE' })}
          />
        </div>
      ) : null}
      {mfaSectionTransitionVisible ? (
        <div className={styles.stageOverlay}>
          <SectionTransition
            sectionLabel={
              s13PasswordManagerPracticeContent.conclusion.mfa.transition
                .sectionTransition.sectionLabel
            }
            title={
              s13PasswordManagerPracticeContent.conclusion.mfa.transition
                .sectionTransition.title
            }
            currentSection={3}
            totalSections={3}
            parts={
              s13PasswordManagerPracticeContent.conclusion.mfa.transition
                .sectionTransition.parts
            }
            currentPart={1}
            holdDurationMs={
              s13PasswordManagerPracticeContent.conclusion.mfa.transition
                .sectionTransition.holdDurationMs
            }
            onComplete={() => send({ type: 'TRANSITION_COMPLETE' })}
          />
        </div>
      ) : null}
      {s14Visible ? (
        <div className={styles.stageOverlay}>
          <S14MfaIntroduction
            displayName={displayName}
            {...(resumeState === undefined
              ? {}
              : { masterCampusPassphraseId: resumeState.passphraseIds.masterCampus })}
            platform={platform}
            onComplete={() => send({ type: 'S14_BROWSER_CLOSED' })}
          />
        </div>
      ) : null}
      {conclusionOverlayPhase === null ? null : (
        <div className={styles.stageOverlay}>
          <S13PasswordManagerConclusion
            phase={conclusionOverlayPhase}
            selectedVariant={selectedVariant}
            onNext={() => send({ type: 'NEXT' })}
            onVariantSelect={(variant) =>
              send({ type: 'S13_VARIANT_SELECTED', variant })
            }
          />
        </div>
      )}
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
      {bankPracticeVisible ? (
        <div className={styles.stageOverlay}>
          <S13MusterBankPasswordChange
            displayName={displayName}
            platform={platform}
            onBrowserClosed={() => send({ type: 'S13_BANK_BROWSER_CLOSED' })}
          />
        </div>
      ) : null}
      {campusgramPracticeVisible ? (
        <div className={styles.stageOverlay}>
          <S13CampusgramManualLogin
            displayName={displayName}
            {...(resumeState === undefined
              ? {}
              : { passphraseIds: resumeState.passphraseIds })}
            platform={platform}
            onComplete={() => send({ type: 'S13_CAMPUSGRAM_COMPLETED' })}
          />
        </div>
      ) : null}
    </div>
  );
}
