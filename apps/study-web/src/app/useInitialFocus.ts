import { type RefCallback, useCallback } from 'react';

/** Moves focus when a study state replaces the previously visible interaction surface. */
export function useInitialFocus<Element extends HTMLElement>(): RefCallback<Element> {
  return useCallback((element) => {
    element?.focus();
  }, []);
}
