import { s12PasswordManagerContent } from '@passwo/training-content';
import { deriveCampusIdentity } from '@passwo/training-engine';
import { useMachine } from '@xstate/react';
import type { CSSProperties, ReactNode } from 'react';
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
const AUTOFILL_USERNAME_START_MS = 980;
const AUTOFILL_PASSWORD_START_GAP_MS = 280;

function motionDurations(usernameLength: number) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reducedMotion
    ? {
        handoffDurationMs: 0,
        vaultOpeningDurationMs: 0,
        generationDurationMs: 0,
        storageDurationMs: 0,
        autofillDurationMs: 0,
      }
    : {
        handoffDurationMs: 2200,
        vaultOpeningDurationMs: 1200,
        generationDurationMs: 1900,
        storageDurationMs: 1700,
        autofillDurationMs:
          AUTOFILL_USERNAME_START_MS +
          usernameLength * AUTOFILL_CHARACTER_DURATION_MS +
          AUTOFILL_PASSWORD_START_GAP_MS +
          s12PasswordManagerContent.vault.entry.maskedPassword.length *
            AUTOFILL_CHARACTER_DURATION_MS +
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
  return (
    <div
      className={styles.vault}
      data-open={open || undefined}
      data-storing={storing || undefined}
      data-lock-highlighted={lockHighlighted || undefined}
      data-compact={compact || undefined}
      data-opening={opening || undefined}
      role="img"
      aria-label={`${content.label}, ${open ? content.states.open : content.states.closed}${
        !open && !compact ? `, ${content.storedCount} ${content.states.stored}` : ''
      }`}
    >
      <div className={styles.vaultCabinet}>
        <div className={styles.vaultInterior} aria-hidden="true">
          <span className={styles.vaultShelf} />
          {showEntry ? (
            <span className={styles.vaultStoredEntry}>
              <strong>{content.entry.account}</strong>
              <span>{username}</span>
              <code>{content.entry.maskedPassword}</code>
            </span>
          ) : null}
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
            <span className={styles.vaultCount}>{content.storedCount}</span>
          ) : null}
        </div>
      </div>
      <span className={styles.vaultBase} aria-hidden="true" />
    </div>
  );
}

