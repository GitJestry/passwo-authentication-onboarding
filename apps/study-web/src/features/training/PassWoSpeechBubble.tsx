import { useId, useMemo, type CSSProperties, type ReactNode } from 'react';
import { NetworkSymbol } from '../../adapters/network/NetworkSymbolRegistry.js';
import type { PassWoSpeechEmphasis } from './PassWoSpeechEmphasis.js';
import type { PassWoSpeechSide } from './PassWoSpeechPosition.js';
import styles from './PassWoSpeechBubble.module.css';

export type PassWoSpeechPlacement = PassWoSpeechSide;
export type PassWoSpeechTone = 'light' | 'dark';

export type PassWoSpeechAction =
  | {
      readonly kind: 'advance';
      readonly label?: string;
      readonly onAction: () => void;
      readonly disabled?: boolean;
    }
  | {
      readonly kind: 'dismiss';
      readonly onAction: () => void;
      readonly disabled?: boolean;
    }
  | {
      readonly kind: 'perform';
      readonly label: string;
      readonly onAction: () => void;
      readonly disabled?: boolean;
    };

export interface PassWoSpeechBubbleProps {
  readonly speaker: string;
  readonly paragraphs: readonly string[];
  readonly placement?: PassWoSpeechPlacement;
  readonly tone?: PassWoSpeechTone;
  readonly emphasis?: readonly PassWoSpeechEmphasis[];
  readonly mutedParagraphIndexes?: readonly number[];
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
  const shownSymbols = new Set<string>();

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
      const symbolKey = matchingRule.symbolId ?? matchingRule.symbolSrc;
      const showSymbol = symbolKey !== undefined && !shownSymbols.has(symbolKey);
      if (showSymbol && symbolKey !== undefined) {
        shownSymbols.add(symbolKey);
      }
      segments.push({ text: matchingRule.phrase, emphasis: { ...matchingRule, showSymbol } });
      textOffset += matchingRule.phrase.length;
    }

    pushPlainText();
    return { segments };
  });
}

function visibleEmphasis(
  emphasisRules: readonly PassWoSpeechEmphasis[],
): readonly PassWoSpeechEmphasis[] {
  const first = emphasisRules.find(({ phrase }) => phrase.length > 0);
  if (first === undefined) return noSpeechEmphasis;
  if (first.contrastId === undefined) return [first];

  return emphasisRules.filter(
    ({ phrase, contrastId }) => phrase.length > 0 && contrastId === first.contrastId,
  );
}

function actionLabel(action: PassWoSpeechAction): string {
  switch (action.kind) {
    case 'advance':
      return action.label ?? 'Weiter';
    case 'dismiss':
      return 'Schließen';
    case 'perform':
      return action.label;
  }
}

export function PassWoSpeechBubble({
  speaker,
  paragraphs,
  placement = 'right',
  tone = 'light',
  emphasis = noSpeechEmphasis,
  mutedParagraphIndexes = [],
  footer,
  className,
  action,
  arrowOffset,
}: PassWoSpeechBubbleProps) {
  const fullText = useMemo(() => paragraphs.join('\n\n'), [paragraphs]);
  const paragraphLayout = useMemo(
    () => createParagraphLayout(fullText, visibleEmphasis(emphasis)),
    [emphasis, fullText],
  );
  const headingId = useId();
  const bubbleClassName = className === undefined ? styles.bubble : `${styles.bubble} ${className}`;
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
      <span id={headingId} className={styles.speaker}>
        {speaker}
      </span>
      <div className={styles.textLayout}>
        {paragraphLayout.map(({ segments }, paragraphIndex) => (
            <span
              className={styles.paragraph}
              data-muted={mutedParagraphIndexes.includes(paragraphIndex) || undefined}
              key={paragraphIndex}
            >
              {segments.map((segment, segmentIndex) => {
                if (segment.emphasis === undefined) {
                  return <span key={segmentIndex}>{segment.text}</span>;
                }

                return (
                  <strong
                    className={styles.emphasis}
                    data-emphasis-tone={segment.emphasis.tone}
                    key={segmentIndex}
                  >
                    {!segment.emphasis.showSymbol ? null : (
                      <span className={styles.inlineSymbol} aria-hidden="true">
                        {segment.emphasis.symbolSrc === undefined ? (
                          segment.emphasis.symbolId === undefined ? null : (
                            <NetworkSymbol symbolId={segment.emphasis.symbolId} />
                          )
                        ) : (
                          <img
                            src={segment.emphasis.symbolSrc}
                            width={768}
                            height={768}
                            alt=""
                          />
                        )}
                      </span>
                    )}
                    {segment.text}
                  </strong>
                );
              })}
            </span>
          ))}
      </div>
      {footer === undefined ? null : <div className={styles.footer}>{footer}</div>}
      {action === undefined ? null : (
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.primaryAction}
            disabled={action.disabled}
            onClick={action.onAction}
          >
            {actionLabel(action)}
          </button>
        </div>
      )}
    </section>
  );
}
