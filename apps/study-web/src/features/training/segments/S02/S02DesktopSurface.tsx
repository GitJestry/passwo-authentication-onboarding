import { DesktopSurface } from '@passwo/ui';
import type { ReactNode, Ref } from 'react';

interface BrowserDockProps {
  readonly active: boolean;
  readonly enabled: boolean;
  readonly label: string;
  readonly onClick?: () => void;
}

export interface S02DesktopSurfaceProps {
  readonly browserDock: BrowserDockProps;
  readonly browserLaunching?: boolean;
  readonly children?: ReactNode;
  readonly sceneRef?: Ref<HTMLDivElement>;
  readonly onBrowserLaunchAnimationEnd?: () => void;
}

export function S02DesktopSurface({
  browserDock,
  browserLaunching = false,
  children,
  sceneRef,
  onBrowserLaunchAnimationEnd,
}: S02DesktopSurfaceProps) {
  return (
    <DesktopSurface
      {...(sceneRef === undefined ? {} : { sceneRef })}
      browserDock={browserDock}
      browserLaunching={browserLaunching}
      {...(onBrowserLaunchAnimationEnd === undefined
        ? {}
        : { onBrowserLaunchAnimationEnd })}
    >
      {children}
    </DesktopSurface>
  );
}
