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
  readonly onComplete?: () => void;
  readonly onAdvance?: () => void;
}

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
  return (
    container !== null &&
    target instanceof Element &&
    container.contains(target) &&
    target.closest('button, input, select, textarea, a, [role="button"], [role="checkbox"]') !==
      null
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
  onComplete,
  onAdvance,
}: PassWoSpeechBubbleProps) {
  const fullText = useMemo(() => paragraphs.join('\n\n'), [paragraphs]);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [advanceCompleted, setAdvanceCompleted] = useState(false);
  const descriptionId = useId();
  const bubbleRef = useRef<HTMLElement | null>(null);
  const completedSpeechKeyRef = useRef<string | null>(null);
  const complete = visibleCharacters >= fullText.length;

  useEffect(() => {
    const initiallyComplete = prefersReducedMotion() || fullText.length === 0;
    completedSpeechKeyRef.current = null;
    setVisibleCharacters(initiallyComplete ? fullText.length : 0);
    setAdvanceCompleted(false);
  }, [fullText, speechKey]);

  useEffect(() => {
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
  }, [complete, fullText, onComplete, speechKey, visibleCharacters]);

  const advanceSpeech = useCallback((): void => {
    if (!complete) {
      setVisibleCharacters(fullText.length);
      return;
    }
    if (advanceCompleted) return;

    setAdvanceCompleted(true);
    onAdvance?.();
  }, [advanceCompleted, complete, fullText, onAdvance]);

  useEffect(() => {
    if (advanceCompleted) return;

    function handleScreenClick(event: MouseEvent): void {
      if (isInteractiveTarget(event.target, bubbleRef.current)) return;

      event.preventDefault();
      event.stopPropagation();
      advanceSpeech();
    }

    document.addEventListener('click', handleScreenClick, true);
    return () => document.removeEventListener('click', handleScreenClick, true);
  }, [advanceCompleted, advanceSpeech]);

  const visibleText = fullText.slice(0, visibleCharacters);
  const bubbleClassName = className === undefined ? styles.bubble : `${styles.bubble} ${className}`;
  const actionLabel = complete ? (hasNext ? 'Nächste' : 'Ende') : 'Überspringen';

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
        <span className={styles.visualText} aria-hidden="true">
          {visualParagraphs(visibleText).map((paragraph, index) => (
            <span className={styles.paragraph} key={`${speechKey}-${index}`}>
              {paragraph}
              {!complete && index === visualParagraphs(visibleText).length - 1 ? (
                <span className={styles.caret} />
              ) : null}
            </span>
          ))}
        </span>
      </button>
      {!advanceCompleted ? (
        <div className={styles.speechActionRow}>
          <button
            type="button"
            className={styles.speechAction}
            onClick={advanceSpeech}
          >
            {actionLabel}
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
