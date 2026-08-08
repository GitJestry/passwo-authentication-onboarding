import {
  isPermittedFictionalPassword,
  MAX_FICTIONAL_PASSWORD_LENGTH,
} from '@passwo/training-engine';
import { useCallback, useState, type ChangeEvent, type ClipboardEvent, type FormEvent } from 'react';

interface PasswordLimitFeedback {
  readonly key: string;
  readonly attempt: number;
}

const PASSWORD_INPUT_VISIBLE_CHARACTER_COUNT = 48;

function valueWithInsertion(input: HTMLInputElement, insertedText: string): string {
  const selectionStart = input.selectionStart ?? input.value.length;
  const selectionEnd = input.selectionEnd ?? selectionStart;
  return `${input.value.slice(0, selectionStart)}${insertedText}${input.value.slice(selectionEnd)}`;
}

function isTextInsertionEvent(event: Event): event is InputEvent {
  return event instanceof InputEvent && event.inputType.startsWith('insert');
}

/**
 * Keeps the fictional-password boundary at the field so typing, pasting and browser autofill
 * all receive the same local validation and length feedback.
 */
export function useFictionalPasswordInput({
  value,
  feedbackKey,
  onAccepted,
}: {
  readonly value: string;
  readonly feedbackKey: string;
  readonly onAccepted: (value: string) => void;
}) {
  const [limitFeedback, setLimitFeedback] = useState<PasswordLimitFeedback | null>(null);
  const limitFeedbackAttempt =
    limitFeedback?.key === feedbackKey ? limitFeedback.attempt : undefined;

  const showLimitFeedback = useCallback(() => {
    setLimitFeedback((current) => ({
      key: feedbackKey,
      attempt: current?.key === feedbackKey ? current.attempt + 1 : 0,
    }));
  }, [feedbackKey]);

  const acceptIfPermitted = useCallback(
    (nextValue: string): boolean => {
      if (!isPermittedFictionalPassword(nextValue)) {
        if (nextValue.length > MAX_FICTIONAL_PASSWORD_LENGTH) showLimitFeedback();
        return false;
      }
      setLimitFeedback(null);
      onAccepted(nextValue);
      return true;
    },
    [onAccepted, showLimitFeedback],
  );

  const onBeforeInput = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      const nativeEvent = event.nativeEvent;
      if (!isTextInsertionEvent(nativeEvent)) return;
      const insertedText = nativeEvent.data ?? nativeEvent.dataTransfer?.getData('text/plain');
      if (insertedText === undefined || insertedText === null) return;
      const nextValue = valueWithInsertion(event.currentTarget, insertedText);
      if (isPermittedFictionalPassword(nextValue)) return;

      event.preventDefault();
      if (nextValue.length > MAX_FICTIONAL_PASSWORD_LENGTH) showLimitFeedback();
    },
    [showLimitFeedback],
  );

  const onPaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      const nextValue = valueWithInsertion(
        event.currentTarget,
        event.clipboardData.getData('text/plain'),
      );
      if (isPermittedFictionalPassword(nextValue)) return;

      event.preventDefault();
      if (nextValue.length > MAX_FICTIONAL_PASSWORD_LENGTH) showLimitFeedback();
    },
    [showLimitFeedback],
  );

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      if (!acceptIfPermitted(input.value)) return;
      const selectionStart = input.selectionStart ?? input.value.length;
      const selectionEnd = input.selectionEnd ?? selectionStart;
      const isAppendingAtEnd =
        selectionStart === input.value.length && selectionEnd === selectionStart;

      if (
        input.value.length <= PASSWORD_INPUT_VISIBLE_CHARACTER_COUNT ||
        !isAppendingAtEnd
      ) {
        return;
      }

      requestAnimationFrame(() => {
        if (!input.isConnected) return;
        input.scrollLeft = input.scrollWidth;
      });
    },
    [acceptIfPermitted],
  );

  return {
    value,
    limitFeedbackAttempt,
    tooLong: limitFeedbackAttempt !== undefined,
    onBeforeInput,
    onPaste,
    onChange,
  };
}