function FlowStrip({
  activeId,
  allComplete,
}: {
  readonly activeId: S12FlowId | null;
  readonly allComplete: boolean;
}) {
  const activeIndex = s12PasswordManagerContent.flow.findIndex(({ id }) => id === activeId);
  return (
    <ol className={styles.flowStrip} aria-label={s12PasswordManagerContent.flowAriaLabel}>
      {s12PasswordManagerContent.flow.map((item, index) => {
        const complete = allComplete || (activeIndex >= 0 && index < activeIndex);
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

function GeneratorScene({ typing }: { readonly typing: boolean }) {
  const content = s12PasswordManagerContent.generator;
  return (
    <div className={styles.generatorScene} data-s12-speech-obstacle>
      <div
        className={styles.generatedPasswordField}
        data-typing={typing || undefined}
        aria-label={`${content.fieldLabel}: ${content.password}`}
      >
        <span>{content.fieldLabel}</span>
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
        <strong>{content.passwordLengthLabel}</strong>
      </div>

      <div
        className={styles.searchSphere}
        data-typing={typing || undefined}
        role="img"
        aria-label={`${content.duration}; ${content.alphabetSize}; ${content.attemptsPerSecond}; ${content.combinations}; ${content.durationExplanation}`}
      >
        <div className={styles.searchSphereCore}>
          <strong>{content.duration}</strong>
          <div className={styles.searchSphereFacts}>
            <span>{content.alphabetSize}</span>
            <span>{content.attemptsPerSecond}</span>
            <span>{content.combinations}</span>
          </div>
          <small>{content.durationExplanation}</small>
        </div>
      </div>
    </div>
  );
}

function StorageScene({
  storing,
  username,
}: {
  readonly storing: boolean;
  readonly username: string;
}) {
  const { generator, vault } = s12PasswordManagerContent;
  return (
    <div className={styles.storageScene} data-storing={storing || undefined}>
      {storing ? (
        <div className={styles.storageFlight} aria-hidden="true">
          <span>{vault.entry.account}</span>
          <code>{generator.password}</code>
        </div>
      ) : null}
      <VaultVisual
        open={storing}
        storing={storing}
        showEntry={storing}
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
              {character}
            </span>
          ))
        : null}
    </output>
  );
}

function ShopMark() {
  return (
    <svg className={styles.shopMark} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 18h28l-2.6 22H12.6L10 18Z" />
      <path d="M17 20v-5a7 7 0 0 1 14 0v5" />
    </svg>
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
  const passwordStartDelayMs =
    AUTOFILL_USERNAME_START_MS +
    username.length * AUTOFILL_CHARACTER_DURATION_MS +
    AUTOFILL_PASSWORD_START_GAP_MS;
  return (
    <section className={styles.loginPanel} data-filling={filling || undefined}>
      <div className={styles.loginIdentity}>
        <ShopMark />
        <strong>{vault.entry.account}</strong>
      </div>
      <h2>{login.title}</h2>
      <label>
        <span>{login.usernameLabel}</span>
        <AutofillValue
          filling={filling}
          filled={filled}
          startDelayMs={AUTOFILL_USERNAME_START_MS}
          value={username}
        />
      </label>
      <label>
        <span>{login.passwordLabel}</span>
        <AutofillValue
          filling={filling}
          filled={filled}
          password
          startDelayMs={passwordStartDelayMs}
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
    <div className={styles.autofillScene} data-filling={filling || undefined}>
      <div className={styles.autofillVault}>
        <VaultVisual open opening={filling} showEntry compact username={username} />
      </div>
      {filling ? (
        <div className={styles.autofillToken} aria-hidden="true">
          <strong>{vault.entry.account}</strong>
          <span>{vault.entry.maskedPassword}</span>
        </div>
      ) : null}
      <LoginPanel filling={filling} filled={filled} username={username} />
    </div>
  );
}

function BrowserAndDeviceIcon({ unlocked }: { readonly unlocked: boolean }) {
  return (
    <svg className={styles.variantArtwork} viewBox="0 0 180 104" aria-hidden="true">
      <rect x="8" y="18" width="108" height="72" rx="10" />
      <path d="M8 36h108M20 27h.1M29 27h.1M38 27h.1" />
      <rect x="49" y="50" width="28" height="23" rx="6" />
      <path d="M55 50v-4a8 8 0 0 1 16 0v4M63 59v6" />
      <rect x="126" y="6" width="45" height="91" rx="11" />
      <path d="M140 15h17M143 88h11" />
      <rect x="139" y="43" width="19" height="17" rx="4" />
      <path d={unlocked ? 'M143 43v-5a6 6 0 0 1 11-3' : 'M143 43v-5a6 6 0 0 1 11 0v5'} />
    </svg>
  );
}

function SeparateAppsIcon() {
  return (
    <svg className={styles.variantArtwork} viewBox="0 0 180 104" aria-hidden="true">
      <rect x="7" y="14" width="115" height="74" rx="8" />
      <path d="M3 93h124M53 88l3 5h19l3-5" />
      <rect x="132" y="7" width="41" height="89" rx="10" />
      <rect x="42" y="31" width="46" height="39" rx="10" />
      <rect x="143" y="35" width="19" height="25" rx="5" />
      <path d="M53 49h24M65 41v16M148 48h9M152.5 42v12" />
      <circle cx="65" cy="49" r="11" />
      <circle cx="152.5" cy="48" r="7" />
    </svg>
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
        {kind === 'integrated' ? (
          <BrowserAndDeviceIcon unlocked={active} />
        ) : (
          <SeparateAppsIcon />
        )}
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
  username,
}: {
  readonly active: 'integrated' | 'separate' | null;
  readonly browserFocused: boolean;
  readonly username: string;
}) {
  const passphrase = s12PasswordManagerContent.variants.passphrasePreview;
  return (
    <div className={styles.variantScene}>
      <div className={styles.variantVault} data-s12-speech-obstacle>
        <VaultVisual
          open={false}
          lockHighlighted={active === 'separate'}
          compact
          username={username}
        />
      </div>
      <div className={styles.variantConnector} aria-hidden="true">
        <svg className={styles.variantArrows} viewBox="0 0 1000 88">
          <path d="M500 3v18M500 21 250 75M500 21l250 54" />
          <path d="m266 67-16 8 18 2M734 67l16 8-18 2" />
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
    </div>
  );
}

export interface S12PasswordManagerTrainingProps {
  readonly displayName?: string;
}

export function S12PasswordManagerTraining({
  displayName = '',
}: S12PasswordManagerTrainingProps) {
  const selectedUsername = deriveCampusIdentity(displayName).campusgram;
  const accountUsername = `${selectedUsername}@${s12PasswordManagerContent.vault.entry.usernameDomain}`;
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
  const variants = state.matches('variants');
  const separate = state.matches('separate');
  const integrated = state.matches('integrated');
  const practice = state.matches('practice');
  const showingVariants = variants || separate || integrated || practice;
  const activeFlowId: S12FlowId | null =
    generating || generated
      ? 'generate'
      : storing || stored
        ? 'store'
        : filling || filled || access
          ? 'fill'
          : null;
  const allFunctionsComplete = filled || access;

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
            username={accountUsername}
          />
        ) : (
          <div className={styles.functionScene}>
            <FlowStrip activeId={activeFlowId} allComplete={allFunctionsComplete} />
            <div className={styles.functionWorkbench}>
              {generating || generated ? (
                <GeneratorScene typing={generating} />
              ) : storing || stored ? (
                <StorageScene storing={storing} username={accountUsername} />
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
