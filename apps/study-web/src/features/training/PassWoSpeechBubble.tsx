import { useId, useMemo, type CSSProperties, type ReactNode } from 'react';
import { NetworkSymbol } from '../../adapters/network/NetworkSymbolRegistry.js';
import type { PassWoSpeechEmphasis } from './PassWoSpeechEmphasis.js';
import type { PassWoSpeechSide } from './PassWoSpeechPosition.js';
import styles from './PassWoSpeechBubble.module.css';

export type PassWoSpeechPlacement = PassWoSpeechSide;
export type PassWoSpeechTone = 'light' | 'dark';

export interface PassWoSpeechAction {
  readonly kind: 'advance' | 'dismiss';
  readonly onAction: () => void;
}

export interface PassWoSpeechBubbleProps {
  readonly speaker: string;
  readonly paragraphs: readonly string[];
  readonly speechKey: string;
  readonly placement?: PassWoSpeechPlacement;
  readonly tone?: PassWoSpeechTone;
  readonly emphasis?: readonly PassWoSpeechEmphasis[];
  readonly footer?: ReactNode;
  readonly className?: string | undefined;
  readonly action?: PassWoSpeechAction;
  readonly arrowOffset?: number;
}

const noSpeechEmphasis: readonly PassWoSpeechEmphasis[] = [];

function visualParagraphs(text: string): readonly string[] {
  return text.split('\n\n');
}

interface SpeechParagraphLayout {
  readonly segments: readonly SpeechTextSegment[];
}

interface SpeechTextSegment {
  readonly text: string;
  readonly emphasis?: PassWoSpeechEmphasis & { readonly showSymbol: boolean };
}

function createParagraphLayout(
  text: string,
  emphasisRules: readonly PassWoSpeechEmphasis[],
): readonly SpeechParagraphLayout[] {
  const shownSymbolIds = new Set<string>();

  return visualParagraphs(text).map((paragraph) => {
    const segments: SpeechTextSegment[] = [];
    let textOffset = 0;
    let plainText = '';

    function pushPlainText(): void {
      if (plainText.length === 0) return;
      segments.push({ text: plainText });
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
      segments.push({ text: matchingRule.phrase, emphasis: { ...matchingRule, showSymbol } });
      textOffset += matchingRule.phrase.length;
    }

    pushPlainText();
    return { segments };
  });
}

export function PassWoSpeechBubble({
  speaker,
  paragraphs,
  speechKey,
  placement = 'right',
  tone = 'light',
  emphasis = noSpeechEmphasis,
  footer,
  className,
  action,
  arrowOffset,
}: PassWoSpeechBubbleProps) {
  const fullText = useMemo(() => paragraphs.join('\n\n'), [paragraphs]);
  const paragraphLayout = useMemo(
    () => createParagraphLayout(fullText, emphasis),
    [emphasis, fullText],
  );
  const headingId = useId();
  const bubbleClassName = className === undefined ? styles.bubble : `${styles.bubble} ${className}`;
  const actionLabel = action?.kind === 'dismiss' ? 'Schließen' : 'Weiter';
  const bubbleStyle: CSSProperties | undefined =
    arrowOffset === undefined
      ? undefined
      : ({ '--speech-arrow-offset': `${arrowOffset}px` } as CSSProperties);

  return (
    <section
      className={bubbleClassName}
      data-placement={placement}
      data-tone={tone}
      aria-labelledby={headingId}
      style={bubbleStyle}
    >
      <span id={headingId} className={styles.screenReaderOnly}>
        {speaker} sagt:
      </span>
      <div className={styles.textLayout} key={speechKey}>
        {paragraphLayout.map(({ segments }, paragraphIndex) => (
            <span className={styles.paragraph} key={`${speechKey}-${paragraphIndex}`}>
              {segments.map((segment, segmentIndex) => {
                if (segment.emphasis === undefined) {
                  return <span key={`${speechKey}-${paragraphIndex}-${segmentIndex}`}>{segment.text}</span>;
                }

                return (
                  <strong
                    className={styles.emphasis}
                    data-emphasis-tone={segment.emphasis.tone}
                    key={`${speechKey}-${paragraphIndex}-${segmentIndex}`}
                  >
                    {segment.text}
                    {segment.emphasis.symbolId === undefined ||
                    !segment.emphasis.showSymbol ? null : (
                      <span className={styles.inlineSymbol} aria-hidden="true">
                        <NetworkSymbol symbolId={segment.emphasis.symbolId} />
                      </span>
                    )}
                  </strong>
                );
              })}
            </span>
          ))}
      </div>
      {action === undefined ? null : (
        <div className={styles.actionRow}>
          <button type="button" className={styles.primaryAction} onClick={action.onAction}>
            {actionLabel}
          </button>
        </div>
      )}
      {footer === undefined ? null : <div className={styles.footer}>{footer}</div>}
    </section>
  );
}
