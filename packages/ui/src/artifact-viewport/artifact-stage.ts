export const ARTIFACT_STAGE_SELECTOR = '[data-artifact-stage]';

export function artifactStageFor(element: Element): HTMLElement | null {
  return element.closest<HTMLElement>(ARTIFACT_STAGE_SELECTOR);
}

export function artifactStageRenderedBounds(element: Element): DOMRect {
  const documentElement = element.ownerDocument.documentElement;
  return (
    artifactStageFor(element)?.getBoundingClientRect() ??
    new DOMRect(0, 0, documentElement.clientWidth, documentElement.clientHeight)
  );
}
