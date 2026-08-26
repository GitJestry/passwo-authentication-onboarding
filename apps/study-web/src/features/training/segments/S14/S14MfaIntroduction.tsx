import {
  s14MfaContent,
  type S14FactorIconId,
  type S14FactorId,
} from '@passwo/training-content';
import { useMachine } from '@xstate/react';
import type { SVGProps } from 'react';
import {
  BrowserShell,
  type BrowserShellSnapshot,
  type DesktopPlatform,
  DesktopSurface,
} from '@passwo/ui';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import searchStyles from '../S07/S07PassphraseSearchTraining.module.css';
import { s14MfaIntroductionMachine } from './S14MfaIntroductionMachine.js';
import styles from './S14MfaIntroduction.module.css';

function FactorIcon({ iconId }: { readonly iconId: S14FactorIconId }) {
  const sharedProps: SVGProps<SVGSVGElement> = {
    'aria-hidden': true,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (iconId) {
    case 'password':
      return (
        <svg {...sharedProps}>
          <circle cx="17" cy="23" r="8" />
          <path d="m23 29 13 13M30 36l4-4M34 40l4-4" />
        </svg>
      );
    case 'security-question':
      return (
        <svg {...sharedProps}>
          <path d="M8 10h32v23H23l-9 7v-7H8V10Z" />
          <path d="M19 19.2a5.3 5.3 0 1 1 8.3 4.4c-2 1.4-3.3 2.1-3.3 4.4M24 32.7h.01" />
        </svg>
      );
    case 'authenticator-app':
      return (
        <svg {...sharedProps}>
          <rect x="13" y="4" width="22" height="40" rx="5" />
          <path d="M20 9h8M21 38h6" />
          <path d="m19 24 3.3 3.3L29.5 20" />
        </svg>
      );
    case 'security-key':
      return (
        <svg {...sharedProps}>
          <path d="M10 15h25v18H10a6 6 0 0 1-6-6v-6a6 6 0 0 1 6-6Z" />
          <path d="M35 19h9v10h-9M40 19v-4M40 33v-4M15 24h.01" />
        </svg>
      );
    case 'fingerprint':
      return (
        <svg {...sharedProps}>
          <path d="M8 24a16 16 0 0 1 32 0c0 6.1-1.2 11.9-3.6 17.2" />
          <path d="M8.2 29.7c.3-1.9.5-3.8.5-5.7" />
          <path d="M10 33.5c1.2-3 1.8-6.2 1.8-9.5a12.2 12.2 0 0 1 24.4 0c0 7.1-1.7 13.6-5.1 19.5" />
          <path d="M15 40.6c1.9-5.2 2.9-10.7 2.9-16.6a6.1 6.1 0 0 1 12.2 0c0 6.8-1.3 13.2-4 19" />
          <path d="M21.2 42.5C23.1 36.5 24 30.4 24 24" />
        </svg>
      );
    case 'face-recognition':
      return (
        <svg {...sharedProps}>
          <path d="M15 5H8a3 3 0 0 0-3 3v7M33 5h7a3 3 0 0 1 3 3v7M43 33v7a3 3 0 0 1-3 3h-7M15 43H8a3 3 0 0 1-3-3v-7" />
          <path d="M17 20v3M31 20v3M17.5 31c4.3 3.4 8.7 3.4 13 0M24 21v7h3" />
        </svg>
      );
  }
}

function SearchBrandIcon() {
  return (
    <svg
      aria-hidden="true"
      className={searchStyles.searchBrandMark}
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect width="22" height="22" x="1" y="1" rx="7" fill="currentColor" />
      <circle
        className={searchStyles.searchBrandLens}
        cx="10.25"
        cy="10.25"
        r="4.25"
        strokeWidth="2.15"
      />
      <path
        className={searchStyles.searchBrandLens}
        d="m13.55 13.55 4.7 4.7"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <path
        className={searchStyles.searchBrandSpark}
        d="M17.65 4.25c.18 1.08.83 1.73 1.9 1.9-1.07.18-1.72.83-1.9 1.9-.18-1.07-.83-1.72-1.9-1.9 1.07-.17 1.72-.82 1.9-1.9Z"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="10.5" cy="10.5" r="5.75" />
      <path d="m15 15 4.25 4.25" />
    </svg>
  );
}

function SearchStartPage() {
  const content = s14MfaContent.browser.searchPage;
  return (
    <main className={searchStyles.searchLandingPage} aria-label={content.ariaLabel}>
      <div className={searchStyles.searchLandingContent}>
        <span
          className={`${searchStyles.searchBrand} ${searchStyles.searchLandingBrand}`}
        >
          <SearchBrandIcon />
          <span className={searchStyles.searchWordmark}>{content.brand}</span>
        </span>
        <div
          className={searchStyles.searchField}
          role="search"
          aria-label="Leere fiktive Suche"
          aria-disabled="true"
        >
          <span aria-hidden="true" />
          <span
            className={`${searchStyles.searchSubmit} ${styles.lockedSearchAction}`}
            aria-hidden="true"
          >
            <SearchIcon />
          </span>
        </div>
      </div>
    </main>
  );
}

function LockedBrowser({ platform }: { readonly platform: DesktopPlatform }) {
  const browser = s14MfaContent.browser;
  const snapshot: BrowserShellSnapshot = {
    tabs: [
      {
        id: browser.masterCampusTab.id,
        label: browser.masterCampusTab.label,
        icon: <NetworkSymbol symbolId="master-campus" />,
        enabled: false,
        disabledReason: browser.masterCampusTab.disabledReason,
      },
      {
        id: browser.searchTab.id,
        label: browser.searchTab.label,
        icon: <SearchBrandIcon />,
        enabled: false,
      },
    ],
    activeTabId: browser.searchTab.id,
    address: browser.searchTab.address,
    locked: true,
  };

  return (
    <BrowserShell
      platform={platform}
      variant="artifact"
      snapshot={snapshot}
      ariaLabel={browser.ariaLabel}
      windowOpen
      windowCloseEnabled={false}
    >
      <SearchStartPage />
    </BrowserShell>
  );
}

function ConceptLabel({
  title,
  abbreviation,
  emphasized = false,
}: {
  readonly title: string;
  readonly abbreviation: string;
  readonly emphasized?: boolean;
}) {
  return (
    <div className={styles.conceptLabel} data-emphasized={emphasized || undefined}>
      <span>{title}</span>
      <strong>{abbreviation}</strong>
    </div>
  );
}

function FactorBoard({
  activeFactorId,
  combinationCount,
}: {
  readonly activeFactorId: S14FactorId | null;
  readonly combinationCount: number;
}) {
  return (
    <div className={styles.factorArea}>
      <div className={styles.factorGrid} data-s14-factors>
        {s14MfaContent.factors.map((factor) => (
          <section
            className={styles.factorCard}
            data-active={activeFactorId === factor.id || undefined}
            aria-current={activeFactorId === factor.id ? 'step' : undefined}
            key={factor.id}
          >
            <h2>{factor.title}</h2>
            <ul>
              {factor.items.map((item) => (
                <li key={item.id}>
                  <span className={styles.factorIcon}>
                    <FactorIcon iconId={item.iconId} />
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {combinationCount > 0 ? (
        <ol
          className={styles.combinations}
          data-s14-combinations
          aria-label="Beispiele für Faktor-Kombinationen"
          aria-live="polite"
        >
          {s14MfaContent.combinations.slice(0, combinationCount).map((combination) => (
            <li data-valid={combination.valid} key={combination.id}>
              <span>{combination.label}</span>
              <strong
                role="img"
                aria-label={
                  combination.valid
                    ? 'gültige Kombination: unterschiedliche Faktoren'
                    : 'ungültige Kombination: derselbe Faktor'
                }
              >
                {combination.valid ? '✓' : '✗'}
              </strong>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function motionDurations() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? { cleanDesktopDurationMs: 0, combinationRevealDurationMs: 0 }
    : s14MfaContent.timings;
}

export function S14MfaIntroduction({
  platform = 'mac',
}: {
  readonly platform?: DesktopPlatform;
}) {
  const [state, send] = useMachine(s14MfaIntroductionMachine, {
    input: motionDurations(),
  });
  const browserVisible = state.matches('browser');
  const mfaVisible = !state.matches('cleanDesktop') && !browserVisible;
  const twoFactorVisible =
    state.matches('twoFactor') ||
    state.matches('knowledge') ||
    state.matches('possession') ||
    state.matches('biometrics') ||
    state.matches('firstCombination') ||
    state.matches('secondCombination') ||
    state.matches('thirdCombination') ||
    state.matches('distinctFactors');
  const factorsVisible =
    state.matches('knowledge') ||
    state.matches('possession') ||
    state.matches('biometrics') ||
    state.matches('firstCombination') ||
    state.matches('secondCombination') ||
    state.matches('thirdCombination') ||
    state.matches('distinctFactors');
  const activeFactorId: S14FactorId | null = state.matches('knowledge')
    ? 'knowledge'
    : state.matches('possession')
      ? 'possession'
      : state.matches('biometrics')
        ? 'biometrics'
        : null;
  const combinationCount = state.matches('firstCombination')
    ? 1
    : state.matches('secondCombination')
      ? 2
      : state.matches('thirdCombination') || state.matches('distinctFactors')
        ? 3
        : 0;
  const speech = state.matches('mfa')
    ? { id: 's14-mfa', text: s14MfaContent.guide.mfa }
    : state.matches('twoFactor')
      ? { id: 's14-two-factor', text: s14MfaContent.guide.twoFactor }
      : state.matches('knowledge')
        ? { id: 's14-factor-knowledge', text: s14MfaContent.guide.factors.knowledge }
        : state.matches('possession')
          ? { id: 's14-factor-possession', text: s14MfaContent.guide.factors.possession }
          : state.matches('biometrics')
            ? { id: 's14-factor-biometrics', text: s14MfaContent.guide.factors.biometrics }
            : state.matches('distinctFactors')
              ? { id: 's14-distinct-factors', text: s14MfaContent.guide.distinct }
              : null;

  if (browserVisible) {
    return (
      <section className={styles.training} aria-label={s14MfaContent.trainingAriaLabel}>
        <LockedBrowser platform={platform} />
      </section>
    );
  }

  return (
    <section className={styles.training} aria-label={s14MfaContent.trainingAriaLabel}>
      <DesktopSurface
        platform={platform}
        browserDock={{
          active: false,
          enabled: false,
          label: 'Browser geschlossen',
        }}
      >
        {mfaVisible ? (
          <div className={styles.lessonViewport}>
            <section
              className={styles.conceptBoard}
              data-factors-visible={factorsVisible || undefined}
              aria-label="MFA und Faktorarten"
            >
              {!factorsVisible ? (
                <div className={styles.conceptStack} data-s14-concepts>
                  <ConceptLabel
                    title={s14MfaContent.concepts.mfa.title}
                    abbreviation={s14MfaContent.concepts.mfa.abbreviation}
                  />
                  {twoFactorVisible ? (
                    <>
                      <span className={styles.conceptConnector} aria-hidden="true" />
                      <ConceptLabel
                        title={s14MfaContent.concepts.twoFactor.title}
                        abbreviation={s14MfaContent.concepts.twoFactor.abbreviation}
                        emphasized
                      />
                    </>
                  ) : null}
                </div>
              ) : null}
              {factorsVisible ? (
                <FactorBoard
                  activeFactorId={activeFactorId}
                  combinationCount={combinationCount}
                />
              ) : null}
            </section>
          </div>
        ) : null}
        {speech === null ? null : (
          <div className={styles.guideLayer}>
            <PassWoGuide
              guideName={s14MfaContent.guide.name}
              taskLabel={s14MfaContent.guide.taskLabel}
              helpOpen
              helpId="s14-passwo-speech"
              openHelpLabel={s14MfaContent.guide.openHelpLabel}
              speech={[speech.text]}
              speechKey={speech.id}
              speechEmphasis={passWoSpeechEmphasisFor(speech.id)}
              speechObstacleSelector="[data-s14-concepts], [data-s14-factors], [data-s14-combinations]"
              speechAction={{
                kind: 'advance',
                onAction: () => send({ type: 'NEXT' }),
              }}
              placement="bottom-left"
              showHelpButton={false}
            />
          </div>
        )}
      </DesktopSurface>
    </section>
  );
}
