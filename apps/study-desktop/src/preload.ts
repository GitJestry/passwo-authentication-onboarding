import { contextBridge, ipcRenderer } from 'electron';

const openReferenceSupplementChannel = 'passwo:desktop:open-reference-supplement';
const closeReferenceSupplementChannel = 'passwo:desktop:close-reference-supplement';

contextBridge.exposeInMainWorld('passwoDesktop', {
  openReferenceSupplement: (linkId: string): Promise<boolean> =>
    ipcRenderer.invoke(openReferenceSupplementChannel, linkId),
  closeReferenceSupplement: (): Promise<void> =>
    ipcRenderer.invoke(closeReferenceSupplementChannel),
});
