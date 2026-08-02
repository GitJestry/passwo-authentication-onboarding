import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

export type PassWoSpeechSide = 'right' | 'left' | 'above' | 'below';

export interface PassWoSpeechBounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface PassWoSpeechSize {
  readonly width: number;
  readonly height: number;
}

export interface PassWoSpeechPosition {
  readonly left: number;
  readonly top: number;
  readonly side: PassWoSpeechSide;
  readonly arrowOffset: number;
}

interface PositionCandidate {
  readonly left: number;
  readonly top: number;
  readonly side: PassWoSpeechSide;
}

export interface PassWoSpeechPositionOptions {
  readonly anchor: PassWoSpeechBounds;
  readonly bubble: PassWoSpeechSize;
  readonly boundary: PassWoSpeechBounds;
  readonly obstacles?: readonly PassWoSpeechBounds[];
  readonly preferredSides?: readonly PassWoSpeechSide[];
  readonly gap?: number;
  readonly margin?: number;
}

export interface UsePassWoSpeechPositionOptions {
  readonly ownerRef: RefObject<HTMLElement | null>;
  readonly characterRef: RefObject<HTMLElement | null>;
  readonly speechRef: RefObject<HTMLElement | null>;
  readonly enabled: boolean;
  readonly positionKey: string;
  readonly preferredSides?: readonly PassWoSpeechSide[];
  readonly obstacleSelector?: string;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function rounded(value: number): number {
  return Math.round(value);
}

function overlapArea(
  left: number,
  top: number,
  width: number,
  height: number,
  obstacle: PassWoSpeechBounds,
): number {
  return (
    Math.max(0, Math.min(left + width, obstacle.right) - Math.max(left, obstacle.left)) *
    Math.max(0, Math.min(top + height, obstacle.bottom) - Math.max(top, obstacle.top))
  );
}

function rectangleFromDomRect(rect: DOMRect): PassWoSpeechBounds {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function samePosition(
  current: PassWoSpeechPosition | null,
  next: PassWoSpeechPosition | null,
): boolean {
  if (current === null || next === null) return current === next;
  return (
    current.left === next.left &&
    current.top === next.top &&
    current.side === next.side &&
    current.arrowOffset === next.arrowOffset
  );
}

/**
 * Keeps the speech bubble inside its visual boundary while favoring a side that leaves both
 * PassWo and authored scene elements unobscured. Coordinates use the boundary's coordinate space.
 */
export function calculatePassWoSpeechPosition({
  anchor,
  bubble,
  boundary,
  obstacles = [],
  preferredSides = ['right', 'left', 'above', 'below'],
  gap = 8,
  margin = 12,
}: PassWoSpeechPositionOptions): PassWoSpeechPosition {
  const centerX = (anchor.left + anchor.right) / 2;
  const centerY = (anchor.top + anchor.bottom) / 2;
  const minimumLeft = boundary.left + margin;
  const maximumLeft = Math.max(minimumLeft, boundary.right - bubble.width - margin);
  const minimumTop = boundary.top + margin;
  const maximumTop = Math.max(minimumTop, boundary.bottom - bubble.height - margin);
  const place = (
    side: PassWoSpeechSide,
    proposedLeft: number,
    proposedTop: number,
  ): PositionCandidate => ({
    side,
    left: rounded(clamp(proposedLeft, minimumLeft, maximumLeft)),
    top: rounded(clamp(proposedTop, minimumTop, maximumTop)),
  });
  const candidatesBySide: Readonly<Record<PassWoSpeechSide, PositionCandidate>> = {
    right: place('right', anchor.right + gap, centerY - bubble.height / 2),
    left: place('left', anchor.left - bubble.width - gap, centerY - bubble.height / 2),
    above: place('above', centerX - bubble.width / 2, anchor.top - bubble.height - gap),
    below: place('below', centerX - bubble.width / 2, anchor.bottom + gap),
  };
  const candidates = preferredSides.map((side) => candidatesBySide[side]);
  const score = (candidate: PositionCandidate, preference: number): number =>
    overlapArea(candidate.left, candidate.top, bubble.width, bubble.height, anchor) * 10_000 +
    obstacles.reduce(
      (total, obstacle) =>
        total + overlapArea(candidate.left, candidate.top, bubble.width, bubble.height, obstacle),
      0,
    ) *
      100 +
    preference;
  const selected = candidates.reduce<{ readonly candidate: PositionCandidate; readonly score: number }>(
    (best, candidate, preference) => {
      const candidateScore = score(candidate, preference);
      return candidateScore < best.score ? { candidate, score: candidateScore } : best;
    },
    { candidate: candidates[0] ?? candidatesBySide.right, score: Number.POSITIVE_INFINITY },
  ).candidate;
  const edgeLength = selected.side === 'left' || selected.side === 'right' ? bubble.height : bubble.width;
  const targetOffset =
    selected.side === 'left' || selected.side === 'right'
      ? centerY - selected.top
      : centerX - selected.left;
  const cornerInset = Math.min(42, Math.max(26, edgeLength / 5));

  return {
    ...selected,
    arrowOffset: rounded(clamp(targetOffset, cornerInset, Math.max(cornerInset, edgeLength - cornerInset))),
  };
}

/**
 * Measures the rendered character and bubble so the tail follows PassWo after layout, pose,
 * page, and viewport changes. The bubble remains an absolutely positioned child of the owner.
 */
export function usePassWoSpeechPosition({
  ownerRef,
  characterRef,
  speechRef,
  enabled,
  positionKey,
  preferredSides,
  obstacleSelector,
}: UsePassWoSpeechPositionOptions): PassWoSpeechPosition | null {
  const [position, setPosition] = useState<PassWoSpeechPosition | null>(null);

  useLayoutEffect(() => {
    if (!enabled) {
      setPosition(null);
      return;
    }

    const owner = ownerRef.current;
    const character = characterRef.current;
    const speech = speechRef.current;
    if (owner === null || character === null || speech === null) return;

    setPosition(null);

    const boundary =
      owner.closest<HTMLElement>('[data-browser-layer="passwo"]') ?? owner.parentElement;
    if (boundary === null) return;
    const obstacleRoot = boundary.closest<HTMLElement>('[data-platform]') ?? boundary;

    let frame: number | null = null;
    let trackingMotion = false;

    const update = () => {
      const ownerRect = owner.getBoundingClientRect();
      const characterRect = character.getBoundingClientRect();
      const speechRect = speech.getBoundingClientRect();
      const boundaryRect = boundary.getBoundingClientRect();
      if (speechRect.width === 0 || speechRect.height === 0) return;
      const obstacles =
        obstacleSelector === undefined
          ? []
          : [...obstacleRoot.querySelectorAll<HTMLElement>(obstacleSelector)]
              .filter((element) => element !== owner && !owner.contains(element))
              .map((element) => rectangleFromDomRect(element.getBoundingClientRect()));
      const next = calculatePassWoSpeechPosition({
        anchor: rectangleFromDomRect(characterRect),
        bubble: { width: speechRect.width, height: speechRect.height },
        boundary: rectangleFromDomRect(boundaryRect),
        obstacles,
        ...(preferredSides === undefined ? {} : { preferredSides }),
      });
      const relativePosition = {
        ...next,
        left: next.left - ownerRect.left,
        top: next.top - ownerRect.top,
      };
      setPosition((current) => (samePosition(current, relativePosition) ? current : relativePosition));
    };

    const scheduleUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        update();
        if (trackingMotion) scheduleUpdate();
      });
    };
    const startTrackingMotion = () => {
      trackingMotion = true;
      scheduleUpdate();
    };
    const stopTrackingMotion = () => {
      trackingMotion = false;
      scheduleUpdate();
    };

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(boundary);
    observer.observe(owner);
    observer.observe(character);
    observer.observe(speech);
    const layoutObserver = new MutationObserver(scheduleUpdate);
    layoutObserver.observe(obstacleRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);
    owner.addEventListener('transitionrun', startTrackingMotion);
    owner.addEventListener('transitionend', stopTrackingMotion);
    owner.addEventListener('transitioncancel', stopTrackingMotion);
    character.addEventListener('animationstart', startTrackingMotion);
    character.addEventListener('animationend', stopTrackingMotion);
    character.addEventListener('animationcancel', stopTrackingMotion);
    scheduleUpdate();

    return () => {
      observer.disconnect();
      layoutObserver.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
      owner.removeEventListener('transitionrun', startTrackingMotion);
      owner.removeEventListener('transitionend', stopTrackingMotion);
      owner.removeEventListener('transitioncancel', stopTrackingMotion);
      character.removeEventListener('animationstart', startTrackingMotion);
      character.removeEventListener('animationend', stopTrackingMotion);
      character.removeEventListener('animationcancel', stopTrackingMotion);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [
    characterRef,
    enabled,
    obstacleSelector,
    ownerRef,
    positionKey,
    preferredSides,
    speechRef,
  ]);

  return position;
}

export function passWoSpeechPositionStyle(
  position: PassWoSpeechPosition | null,
): CSSProperties | undefined {
  if (position === null) return undefined;
  return {
    left: position.left,
    top: position.top,
    '--speech-arrow-offset': `${position.arrowOffset}px`,
  } as CSSProperties;
}
