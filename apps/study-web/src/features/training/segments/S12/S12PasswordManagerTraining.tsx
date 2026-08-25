import { s12PasswordManagerContent } from '@passwo/training-content';
import { deriveCampusIdentity } from '@passwo/training-engine';
import { useMachine } from '@xstate/react';
import { type CSSProperties, type ReactNode, useEffect } from 'react';
import integratedPasswordManagerAsset from '../../../../assets/s12/integrated-password-manager.png';
import standalonePasswordManagerAsset from '../../../../assets/s12/standalone-password-manager.png';
import { PassWoGuide } from '../../PassWoGuide.js';
import { passWoSpeechEmphasisFor } from '../../PassWoSpeechEmphasis.js';
import { s12PasswordManagerMachine } from './S12PasswordManagerMachine.js';
import styles from './S12PasswordManagerTraining.module.css';

type S12FlowId = (typeof s12PasswordManagerContent.flow)[number]['id'];

interface CharacterStyle extends CSSProperties {
  readonly '--character-index': number;
}

interface AutofillCharacterStyle extends CSSProperties {
  readonly '--autofill-delay': string;
}

function characterStyle(index: number): CharacterStyle {
  return { '--character-index': index };
}

function autofillCharacterStyle(delayMs: number): AutofillCharacterStyle {
  return { '--autofill-delay': `${delayMs}ms` };
}

const AUTOFILL_CHARACTER_DURATION_MS = 52;
const AUTOFILL_USERNAME_START_MS = 940;

function motionDurations(usernameLength: number) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reducedMotion
    ? {
        vaultOpeningDurationMs: 0,
        generationDurationMs: 0,
        storageDurationMs: 0,
        autofillDurationMs: 0,
        variantsTransitionDurationMs: 0,
        variantsRevealDurationMs: 0,
      }
    : {
        vaultOpeningDurationMs: 3400,
        generationDurationMs: 1200,
        storageDurationMs: 3700,
        variantsTransitionDurationMs: 1500,
        variantsRevealDurationMs: 1550,
        autofillDurationMs:
          AUTOFILL_USERNAME_START_MS +
          Math.max(
            usernameLength,
            s12PasswordManagerContent.vault.entry.maskedPassword.length,
          ) * AUTOFILL_CHARACTER_DURATION_MS +
          320,
      };
}

function VaultVisual({
  open,
  storing = false,
  showEntry = false,
  lockHighlighted = false,
  compact = false,
  opening = false,
  username,
}: {
  readonly open: boolean;
  readonly storing?: boolean;
  readonly showEntry?: boolean;
  readonly lockHighlighted?: boolean;
  readonly compact?: boolean;
  readonly opening?: boolean;
  readonly username: string;
}) {
  const content = s12PasswordManagerContent.vault;
  const storedCount = showEntry
    ? content.storedCount.withGenerated
    : content.storedCount.initial;
  return (
    <div
      className={styles.vault}
      data-open={open || undefined}
      data-storing={storing || undefined}
      data-lock-highlighted={lockHighlighted || undefined}
      data-compact={compact || undefined}
      data-opening={opening || undefined}
      role="img"
      aria-label={`${content.label}, ${open ? content.states.open : content.states.closed}, ${storedCount} ${content.states.stored}`}
    >
      <div className={styles.vaultCabinet}>
        <div className={styles.vaultInterior} aria-hidden="true">
          <div className={styles.vaultEntryCollection}>
            {content.initialEntries.map((entry) => (
              <span className={styles.vaultExampleEntry} key={entry.account}>
                <strong>{entry.account}</strong>
                <span>{entry.identifier}</span>
                <code>{content.entry.maskedPassword}</code>
              </span>
            ))}
            {showEntry ? (
              <span className={styles.vaultStoredEntry}>
                <strong>{content.entry.account}</strong>
                <span>{username}</span>
                <code>{content.entry.maskedPassword}</code>
              </span>
            ) : null}
          </div>
        </div>
        <span className={styles.vaultHinge} aria-hidden="true" />
        <span className={styles.vaultHinge} aria-hidden="true" />
        <div className={styles.vaultDoor} aria-hidden="true">
          <span className={styles.vaultDoorEdge} />
          <span className={styles.vaultDoorInset} />
          <span className={styles.vaultWheel}>
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className={styles.vaultLock}>
            <i />
          </span>
          {!open && !compact ? (
            <span className={styles.vaultCount}>{storedCount}</span>
          ) : null}
        </div>
      </div>
      <span className={styles.vaultBase} aria-hidden="true" />
    </div>
  );
}

