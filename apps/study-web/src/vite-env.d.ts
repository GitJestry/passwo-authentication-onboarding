/// <reference types="vite/client" />

interface PasswoDesktopBridge {
  openReferenceSupplement(linkId: string): Promise<boolean>;
  closeReferenceSupplement(): Promise<void>;
  getQaPasswordOverrides(): Promise<Record<string, string> | null>;
}

interface Window {
  readonly passwoDesktop?: PasswoDesktopBridge;
}
