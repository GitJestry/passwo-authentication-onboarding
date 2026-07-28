import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import styles from './PassWoSpeechBubble.module.css';

export type PassWoSpeechPlacement = 'right' | 'left' | 'above-right' | 'above-left';
export type PassWoSpeechTone = 'light' | 'dark';

export interface PassWoSpeechBubbleProps {
  readonly speaker: string;
  readonly paragraphs: readonly string[];
  readonly speechKey: string;
  readonly placement?: PassWoSpeechPlacement;
  readonly tone?: PassWoSpeechTone;
  readonly footer?: ReactNode;
  readonly className?: string | undefined;
  readonly hasNext?: boolean;
  readonly awaitsAction?: boolean;
  readonly onComplete?: () => void;
  readonly onAdvance?: () => void;
}

type SpeechActionKind = 'skip' | 'next' | 'close';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function nextDelay(character: string): number {
  if (character === '\n') return 180;
  if (/[.!?]/u.test(character)) return 150;
  if (/[,;:]/u.test(character)) return 72;
  return 22;
}

function visualParagraphs(text: string): readonly string[] {
  return text.split('\n\n');
}

function isInteractiveTarget(target: EventTarget | null, container: HTMLElement | null): boolean {
  if (container === null || !(target instanceof Element) || !container.contains(target)) {
    return false;
  }

  const interactiveElement = target.closest(
    'button, input, select, textarea, a, [role="button"], [role="checkbox"]',
  );
  return interactiveElement !== null && !interactiveElement.matches(':disabled');
}

function SpeechActionIcon({ kind }: { readonly kind: SpeechActionKind }) {
  if (kind === 'skip') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="m4 6 6 6-6 6V6Z" fill="currentColor" />
        <path d="m10.5 6 6 6-6 6V6Z" fill="currentColor" />
        <path d="M19 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'next') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 12h15M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PassWoSpeechBubble({
  speaker,
  paragraphs,
  speechKey,
  placement = 'right',
  tone = 'light',
  footer,
  className,
  hasNext = false,
  awaitsAction = false,
  onComplete,
  onAdvance,
}: PassWoSpeechBubbleProps) {
  const fullText = useMemo(() => paragraphs.join('\n\n'), [paragraphs]);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [advanceCompleted, setAdvanceCompleted] = useState(false);
  const [activeSpeechKey, setActiveSpeechKey] = useState(speechKey);
  const descriptionId = useId();
  const bubbleRef = useRef<HTMLElement | null>(null);
  const completedSpeechKeyRef = useRef<string | null>(null);
  const currentSpeech = activeSpeechKey === speechKey;
  const complete = currentSpeech && visibleCharacters >= fullText.length;

  useEffect(() => {
    const initiallyComplete = prefersReducedMotion() || fullText.length === 0;
    setActiveSpeechKey(speechKey);
    completedSpeechKeyRef.current = null;
    setVisibleCharacters(initiallyComplete ? fullText.length : 0);
    setAdvanceCompleted(false);
  }, [fullText, speechKey]);

  useEffect(() => {
    if (!currentSpeech) return;
    if (complete) {
      if (completedSpeechKeyRef.current !== speechKey) {
        completedSpeechKeyRef.current = speechKey;
        onComplete?.();
      }
      return;
    }

    const character = fullText[visibleCharacters] ?? '';
    const timer = window.setTimeout(
      () => setVisibleCharacters((current) => Math.min(current + 1, fullText.length)),
      nextDelay(character),
    );
    return () => window.clearTimeout(timer);
  }, [complete, currentSpeech, fullText, onComplete, speechKey, visibleCharacters]);

  const advanceSpeech = useCallback((): void => {
    if (!currentSpeech) return;
    if (!complete) {
      setVisibleCharacters(fullText.length);
      return;
    }
    if (advanceCompleted) return;

    setAdvanceCompleted(true);
    onAdvance?.();
  }, [advanceCompleted, complete, currentSpeech, fullText, onAdvance]);

  useEffect(() => {
    if (advanceCompleted || (complete && awaitsAction)) return;

    function handleScreenClick(event: MouseEvent): void {
      if (isInteractiveTarget(event.target, bubbleRef.current)) return;

      event.preventDefault();
      event.stopPropagation();
      advanceSpeech();
    }

    document.addEventListener('click', handleScreenClick, true);
    return () => document.removeEventListener('click', handleScreenClick, true);
  }, [advanceCompleted, advanceSpeech, awaitsAction, complete]);

  const visibleText = currentSpeech ? fullText.slice(0, visibleCharacters) : '';
  const bubbleClassName = className === undefined ? styles.bubble : `${styles.bubble} ${className}`;
  const actionKind: SpeechActionKind = !complete ? 'skip' : hasNext ? 'next' : 'close';
  const actionLabel =
    actionKind === 'skip' ? 'Überspringen' : actionKind === 'next' ? 'Nächste' : 'Schließen';
  const showAction = !advanceCompleted && (!complete || !awaitsAction);

  return (
    <section
      ref={bubbleRef}
      className={bubbleClassName}
      data-placement={placement}
      data-speaking={!complete}
      data-tone={tone}
      aria-label={`${speaker} sagt: ${fullText}`}
    >
      <span className={styles.speaker}>{speaker}</span>
      <button
        type="button"
        className={styles.textButton}
        aria-describedby={descriptionId}
        aria-label={complete ? `${speaker}-Text` : `${speaker}-Text vollständig anzeigen`}
        disabled={complete}
        onClick={() => setVisibleCharacters(fullText.length)}
      >
        <span className={styles.textLayout} aria-hidden="true">
          <span className={styles.fullTextSizer}>
            {visualParagraphs(fullText).map((paragraph, index) => (
              <span className={styles.paragraph} key={`${speechKey}-full-${index}`}>
                {paragraph}
              </span>
            ))}
          </span>
          <span className={styles.visualText}>
            {visualParagraphs(visibleText).map((paragraph, index) => (
              <span className={styles.paragraph} key={`${speechKey}-${index}`}>
                {paragraph}
                {!complete && index === visualParagraphs(visibleText).length - 1 ? (
                  <span className={styles.caret} />
                ) : null}
              </span>
            ))}
          </span>
        </span>
      </button>
      {showAction ? (
        <div className={styles.speechActionRow}>
          <button
            type="button"
            className={styles.speechAction}
            onClick={advanceSpeech}
            aria-label={actionLabel}
            data-tooltip={actionLabel}
          >
            <SpeechActionIcon kind={actionKind} />
          </button>
        </div>
      ) : null}
      <span id={descriptionId} className={styles.screenReaderOnly}>
        {fullText}
      </span>
      {footer === undefined ? null : <div className={styles.footer}>{footer}</div>}
    </section>
  );
}