function FlowStrip({
  activeId,
  completedCount,
}: {
  readonly activeId: S12FlowId | null;
  readonly completedCount: number;
}) {
  return (
    <ol className={styles.flowStrip} aria-label={s12PasswordManagerContent.flowAriaLabel}>
      {s12PasswordManagerContent.flow.map((item, index) => {
        const complete = index < completedCount;
        return (
          <li
            key={item.id}
            data-active={item.id === activeId || undefined}
            data-complete={complete || undefined}
          >
            <span>{item.label}</span>
            {complete ? (
              <strong aria-label={s12PasswordManagerContent.completedAriaLabel}>✓</strong>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function SearchInformationControl() {
  const content = s12PasswordManagerContent.generator;
  const tooltipId = 's12-generator-information';
  return (
    <span className={styles.searchInformationControl}>
      <button
        type="button"
        aria-label={content.informationLabel}
        aria-describedby={tooltipId}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.6 2.75h4.8l.54 2.15c.43.18.84.42 1.22.7l2.08-.64 2.4 4.16-1.56 1.51a7 7 0 0 1 0 1.74l1.56 1.51-2.4 4.16-2.08-.64c-.38.28-.79.52-1.22.7l-.54 2.15H9.6l-.54-2.15a7 7 0 0 1-1.22-.7l-2.08.64-2.4-4.16 1.56-1.51a7 7 0 0 1 0-1.74L3.36 9.12l2.4-4.16 2.08.64c.38-.28.79-.52 1.22-.7L9.6 2.75Z" />
          <circle cx="12" cy="11.5" r="2.65" />
        </svg>
      </button>
      <span className={styles.searchInformationTooltip} id={tooltipId} role="tooltip">
        <span>
          <strong>{content.information.passwordLength}:</strong> {content.passwordLength}
        </span>
        <span>
          <strong>{content.information.alphabetSize}:</strong> {content.alphabetSize}
        </span>
        <span>
          <strong>{content.information.combinations}:</strong> {content.combinations}
        </span>
        <span>
          <strong>{content.information.attemptsPerSecond}:</strong>{' '}
          {content.attemptsPerSecond}
        </span>
      </span>
    </span>
  );
}

function GeneratorScene({
  generated,
  typing,
}: {
  readonly generated: boolean;
  readonly typing: boolean;
}) {
  const content = s12PasswordManagerContent.generator;
  return (
    <div className={styles.generatorScene} data-s12-speech-obstacle>
      <div
        className={styles.generatedPasswordField}
        data-typing={typing || undefined}
        data-generated={generated || undefined}
        aria-label={`${content.fieldLabel}: ${content.password}`}
      >
        <span className={styles.generatedPasswordLabel}>{content.fieldLabel}</span>
        <div className={styles.generatedPasswordInput}>
          <output>
            {Array.from(content.password).map((character, index) => (
              <span
                className={styles.generatedCharacter}
                style={characterStyle(index)}
                key={`${index}-${character}`}
                aria-hidden="true"
              >
                {character}
              </span>
            ))}
          </output>
        </div>
      </div>

      <div className={styles.searchScale}>
        <strong className={styles.searchModelLabel}>{content.alphabetLabel}</strong>
        <div
          className={styles.searchSphere}
          data-typing={typing || undefined}
          role="group"
          aria-label={`${content.duration}; ${content.durationExplanation}`}
        >
          <div className={styles.searchSphereCore}>
            <strong>
              <span>{content.durationLead}</span>
              <span className={styles.searchDurationUnit}>
                {content.durationUnit}
                <SearchInformationControl />
              </span>
            </strong>
            <small>{content.durationExplanation}</small>
          </div>
        </div>
        <div className={styles.searchScaleAxis} aria-hidden="true">
          <i />
          <strong>{content.passwordLengthLabel}</strong>
        </div>
      </div>
    </div>
  );
}

function StorageScene({
  storing,
  stored,
  username,
}: {
  readonly storing: boolean;
  readonly stored: boolean;
  readonly username: string;
}) {
  const { generator, vault } = s12PasswordManagerContent;
  return (
    <div className={styles.storageScene} data-storing={storing || undefined}>
      {storing ? (
        <div className={styles.storageFlight} aria-hidden="true">
          <span>{vault.entry.account}</span>
          <span>{username}</span>
          <code>{generator.password}</code>
        </div>
      ) : null}
      <VaultVisual
        open={storing}
        storing={storing}
        showEntry={storing || stored}
        username={username}
      />
    </div>
  );
}

function AutofillValue({
  filling,
  filled,
  password = false,
  startDelayMs,
  value,
}: {
  readonly filling: boolean;
  readonly filled: boolean;
  readonly password?: boolean;
  readonly startDelayMs: number;
  readonly value: string;
}) {
  const characters = Array.from(value);
  return (
    <output
      className={styles.autofillValue}
      data-autofilling={filling || undefined}
      data-filled={filled || undefined}
      data-password={password || undefined}
      aria-label={filling || filled ? value : 'Leer'}
    >
      {filling || filled
        ? characters.map((character, index) => (
            <span
              className={styles.autofillCharacter}
              style={
                filling
                  ? autofillCharacterStyle(
                      startDelayMs + index * AUTOFILL_CHARACTER_DURATION_MS,
                    )
                  : undefined
              }
              aria-hidden="true"
              key={`${index}-${character}`}
            >
              {character === ' ' ? '\u00a0' : character}
            </span>
          ))
        : null}
    </output>
  );
}

function LoginPanel({
  filling,
  filled,
  username,
}: {
  readonly filling: boolean;
  readonly filled: boolean;
  readonly username: string;
}) {
  const { login, vault } = s12PasswordManagerContent;
  return (
    <section className={styles.loginPanel}>
      <h2>{login.title}</h2>
      <label data-field="username">
        <span>{login.usernameLabel}</span>
        <AutofillValue
          filling={filling}
          filled={filled}
          startDelayMs={AUTOFILL_USERNAME_START_MS}
          value={username}
        />
      </label>
      <label data-field="password">
        <span>{login.passwordLabel}</span>
        <AutofillValue
          filling={filling}
          filled={filled}
          password
          startDelayMs={AUTOFILL_USERNAME_START_MS}
          value={vault.entry.maskedPassword}
        />
      </label>
      <button className={styles.loginSubmitButton} type="button" disabled>
        {login.submitLabel}
      </button>
    </section>
  );
}

function AutofillScene({
  filling,
  filled,
  username,
}: {
  readonly filling: boolean;
  readonly filled: boolean;
  readonly username: string;
}) {
  const { vault } = s12PasswordManagerContent;
  return (
    <div className={styles.autofillScene}>
      <div className={styles.autofillVault}>
        <VaultVisual open opening={filling} showEntry compact username={username} />
      </div>
      {filling ? (
        <div className={styles.autofillToken} aria-hidden="true">
          <strong>{vault.entry.account}</strong>
          <span>{username}</span>
          <code>{vault.entry.maskedPassword}</code>
        </div>
      ) : null}
      <LoginPanel filling={filling} filled={filled} username={username} />
    </div>
  );
}

function VariantCard({
  kind,
  active,
  browserFocused,
  children,
}: {
  readonly kind: 'integrated' | 'separate';
  readonly active: boolean;
  readonly browserFocused?: boolean;
  readonly children?: ReactNode;
}) {
  const variant = s12PasswordManagerContent.variants[kind];
  return (
    <article
      className={styles.variantCard}
      data-kind={kind}
      data-active={active || undefined}
      data-browser-focused={browserFocused || undefined}
      data-s12-speech-obstacle
    >
      <div className={styles.variantCardVisual}>
        <img
          className={styles.variantArtwork}
          src={
            kind === 'integrated'
              ? integratedPasswordManagerAsset
              : standalonePasswordManagerAsset
          }
          width={1254}
          height={1254}
          alt=""
          aria-hidden="true"
        />
      </div>
      <h2>{variant.title}</h2>
      <ul>
        {variant.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {children}
    </article>
  );
}

function VariantScene({
  active,
  browserFocused,
  phase,
  username,
}: {
  readonly active: 'integrated' | 'separate' | null;
  readonly browserFocused: boolean;
  readonly phase: 'transition' | 'reveal' | 'ready';
  readonly username: string;
}) {
  const passphrase = s12PasswordManagerContent.variants.passphrasePreview;
  return (
    <div className={styles.variantScene} data-reveal-phase={phase}>
      <div className={styles.variantVault} data-s12-speech-obstacle>
        <VaultVisual
          open={phase === 'transition'}
          lockHighlighted={active === 'separate'}
          compact
          username={username}
        />
      </div>
      {phase === 'transition' ? null : (
        <>
          <div className={styles.variantConnector} aria-hidden="true">
            <svg className={styles.variantArrows} viewBox="0 0 1000 88">
              <path pathLength="1" d="M500 3v18M500 21 250 75M500 21l250 54" />
              <path pathLength="1" d="m266 67-16 8 18 2M734 67l16 8-18 2" />
            </svg>
          </div>
          <div className={styles.variantCards}>
            <VariantCard
              kind="integrated"
              active={active === 'integrated'}
              browserFocused={browserFocused}
            />
            <VariantCard kind="separate" active={active === 'separate'}>
              {active === 'separate' ? (
                <div
                  className={styles.passphrasePreview}
                  aria-label={s12PasswordManagerContent.variants.passphrasePreviewAriaLabel}
                >
                  {passphrase.map((word, index) => (
                    <span className={styles.passphrasePart} key={`${word}-${index}`}>
                      <strong>{word}</strong>
                      {index < passphrase.length - 1 ? (
                        <i aria-hidden="true">-</i>
                      ) : null}
                    </span>
                  ))}
                </div>
              ) : null}
            </VariantCard>
          </div>
        </>
      )}
    </div>
  );
}

export interface S12PasswordManagerTrainingProps {
  readonly displayName?: string;
  readonly onBrowserHighlightChange?: (highlighted: boolean) => void;
}

export function S12PasswordManagerTraining({
  displayName = '',
  onBrowserHighlightChange,
}: S12PasswordManagerTrainingProps) {
  const accountUsername =
    displayName.trim() === ''
      ? s12PasswordManagerContent.vault.entry.username
      : deriveCampusIdentity(displayName).campusgram;
  const [state, send] = useMachine(s12PasswordManagerMachine, {
    input: motionDurations(accountUsername.length),
  });
  const vaultOpening = state.matches('vaultOpening');
  const intro = state.matches('intro');
  const generating = state.matches('generating');
  const generated = state.matches('generated');
  const storing = state.matches('storing');
  const stored = state.matches('stored');
  const filling = state.matches('filling');
  const filled = state.matches('filled');
  const access = state.matches('access');
  const variantsTransition = state.matches('variantsTransition');
  const variantsReveal = state.matches('variantsReveal');
  const variants = state.matches('variants');
  const separate = state.matches('separate');
  const integrated = state.matches('integrated');
  const practice = state.matches('practice');
  const showingVariants =
    variantsTransition || variantsReveal || variants || separate || integrated || practice;

  useEffect(() => {
    onBrowserHighlightChange?.(practice);
    return () => {
      if (practice) onBrowserHighlightChange?.(false);
    };
  }, [onBrowserHighlightChange, practice]);

  const activeFlowId: S12FlowId | null =
    vaultOpening || intro || generating || generated
      ? 'generate'
      : storing || stored
        ? 'store'
        : filling || filled || access
          ? 'fill'
          : null;
  const completedFunctionCount = filled || access
    ? 3
    : stored || filling
      ? 2
      : generated || storing
        ? 1
        : 0;

  const speech = intro
    ? {
        id: 's12-manager-intro',
        paragraphs: [s12PasswordManagerContent.guide.steps.intro],
      }
    : generated
      ? {
          id: 's12-manager-generate',
          paragraphs: [s12PasswordManagerContent.guide.steps.generate],
        }
      : stored
        ? {
            id: 's12-manager-store',
            paragraphs: [s12PasswordManagerContent.guide.steps.store],
          }
        : filled
          ? {
              id: 's12-manager-fill',
              paragraphs: [s12PasswordManagerContent.guide.steps.fill],
            }
          : access
            ? {
                id: 's12-manager-access',
                paragraphs: [s12PasswordManagerContent.guide.steps.access],
              }
            : variants
              ? {
                  id: 's12-manager-variants',
                  paragraphs: [s12PasswordManagerContent.guide.steps.variants],
                }
              : separate
                ? {
                    id: 's12-manager-separate',
                    paragraphs: [s12PasswordManagerContent.guide.steps.separate],
                  }
                : integrated
                  ? {
                      id: 's12-manager-integrated',
                      paragraphs: [s12PasswordManagerContent.guide.steps.integrated],
                    }
                  : practice
                    ? {
                        id: 's12-manager-practice',
                        paragraphs: s12PasswordManagerContent.guide.steps.practice,
                      }
                    : null;

  return (
    <section
      className={styles.lesson}
      data-phase={String(state.value)}
      aria-label={s12PasswordManagerContent.trainingAriaLabel}
    >
      <div className={styles.visualStage}>
        {showingVariants ? (
          <VariantScene
            active={separate ? 'separate' : integrated || practice ? 'integrated' : null}
            browserFocused={practice}
            phase={
              variantsTransition ? 'transition' : variantsReveal ? 'reveal' : 'ready'
            }
            username={accountUsername}
          />
        ) : (
          <div className={styles.functionScene}>
            <FlowStrip
              activeId={activeFlowId}
              completedCount={completedFunctionCount}
            />
            <div className={styles.functionWorkbench}>
              {generating || generated ? (
                <GeneratorScene generated={generated} typing={generating} />
              ) : storing || stored ? (
                <StorageScene
                  storing={storing}
                  stored={stored}
                  username={accountUsername}
                />
              ) : filling || filled || access ? (
                <AutofillScene
                  filling={filling}
                  filled={filled || access}
                  username={accountUsername}
                />
              ) : (
                <div
                  className={styles.handoffVault}
                  data-opening={vaultOpening || undefined}
                >
                  <VaultVisual
                    open={vaultOpening || intro}
                    opening={vaultOpening}
                    compact={false}
                    username={accountUsername}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {speech === null ? null : (
        <div className={styles.guideLayer}>
          <PassWoGuide
            guideName={s12PasswordManagerContent.guide.name}
            taskLabel={s12PasswordManagerContent.guide.taskLabel}
            helpOpen
            helpId="s12-password-manager-speech"
            openHelpLabel="PassWo-Hinweis öffnen"
            speech={speech.paragraphs}
            speechEmphasis={passWoSpeechEmphasisFor(speech.id)}
            speechKey={speech.id}
            speechObstacleSelector="[data-s12-speech-obstacle]"
            {...(practice
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
        </div>
      )}
    </section>
  );
}
