import { s13PasswordManagerPracticeContent } from '@passwo/training-content';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import recoveryPathAsset from '../../../../assets/s13/wiederherstellung.png';
import {
  PasswordManagerVariantComparison,
  PasswordManagerVaultVisual,
} from '../S12/S12PasswordManagerTraining.js';
import styles from './S13PasswordManagerConclusion.module.css';

export type S13PasswordManagerVariant = 'integrated' | 'separate';

export type S13PasswordManagerConclusionPhase =
  | 'variant-fit'
  | 'variant-question'
  | 'variant-selected'
  | 'recovery-lost'
  | 'recovery-path'
  | 'recovery-restored';

function LaptopVisual({
  vaultVisible,
  lost = false,
}: {
  readonly vaultVisible: boolean;
  readonly lost?: boolean;
}) {
  return (
    <span className={styles.laptop} data-lost={lost || undefined} aria-hidden="true">
      <span className={styles.laptopScreen}>
        {vaultVisible ? (
          <PasswordManagerVaultVisual
            open={false}
            compact
            hideCount
            className={styles.deviceVault}
            ariaLabel="Geschlossener Passwort-Tresor"
          />
        ) : null}
      </span>
      <span className={styles.laptopBase} />
      {lost ? <strong className={styles.lostMark}>×</strong> : null}
    </span>
  );
}

function RecoveryScene({ phaseIndex }: { readonly phaseIndex: 0 | 1 | 2 }) {
  const recovery = s13PasswordManagerPracticeContent.conclusion.recovery;
  return (
    <section className={styles.recoveryPanel} aria-labelledby="s13-recovery-title">
      <h1 id="s13-recovery-title">{recovery.title}</h1>
      <div className={styles.recoveryRoute} data-phase={phaseIndex}>
        <article className={styles.recoveryStation} data-station="old">
          <strong className={styles.stationStatus}>{recovery.oldDevice.status}</strong>
          <LaptopVisual vaultVisible lost />
          <h2>{recovery.oldDevice.label}</h2>
        </article>
        <article
          className={styles.recoveryPath}
          data-active={phaseIndex >= 1 || undefined}
        >
          <span className={styles.routeLine} aria-hidden="true">
            <i />
          </span>
          <strong className={styles.recoveryArrow} aria-hidden="true">→</strong>
          <span className={styles.recoverySymbol} aria-hidden="true">
            <img
              className={styles.recoveryPathImage}
              src={recoveryPathAsset}
              width={1254}
              height={1254}
              alt=""
            />
          </span>
          <h2>{recovery.path.label}</h2>
        </article>
        <article
          className={styles.recoveryStation}
          data-station="new"
          data-active={phaseIndex >= 2 || undefined}
        >
          <LaptopVisual vaultVisible={phaseIndex >= 2} />
          <h2>{recovery.newDevice.label}</h2>
          {phaseIndex >= 2 ? (
            <strong className={styles.restoredStatus}>
              {recovery.newDevice.status} <span aria-hidden="true">✓</span>
            </strong>
          ) : null}
        </article>
      </div>
    </section>
  );
}

export function S13PasswordManagerConclusion({
  phase,
  selectedVariant,
  onNext,
  onVariantSelect,
}: {
  readonly phase: S13PasswordManagerConclusionPhase;
  readonly selectedVariant: S13PasswordManagerVariant | null;
  readonly onNext: () => void;
  readonly onVariantSelect: (variant: S13PasswordManagerVariant) => void;
}) {
  const conclusion = s13PasswordManagerPracticeContent.conclusion;
  const recoveryPhaseIndex = phase === 'recovery-lost' ? 0 : phase === 'recovery-path' ? 1 : 2;
  const recoveryVisible = phase.startsWith('recovery-');
  const speech = phase === 'variant-fit'
    ? {
        id: 's13-conclusion-variant-fit',
        text: conclusion.variants.fitGuide,
      }
    : phase === 'recovery-lost'
      ? { id: 's13-conclusion-recovery-lost', text: conclusion.recovery.guide.lost }
      : phase === 'recovery-path'
        ? { id: 's13-conclusion-recovery-path', text: conclusion.recovery.guide.path }
        : phase === 'recovery-restored'
          ? {
              id: 's13-conclusion-recovery-restored',
              text: conclusion.recovery.guide.restored,
            }
          : null;

  return (
    <section
      className={styles.conclusion}
      data-phase={phase}
      aria-label="Abschluss der Passwortmanager-Sektion"
    >
      {recoveryVisible ? null : (
        <div className={styles.variantBackground} data-s13-conclusion-obstacle>
          <PasswordManagerVariantComparison
            integrated={conclusion.variants.integrated}
            separate={conclusion.variants.separate}
            active={phase === 'variant-selected' ? selectedVariant : null}
            questioned
          />
        </div>
      )}

      {recoveryVisible ? <RecoveryScene phaseIndex={recoveryPhaseIndex} /> : null}

      {phase === 'variant-question' ? (
        <fieldset className={styles.variantQuestion}>
          <legend>{conclusion.variants.question}</legend>
          <div>
            <button
              type="button"
              autoFocus
              onClick={() => onVariantSelect('integrated')}
            >
              {conclusion.variants.options.integrated}
            </button>
            <button type="button" onClick={() => onVariantSelect('separate')}>
              {conclusion.variants.options.separate}
            </button>
          </div>
        </fieldset>
      ) : null}

      {speech === null ? null : (
        <div className={styles.guideLayer}>
          <PassWoGuide
            guideName={s13PasswordManagerPracticeContent.guide.name}
            taskLabel="Passwortmanager"
            helpOpen
            helpId="s13-password-manager-conclusion"
            openHelpLabel="PassWo-Hinweis öffnen"
            speech={[speech.text]}
            speechEmphasis={passWoSpeechEmphasisFor(speech.id)}
            speechKey={speech.id}
            speechObstacleSelector="[data-s13-conclusion-obstacle]"
            speechAction={{
              kind: 'advance',
              label:
                phase === 'recovery-restored'
                  ? conclusion.recovery.continueAction
                  : 'Weiter',
              onAction: onNext,
            }}
            placement="bottom-left"
            showHelpButton={false}
          />
        </div>
      )}
    </section>
  );
}

export function S13MfaTransition({ onAction }: { readonly onAction: () => void }) {
  const transition = s13PasswordManagerPracticeContent.conclusion.mfa.transition;
  return (
    <section className={styles.mfaTransition}>
      <button
        type="button"
        autoFocus
        aria-label={transition.ariaLabel}
        onClick={onAction}
      >
        <strong>{transition.title}</strong>
        <span>{transition.detail}</span>
      </button>
    </section>
  );
}
