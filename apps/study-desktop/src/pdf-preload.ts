import { contextBridge, ipcRenderer } from 'electron';

const pdfViewerMessageChannel = 'passwo:desktop:pdf-viewer-message';

type PdfViewerMessage =
  | { readonly status: 'document'; readonly bytes: Uint8Array }
  | { readonly status: 'error' };

function isPdfViewerMessage(value: unknown): value is PdfViewerMessage {
  if (typeof value !== 'object' || value === null || !('status' in value)) return false;
  if (value.status === 'error') return Object.keys(value).length === 1;
  return (
    value.status === 'document' &&
    'bytes' in value &&
    value.bytes instanceof Uint8Array &&
    Object.keys(value).length === 2
  );
}

contextBridge.exposeInMainWorld('passwoPdfViewer', {
  onMessage: (listener: (message: PdfViewerMessage) => void): (() => void) => {
    const receiveMessage = (_event: Electron.IpcRendererEvent, value: unknown) => {
      if (isPdfViewerMessage(value)) listener(value);
    };
    ipcRenderer.on(pdfViewerMessageChannel, receiveMessage);
    return () => ipcRenderer.removeListener(pdfViewerMessageChannel, receiveMessage);
  },
});
