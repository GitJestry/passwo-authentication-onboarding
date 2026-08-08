import { get as getHttp } from 'node:http';
import { get as getHttps } from 'node:https';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assignmentModeSchema,
  designLabPathForTrainingQaSegment,
  referenceSupplementLinkForId,
  referenceSupplementLinkIdSchema,
  type TrainingQaAccountId,
  type TrainingQaPasswordOverrides,
  trainingQaSegmentSchema,
  type TrainingQaSegment,
} from '@passwo/contracts';
import {
  resolveRecontactDatabasePath,
  resolveStudyDatabasePath,
  type StudyRuntime,
  startStudyRuntime,
} from '@passwo/study-server/runtime';
import {
  app,
  BrowserWindow,
  dialog,
  type IpcMainInvokeEvent,
  ipcMain,
  Menu,
  WebContentsView,
} from 'electron';

const applicationVersion = '0.1.2';
const viewerToolbarHeight = 56;
const maximumPdfBytes = 10 * 1024 * 1024;
const pdfFetchTimeoutMilliseconds = 15_000;
const openReferenceSupplementChannel = 'passwo:desktop:open-reference-supplement';
const closeReferenceSupplementChannel = 'passwo:desktop:close-reference-supplement';
const getQaPasswordOverridesChannel = 'passwo:desktop:get-qa-password-overrides';
const pdfViewerMessageChannel = 'passwo:desktop:pdf-viewer-message';
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const packagedViewerErrorUrl = `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'unsafe-inline'"
    >
    <style>
      html, body { height: 100%; margin: 0; }
      body {
        display: grid;
        place-items: center;
        padding: 2rem;
        box-sizing: border-box;
        color: #18282d;
        background: #f4f8f9;
        font: 600 1rem/1.5 -apple-system, BlinkMacSystemFont, sans-serif;
        text-align: center;
      }
    </style>
    <title>Zusatzinformationen nicht verfügbar</title>
  </head>
  <body>Die Zusatzinformation konnte nicht geladen werden.</body>
</html>`)}`;

let mainWindow: BrowserWindow | null = null;
let studyRuntime: StudyRuntime | null = null;
let supplementView: WebContentsView | null = null;
let supplementPdfAbortController: AbortController | null = null;
let shuttingDown = false;
let qaPasswordOverrides: TrainingQaPasswordOverrides | null = null;

function qaTrainingSegmentFromEnvironment(): TrainingQaSegment | null {
  const configuredSegment = process.env.PASSWO_QA_SEGMENT;
  if (configuredSegment === undefined) return null;
  if (app.isPackaged) {
    throw new Error('PASSWO_QA_SEGMENT ist nur beim Entwicklungsstart verfügbar.');
  }

  const parsedSegment = trainingQaSegmentSchema.safeParse(configuredSegment);
  if (parsedSegment.success) return parsedSegment.data;
  throw new Error('Ungültiger PASSWO_QA_SEGMENT-Wert. Erlaubt sind: s00, s01, s02, s03, s05.');
}

function qaPasswordOverridesFromEnvironment(
  qaTrainingSegment: TrainingQaSegment | null,
): TrainingQaPasswordOverrides | null {
  const configuredPasswords: ReadonlyArray<readonly [TrainingQaAccountId, string | undefined]> = [
    ['master-campus', process.env.PASSWO_QA_PASSWORD_MASTER],
    ['campus-email', process.env.PASSWO_QA_PASSWORD_EMAIL],
    ['campusgram', process.env.PASSWO_QA_PASSWORD_CAMPUSGRAM],
  ];
  const hasPasswordConfiguration = configuredPasswords.some(([, value]) => value !== undefined);
  if (!hasPasswordConfiguration) return qaTrainingSegment === null ? null : {};
  if (app.isPackaged) {
    throw new Error('PASSWO_QA_PASSWORD_* ist nur beim Entwicklungsstart verfügbar.');
  }
  if (qaTrainingSegment === null) {
    throw new Error('PASSWO_QA_PASSWORD_* benötigt PASSWO_QA_SEGMENT.');
  }

  const overrides: TrainingQaPasswordOverrides = {};
  for (const [accountId, value] of configuredPasswords) {
    if (value !== undefined && value.length > 0) overrides[accountId] = value;
  }
  return overrides;
}

function runtimeResourcePath(developmentPath: string, packagedName: string): string {
  return app.isPackaged
    ? join(process.resourcesPath, packagedName)
    : resolve(currentDirectory, developmentPath);
}

function isAllowedWebUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function originFromUrl(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function requireTrustedRenderer(event: IpcMainInvokeEvent): void {
  const senderFrameUrl = event.senderFrame?.url;
  const senderOrigin = senderFrameUrl === undefined ? null : originFromUrl(senderFrameUrl);
  if (
    mainWindow === null ||
    studyRuntime === null ||
    event.sender !== mainWindow.webContents ||
    senderOrigin !== studyRuntime.origin
  ) {
    throw new Error('untrusted-desktop-ipc-sender');
  }
}

function updateSupplementBounds(): void {
  if (mainWindow === null || supplementView === null) return;
  const contentSize = mainWindow.getContentSize();
  const width = contentSize[0] ?? 0;
  const height = contentSize[1] ?? 0;
  supplementView.setBounds({
    x: 0,
    y: viewerToolbarHeight,
    width,
    height: Math.max(0, height - viewerToolbarHeight),
  });
}

function closeReferenceSupplement(): void {
  supplementPdfAbortController?.abort();
  supplementPdfAbortController = null;
  if (mainWindow === null || supplementView === null) return;
  const view = supplementView;
  supplementView = null;
  mainWindow.contentView.removeChildView(view);
  view.webContents.close({ waitForBeforeUnload: false });
  mainWindow.webContents.focus();
}

function configureSupplementView(view: WebContentsView): void {
  const { webContents } = view;
  const externalSession = webContents.session;

  externalSession.setPermissionCheckHandler(() => false);
  externalSession.setPermissionRequestHandler((_contents, _permission, callback) =>
    callback(false),
  );
  externalSession.webRequest.onBeforeRequest(
    { urls: ['http://*/*', 'https://*/*'] },
    (details, callback) => {
      callback({ cancel: (details.uploadData?.length ?? 0) > 0 });
    },
  );
  externalSession.on('will-download', (event) => event.preventDefault());

  const guardNavigation = (event: Electron.Event, navigationUrl: string) => {
    if (!isAllowedWebUrl(navigationUrl)) event.preventDefault();
  };
  webContents.on('will-navigate', guardNavigation);
  webContents.on('will-redirect', guardNavigation);
  webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedWebUrl(url)) {
      void webContents.loadURL(url);
    }
    return { action: 'deny' };
  });
  webContents.on(
    'did-fail-load',
    (_event, errorCode, _errorDescription, validatedUrl, isMainFrame) => {
      if (!isMainFrame || errorCode === -3 || validatedUrl.startsWith('data:')) return;
      void webContents.loadURL(packagedViewerErrorUrl);
    },
  );
}

function configurePdfSupplementView(view: WebContentsView, viewerUrl: string): void {
  const { webContents } = view;
  const pdfSession = webContents.session;

  pdfSession.setPermissionCheckHandler(() => false);
  pdfSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  pdfSession.on('will-download', (event) => event.preventDefault());

  const guardNavigation = (event: Electron.Event, navigationUrl: string) => {
    if (navigationUrl !== viewerUrl && navigationUrl !== packagedViewerErrorUrl) {
      event.preventDefault();
    }
  };
  webContents.on('will-navigate', guardNavigation);
  webContents.on('will-redirect', guardNavigation);
  webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  webContents.on(
    'did-fail-load',
    (_event, errorCode, _errorDescription, validatedUrl, isMainFrame) => {
      if (!isMainFrame || errorCode === -3 || validatedUrl.startsWith('data:')) return;
      void webContents.loadURL(packagedViewerErrorUrl);
    },
  );
}

function isPdfDocument(bytes: Uint8Array): boolean {
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d];
  return signature.every((value, index) => bytes[index] === value);
}

function readBoundedPdf(url: string, signal: AbortSignal, redirectCount = 0): Promise<Uint8Array> {
  return new Promise((resolvePdf, rejectPdf) => {
    const parsedUrl = new URL(url);
    const request = (parsedUrl.protocol === 'https:' ? getHttps : getHttp)(
      parsedUrl,
      {
        headers: { Accept: 'application/pdf' },
        signal,
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const redirectLocation = response.headers.location;
        if (statusCode >= 300 && statusCode < 400 && redirectLocation !== undefined) {
          response.resume();
          if (redirectCount >= 5) {
            rejectPdf(new Error('reference-pdf-too-many-redirects'));
            return;
          }
          const redirectUrl = new URL(redirectLocation, parsedUrl).href;
          if (!isAllowedWebUrl(redirectUrl)) {
            rejectPdf(new Error('invalid-reference-pdf-redirect'));
            return;
          }
          void readBoundedPdf(redirectUrl, signal, redirectCount + 1).then(resolvePdf, rejectPdf);
          return;
        }

        const rawContentType = response.headers['content-type'];
        const contentType = (
          Array.isArray(rawContentType) ? (rawContentType[0] ?? '') : (rawContentType ?? '')
        ).toLowerCase();
        const rawContentLength = response.headers['content-length'];
        const contentLengthValue = Array.isArray(rawContentLength)
          ? rawContentLength[0]
          : rawContentLength;
        const contentLength =
          contentLengthValue === undefined ? null : Number.parseInt(contentLengthValue, 10);
        if (
          statusCode < 200 ||
          statusCode >= 300 ||
          !contentType.startsWith('application/pdf') ||
          (contentLength !== null &&
            (!Number.isFinite(contentLength) ||
              contentLength < 0 ||
              contentLength > maximumPdfBytes))
        ) {
          response.resume();
          rejectPdf(new Error('invalid-reference-pdf-response'));
          return;
        }

        const chunks: Uint8Array[] = [];
        let byteLength = 0;
        let failed = false;
        response.on('data', (chunk: Buffer) => {
          if (failed) return;
          byteLength += chunk.byteLength;
          if (byteLength > maximumPdfBytes) {
            failed = true;
            response.destroy();
            rejectPdf(new Error('reference-pdf-too-large'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('error', (error) => {
          if (!failed) rejectPdf(error);
        });
        response.on('end', () => {
          if (failed) return;
          const bytes = new Uint8Array(byteLength);
          let offset = 0;
          for (const chunk of chunks) {
            bytes.set(chunk, offset);
            offset += chunk.byteLength;
          }
          if (!isPdfDocument(bytes)) {
            rejectPdf(new Error('invalid-reference-pdf-signature'));
            return;
          }
          resolvePdf(bytes);
        });
      },
    );
    request.on('error', rejectPdf);
  });
}

async function loadReferencePdf(view: WebContentsView, url: string): Promise<void> {
  if (studyRuntime === null) return;
  const viewerUrl = new URL('/pdf-viewer.html', studyRuntime.origin).href;
  const abortController = new AbortController();
  supplementPdfAbortController = abortController;
  const signal = AbortSignal.any([
    abortController.signal,
    AbortSignal.timeout(pdfFetchTimeoutMilliseconds),
  ]);

  try {
    const [, bytes] = await Promise.all([
      view.webContents.loadURL(viewerUrl),
      readBoundedPdf(url, signal),
    ]);
    if (supplementView !== view || view.webContents.isDestroyed()) return;
    view.webContents.send(pdfViewerMessageChannel, { status: 'document', bytes });
  } catch {
    if (supplementView !== view || view.webContents.isDestroyed()) return;
    view.webContents.send(pdfViewerMessageChannel, { status: 'error' });
  } finally {
    if (supplementPdfAbortController === abortController) {
      supplementPdfAbortController = null;
    }
  }
}

async function openReferenceSupplement(
  event: IpcMainInvokeEvent,
  candidateLinkId: unknown,
): Promise<boolean> {
  requireTrustedRenderer(event);
  if (mainWindow === null || supplementView !== null) return false;

  const parsedLinkId = referenceSupplementLinkIdSchema.safeParse(candidateLinkId);
  if (!parsedLinkId.success) return false;
  const link = referenceSupplementLinkForId(parsedLinkId.data);
  const viewerUrl =
    link.kind === 'pdf' && studyRuntime !== null
      ? new URL('/pdf-viewer.html', studyRuntime.origin).href
      : null;

  const view = new WebContentsView({
    webPreferences: {
      allowRunningInsecureContent: false,
      contextIsolation: true,
      devTools: false,
      nodeIntegration: false,
      partition: 'passwo-reference-supplements',
      ...(link.kind === 'pdf' ? { preload: join(currentDirectory, 'pdf-preload.cjs') } : {}),
      sandbox: true,
      webSecurity: true,
    },
  });
  if (viewerUrl === null) {
    configureSupplementView(view);
  } else {
    configurePdfSupplementView(view, viewerUrl);
  }
  supplementView = view;
  mainWindow.contentView.addChildView(view);
  updateSupplementBounds();
  if (link.kind === 'pdf') {
    void loadReferencePdf(view, link.url);
  } else {
    void view.webContents.loadURL(link.url);
  }
  return true;
}

async function shutdown(): Promise<void> {
  closeReferenceSupplement();
  const runtime = studyRuntime;
  studyRuntime = null;
  await runtime?.close();
}

async function startApplication(): Promise<void> {
  const assignmentMode = assignmentModeSchema.parse(
    process.env.STUDY_ASSIGNMENT_MODE ?? 'permuted-block',
  );
  const qaTrainingSegment = qaTrainingSegmentFromEnvironment();
  qaPasswordOverrides = qaPasswordOverridesFromEnvironment(qaTrainingSegment);
  studyRuntime = await startStudyRuntime({
    version: applicationVersion,
    assignmentMode,
    databasePath: resolveStudyDatabasePath(),
    recontactDatabasePath: resolveRecontactDatabasePath(),
    referenceArtifactDirectory: runtimeResourcePath(
      '../../../research/private/reference/secaware/passwords-authentication/2026-07-26/study-build',
      'study-build',
    ),
    webBuildDirectory: runtimeResourcePath('../../study-web/dist', 'dist'),
    host: '127.0.0.1',
    port: 0,
  });

  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    title: 'Authentication Onboarding',
    webPreferences: {
      contextIsolation: true,
      devTools: !app.isPackaged,
      nodeIntegration: false,
      preload: join(currentDirectory, 'preload.cjs'),
      sandbox: true,
      webSecurity: true,
    },
  });
  mainWindow = window;
  Menu.setApplicationMenu(null);

  window.webContents.session.setPermissionCheckHandler(() => false);
  window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) =>
    callback(false),
  );
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, navigationUrl) => {
    if (studyRuntime === null || originFromUrl(navigationUrl) !== studyRuntime.origin) {
      event.preventDefault();
    }
  });
  window.on('resize', updateSupplementBounds);
  window.once('ready-to-show', () => window.show());
  window.on('closed', () => {
    closeReferenceSupplement();
    mainWindow = null;
    app.quit();
  });

  const initialUrl =
    qaTrainingSegment === null
      ? studyRuntime.origin
      : new URL(
          designLabPathForTrainingQaSegment(qaTrainingSegment),
          studyRuntime.origin,
        ).toString();
  await window.loadURL(initialUrl);
}

app.setName('Authentication Onboarding');
app.enableSandbox();

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
  ipcMain.handle(openReferenceSupplementChannel, openReferenceSupplement);
  ipcMain.handle(closeReferenceSupplementChannel, (event) => {
    requireTrustedRenderer(event);
    closeReferenceSupplement();
  });
  ipcMain.handle(getQaPasswordOverridesChannel, (event) => {
    requireTrustedRenderer(event);
    return qaPasswordOverrides;
  });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', (event) => {
    if (shuttingDown || studyRuntime === null) return;
    event.preventDefault();
    shuttingDown = true;
    void shutdown().finally(() => app.quit());
  });
  void app
    .whenReady()
    .then(startApplication)
    .catch(async (error: unknown) => {
      await shutdown();
      const developmentHint =
        error instanceof Error &&
        (error.message.startsWith('PASSWO_QA_SEGMENT') ||
          error.message.startsWith('PASSWO_QA_PASSWORD') ||
          error.message.startsWith('Ungültiger PASSWO_QA_SEGMENT'))
          ? `\n\n${error.message}`
          : '';
      dialog.showErrorBox(
        'Authentication Onboarding',
        `Die lokale Anwendung konnte nicht gestartet werden.${developmentHint}`,
      );
      app.quit();
    });
}
