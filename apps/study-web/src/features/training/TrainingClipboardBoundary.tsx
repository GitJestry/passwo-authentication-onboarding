import type { ClipboardEvent, KeyboardEvent, ReactNode } from 'react';

function isSensitiveClipboardTarget(target: EventTarget): boolean {
  if (!(target instanceof Element)) return false;
  return (
    target.closest('input, textarea, [contenteditable="true"]') !== null ||
    target.closest('[data-training-clipboard-sensitive]') !== null
  );
}

function selectionContainsSensitiveContent(container: HTMLDivElement): boolean {
  const selection = window.getSelection();
  if (selection === null || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  return [...container.querySelectorAll('[data-training-clipboard-sensitive]')].some((element) =>
    range.intersectsNode(element),
  );
}

export function TrainingClipboardBoundary({
  allowCopy,
  children,
}: {
  readonly allowCopy: boolean;
  readonly children: ReactNode;
}) {
  const preventClipboardWrite = (event: ClipboardEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const handleCopy = (event: ClipboardEvent<HTMLDivElement>): void => {
    if (
      !allowCopy ||
      isSensitiveClipboardTarget(event.target) ||
      selectionContainsSensitiveContent(event.currentTarget)
    ) {
      event.preventDefault();
    }
  };

  const handleClipboardShortcut = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!(event.metaKey || event.ctrlKey)) return;

    const key = event.key.toLowerCase();
    if (
      key === 'v' ||
      key === 'x' ||
      (key === 'c' && (!allowCopy || isSensitiveClipboardTarget(event.target)))
    ) {
      event.preventDefault();
    }
  };

  return (
    <div
      style={{ display: 'contents' }}
      onCopyCapture={handleCopy}
      onCutCapture={preventClipboardWrite}
      onPasteCapture={preventClipboardWrite}
      onKeyDownCapture={handleClipboardShortcut}
    >
      {children}
    </div>
  );
}
