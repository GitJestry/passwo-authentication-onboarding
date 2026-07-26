/// <reference types="vite/client" />

interface PasswoDesktopBridge {
  openReferenceSupplement(linkId: string): Promise<boolean>;
  closeReferenceSupplement(): Promise<void>;
}

interface Window {
  readonly passwoDesktop?: PasswoDesktopBridge;
}
