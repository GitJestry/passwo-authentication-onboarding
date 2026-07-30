import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { NetworkSymbol } from '../../adapters/network/NetworkSymbolRegistry.js';
import {
  defaultPassWoSpeechEmphasis,
  type PassWoSpeechEmphasis,
} from './PassWoSpeechEmphasis.js';
import styles from './PassWoSpeechBubble.module.css';

export type PassWoSpeechPlacement = 'right' | 'left' | 'above-right' | 'above-left';
export type PassWoSpeechTone = 'light' | 'dark';

export interface PassWoSpeechBubbleProps {
  readonly speaker: string;
  readonly paragraphs: readonly string[];
  readonly speechKey: string;
  readonly placement?: PassWoSpeechPlacement;
  readonly tone?: PassWoSpeechTone;
  readonly emphasis?: readonly PassWoSpeechEmphasis[];
  readonly footer?: ReactNode;
  readonly className?: string | undefined;
  readonly hasNext?: boolean;
  readonly awaitsAction?: boolean;
  readonly advanceOnScreenClick?: boolean;
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

interface SpeechParagraphLayout {
  readonly segments: readonly SpeechTextSegment[];
  readonly paragraphOffset: number;
}

interface SpeechTextSegment {
  readonly text: string;
  readonly characterOffset: number;
  readonly emphasis?: PassWoSpeechEmphasis & { readonly showSymbol: boolean };
}

function createParagraphLayout(
  text: string,
  emphasisRules: readonly PassWoSpeechEmphasis[],
): readonly SpeechParagraphLayout[] {
  let characterOffset = 0;
  const shownSymbolIds = new Set<string>();

  return visualParagraphs(text).map((paragraph) => {
    const paragraphOffset = characterOffset;
    const segments: SpeechTextSegment[] = [];
    let textOffset = 0;
    let plainText = '';

    function pushPlainText(): void {
      if (plainText.length === 0) return;
      segments.push({ text: plainText, characterOffset });
      characterOffset += Array.from(plainText).length;
      plainText = '';
    }

    while (textOffset < paragraph.length) {
      const matchingRule = emphasisRules
        .filter(({ phrase }) => phrase.length > 0 && paragraph.startsWith(phrase, textOffset))
        .sort((first, second) => second.phrase.length - first.phrase.length)[0];

      if (matchingRule === undefined) {
        const character = Array.from(paragraph.slice(textOffset))[0];
        if (character === undefined) break;
        plainText += character;
        textOffset += character.length;
        continue;
      }

      pushPlainText();
      const showSymbol =
        matchingRule.symbolId !== undefined && !shownSymbolIds.has(matchingRule.symbolId);
      if (showSymbol && matchingRule.symbolId !== undefined) {
        shownSymbolIds.add(matchingRule.symbolId);
      }
      segments.push({
        text: matchingRule.phrase,
        characterOffset,
        emphasis: { ...matchingRule, showSymbol },
      });
      characterOffset += Array.from(matchingRule.phrase).length;
      textOffset += matchingRule.phrase.length;
    }

    pushPlainText();
    const layout = { segments, paragraphOffset };
    characterOffset += 2;
    return layout;
  });
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

function isKeyboardInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return (
    target.closest(
      'button, input, select, textarea, a, [contenteditable="true"], [role="button"], [role="checkbox"]',
    ) !== null
  );
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
  emphasis = defaultPassWoSpeechEmphasis,
  footer,
  className,
  hasNext = false,
  awaitsAction = false,
  advanceOnScreenClick = true,
  onComplete,
  onAdvance,
}: PassWoSpeechBubbleProps) {
  const fullText = useMemo(() => paragraphs.join('\n\n'), [paragraphs]);
  const fullCharacters = useMemo(() => Array.from(fullText), [fullText]);
  const paragraphLayout = useMemo(
    () => createParagraphLayout(fullText, emphasis),
    [emphasis, fullText],
  );
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [advanceCompleted, setAdvanceCompleted] = useState(false);
  const [activeSpeechKey, setActiveSpeechKey] = useState(speechKey);
  const descriptionId = useId();
  const bubbleRef = useRef<HTMLElement | null>(null);
  const completedSpeechKeyRef = useRef<string | null>(null);
  const currentSpeech = activeSpeechKey === speechKey;
  const complete = currentSpeech && visibleCharacters >= fullCharacters.length;

  useEffect(() => {
    const initiallyComplete = prefersReducedMotion() || fullCharacters.length === 0;
    setActiveSpeechKey(speechKey);
    completedSpeechKeyRef.current = null;
    setVisibleCharacters(initiallyComplete ? fullCharacters.length : 0);
    setAdvanceCompleted(false);
  }, [fullCharacters, speechKey]);

  useEffect(() => {
    if (!currentSpeech) return;
    if (complete) {
      if (completedSpeechKeyRef.current !== speechKey) {
        completedSpeechKeyRef.current = speechKey;
        onComplete?.();
      }
      return;
    }

    const character = fullCharacters[visibleCharacters] ?? '';
    const timer = window.setTimeout(
      () => setVisibleCharacters((current) => Math.min(current + 1, fullCharacters.length)),
      nextDelay(character),
    );
    return () => window.clearTimeout(timer);
  }, [
    complete,
    currentSpeech,
    fullCharacters,
    onComplete,
    speechKey,
    visibleCharacters,
  ]);

  const advanceSpeech = useCallback((): void => {
    if (!currentSpeech) return;
    if (!complete) {
      setVisibleCharacters(fullCharacters.length);
      return;
    }
    if (advanceCompleted) return;

    setAdvanceCompleted(true);
    onAdvance?.();
  }, [advanceCompleted, complete, currentSpeech, fullCharacters.length, onAdvance]);

  useEffect(() => {
    if (advanceCompleted || awaitsAction || !advanceOnScreenClick) return;

    function handleScreenClick(event: MouseEvent): void {
      if (isInteractiveTarget(event.target, bubbleRef.current)) return;

      event.preventDefault();
      event.stopPropagation();
      advanceSpeech();
    }

    document.addEventListener('click', handleScreenClick, true);
    return () => document.removeEventListener('click', handleScreenClick, true);
  }, [advanceCompleted, advanceOnScreenClick, advanceSpeech, awaitsAction]);

  useEffect(() => {
    if (advanceCompleted || (complete && awaitsAction)) return;

    function handleSpaceKey(event: KeyboardEvent): void {
      if (
        event.code !== 'Space' ||
        event.repeat ||
        event.defaultPrevented ||
        isKeyboardInteractiveTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();
      advanceSpeech();
    }

    document.addEventListener('keydown', handleSpaceKey);
    return () => document.removeEventListener('keydown', handleSpaceKey);
  }, [advanceCompleted, advanceSpeech, awaitsAction, complete]);

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
        onClick={() => setVisibleCharacters(fullCharacters.length)}
      >
        <span className={styles.textLayout} aria-hidden="true">
          {paragraphLayout.map(({ segments, paragraphOffset }, paragraphIndex) => (
            <span className={styles.paragraph} key={`${speechKey}-${paragraphIndex}`}>
              {segments.map((segment, segmentIndex) => {
                const characters = Array.from(segment.text).map((character, characterIndex) => {
                  const characterPosition = segment.characterOffset + characterIndex;
                  const isVisible = currentSpeech && characterPosition < visibleCharacters;
                  const showsCaret = !complete && characterPosition === visibleCharacters - 1;

                  return (
                    <span
                      className={styles.character}
                      data-caret={showsCaret}
                      data-visible={isVisible}
                      key={`${speechKey}-${paragraphIndex}-${segmentIndex}-${characterIndex}`}
                    >
                      {character}
                    </span>
                  );
                });

                if (segment.emphasis === undefined) {
                  return (
                    <span key={`${speechKey}-${paragraphIndex}-${segmentIndex}`}>
                      {characters}
                    </span>
                  );
                }

                const segmentEnd =
                  segment.characterOffset + Array.from(segment.text).length;
                return (
                  <strong
                    className={styles.emphasis}
                    data-emphasis-tone={segment.emphasis.tone}
                    key={`${speechKey}-${paragraphIndex}-${segmentIndex}`}
                  >
                    {characters}
                    {segment.emphasis.symbolId === undefined ||
                    !segment.emphasis.showSymbol ? null : (
                      <span
                        className={styles.inlineSymbol}
                        data-visible={currentSpeech && visibleCharacters >= segmentEnd}
                      >
                        <NetworkSymbol symbolId={segment.emphasis.symbolId} />
                      </span>
                    )}
                  </strong>
                );
              })}
              {!complete && visibleCharacters === paragraphOffset ? (
                <span className={styles.initialCaret} />
              ) : null}
            </span>
          ))}
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
