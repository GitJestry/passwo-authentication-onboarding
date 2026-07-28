import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
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
  readonly onComplete?: () => void;
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

export function PassWoSpeechBubble({
  speaker,
  paragraphs,
  speechKey,
  placement = 'right',
  tone = 'light',
  footer,
  className,
  onComplete,
}: PassWoSpeechBubbleProps) {
  const fullText = useMemo(() => paragraphs.join('\n\n'), [paragraphs]);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const descriptionId = useId();
  const completedSpeechKeyRef = useRef<string | null>(null);
  const complete = visibleCharacters >= fullText.length;

  useEffect(() => {
    const initiallyComplete = prefersReducedMotion() || fullText.length === 0;
    completedSpeechKeyRef.current = null;
    setVisibleCharacters(initiallyComplete ? fullText.length : 0);
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

  const visibleText = fullText.slice(0, visibleCharacters);
  const bubbleClassName = className === undefined ? styles.bubble : `${styles.bubble} ${className}`;

  return (
    <section
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
      <span id={descriptionId} className={styles.screenReaderOnly}>
        {fullText}
      </span>
      {footer === undefined ? null : <div className={styles.footer}>{footer}</div>}
    </section>
  );
}
