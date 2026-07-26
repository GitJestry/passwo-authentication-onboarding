import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assignmentModeSchema,
  referenceSupplementLinkForId,
  referenceSupplementLinkIdSchema,
} from '@passwo/contracts';
import {
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
const openReferenceSupplementChannel = 'passwo:desktop:open-reference-supplement';
const closeReferenceSupplementChannel = 'passwo:desktop:close-reference-supplement';
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
let shuttingDown = false;

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

async function openReferenceSupplement(
  event: IpcMainInvokeEvent,
  candidateLinkId: unknown,
): Promise<boolean> {
  requireTrustedRenderer(event);
  if (mainWindow === null || supplementView !== null) return false;

  const parsedLinkId = referenceSupplementLinkIdSchema.safeParse(candidateLinkId);
  if (!parsedLinkId.success) return false;
  const link = referenceSupplementLinkForId(parsedLinkId.data);

  const view = new WebContentsView({
    webPreferences: {
      allowRunningInsecureContent: false,
      contextIsolation: true,
      devTools: false,
      nodeIntegration: false,
      partition: 'passwo-reference-supplements',
      sandbox: true,
      webSecurity: true,
    },
  });
  configureSupplementView(view);
  supplementView = view;
  mainWindow.contentView.addChildView(view);
  updateSupplementBounds();
  void view.webContents.loadURL(link.url);
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
  studyRuntime = await startStudyRuntime({
    version: applicationVersion,
    assignmentMode,
    databasePath: resolveStudyDatabasePath(),
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

  await window.loadURL(studyRuntime.origin);
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
    .catch(async () => {
      await shutdown();
      dialog.showErrorBox(
        'Authentication Onboarding',
        'Die lokale Anwendung konnte nicht gestartet werden.',
      );
      app.quit();
    });
}
