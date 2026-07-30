import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
} from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import './pdf-viewer.css';

type PdfViewerMessage =
  | { readonly status: 'document'; readonly bytes: Uint8Array }
  | { readonly status: 'error' };

interface PdfViewerBridge {
  onMessage(listener: (message: PdfViewerMessage) => void): () => void;
}

declare global {
  interface Window {
    readonly passwoPdfViewer?: PdfViewerBridge;
  }
}

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function requiredElement(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (element === null) throw new Error('PDF viewer shell is incomplete.');
  return element;
}

const pagesElement = requiredElement('[data-pdf-pages]');
const statusElement = requiredElement('[data-pdf-status-message]');

let activeDocument: PDFDocumentProxy | null = null;
let loadingTask: PDFDocumentLoadingTask | null = null;
let renderGeneration = 0;
let resizeFrame: number | null = null;
let observedWidth = 0;

function showStatus(status: 'error' | 'loading', message: string): void {
  document.documentElement.dataset.pdfStatus = status;
  statusElement.hidden = false;
  statusElement.textContent = message;
  if (status === 'error') pagesElement.replaceChildren();
}

function accessiblePageText(items: readonly unknown[]): string {
  return items
    .flatMap((item) => {
      if (typeof item !== 'object' || item === null || !('str' in item)) return [];
      return typeof item.str === 'string' ? [item.str] : [];
    })
    .join(' ');
}

async function renderDocument(documentProxy: PDFDocumentProxy): Promise<void> {
  const generation = ++renderGeneration;
  const availableWidth = Math.max(280, pagesElement.clientWidth);
  const fragment = document.createDocumentFragment();

  for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
    const page = await documentProxy.getPage(pageNumber);
    if (generation !== renderGeneration) return;

    const unscaledViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1.75, Math.max(0.25, availableWidth / unscaledViewport.width));
    const viewport = page.getViewport({ scale });
    const outputScale = Math.max(1, window.devicePixelRatio);
    const canvas = document.createElement('canvas');
    canvas.className = 'pageCanvas';
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    canvas.setAttribute('aria-hidden', 'true');

    await page.render({
      canvas,
      viewport,
      transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
    }).promise;
    const textContent = await page.getTextContent();
    if (generation !== renderGeneration) return;

    const pageElement = document.createElement('section');
    pageElement.className = 'page';
    pageElement.setAttribute(
      'aria-label',
      `Seite ${String(pageNumber)} von ${String(documentProxy.numPages)}`,
    );

    const pageTitle = document.createElement('p');
    pageTitle.className = 'pageTitle';
    pageTitle.textContent = `Seite ${String(pageNumber)} von ${String(documentProxy.numPages)}`;
    pageTitle.setAttribute('aria-hidden', 'true');

    const screenReaderText = document.createElement('p');
    screenReaderText.className = 'screenReaderText';
    screenReaderText.textContent = accessiblePageText(textContent.items);

    pageElement.append(pageTitle, canvas, screenReaderText);
    fragment.append(pageElement);
  }

  if (generation !== renderGeneration) return;
  pagesElement.replaceChildren(fragment);
  statusElement.hidden = true;
  document.documentElement.dataset.pdfStatus = 'ready';
  document.documentElement.dataset.pdfPageCount = String(documentProxy.numPages);
}

async function openDocument(bytes: Uint8Array): Promise<void> {
  renderGeneration += 1;
  pagesElement.replaceChildren();
  showStatus('loading', 'Dokument wird geladen …');
  await loadingTask?.destroy();
  loadingTask = null;
  activeDocument = null;

  loadingTask = getDocument({ data: bytes });
  try {
    activeDocument = await loadingTask.promise;
    await renderDocument(activeDocument);
  } catch {
    const failedLoadingTask = loadingTask;
    loadingTask = null;
    activeDocument = null;
    await failedLoadingTask?.destroy().catch(() => undefined);
    showStatus('error', 'Das Dokument konnte nicht dargestellt werden.');
  }
}

const removeMessageListener = window.passwoPdfViewer?.onMessage((message) => {
  if (message.status === 'error') {
    showStatus('error', 'Das Dokument konnte nicht geladen werden.');
    return;
  }
  void openDocument(message.bytes);
});

if (removeMessageListener === undefined) {
  showStatus('error', 'Das Dokument konnte nicht geladen werden.');
}

const resizeObserver = new ResizeObserver(() => {
  const currentWidth = pagesElement.clientWidth;
  if (
    activeDocument === null ||
    resizeFrame !== null ||
    Math.abs(currentWidth - observedWidth) < 1
  ) {
    return;
  }
  observedWidth = currentWidth;
  resizeFrame = window.requestAnimationFrame(() => {
    resizeFrame = null;
    if (activeDocument !== null) {
      void renderDocument(activeDocument).catch(() => {
        showStatus('error', 'Das Dokument konnte nicht dargestellt werden.');
      });
    }
  });
});
resizeObserver.observe(pagesElement);

window.addEventListener('beforeunload', () => {
  removeMessageListener?.();
  resizeObserver.disconnect();
  if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
  void loadingTask?.destroy();
});
