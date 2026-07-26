import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const scenes = [
  'normal',
  'dimmed',
  'passwo-overlay',
  's00',
  's02-campus-id',
  's06-identical',
  's06-similar',
  's06-unique',
  's06-hypothetical',
] as const;
const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
] as const;

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(overflow).toEqual({ body: 0, document: 0 });
}

async function expectShellInsideViewport(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  const shellBox = await page
    .getByRole('region', { name: /Fiktive Browseranwendung/ })
    .boundingBox();

  expect(viewport).not.toBeNull();
  expect(shellBox).not.toBeNull();
  if (viewport === null || shellBox === null) return;

  expect(shellBox.x).toBeGreaterThanOrEqual(0);
  expect(shellBox.y).toBeGreaterThanOrEqual(0);
  expect(shellBox.x + shellBox.width).toBeLessThanOrEqual(viewport.width);
  expect(shellBox.y + shellBox.height).toBeLessThanOrEqual(viewport.height);
}

async function expectControlInsideViewport(page: Page, control: Locator): Promise<void> {
  await expect(control).toBeVisible();
  const viewport = page.viewportSize();
  const controlBox = await control.boundingBox();

  expect(viewport).not.toBeNull();
  expect(controlBox).not.toBeNull();
  if (viewport === null || controlBox === null) return;

  expect(controlBox.x).toBeGreaterThanOrEqual(0);
  expect(controlBox.y).toBeGreaterThanOrEqual(0);
  expect(controlBox.x + controlBox.width).toBeLessThanOrEqual(viewport.width);
  expect(controlBox.y + controlBox.height).toBeLessThanOrEqual(viewport.height);
}

for (const viewport of viewports) {
  test(`all design-lab scenes fit ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);

    for (const scene of scenes) {
      await page.goto(`/design-lab/${scene}`);
      await expect(page.getByRole('heading', { name: 'BrowserShell Design Lab' })).toBeVisible();
      await expectShellInsideViewport(page);
      await expectNoHorizontalScroll(page);
      if (scene === 's00') {
        await expectControlInsideViewport(page, page.getByRole('button', { name: 'Weiter' }));
      }
      if (scene === 's02-campus-id') {
        await expectControlInsideViewport(page, page.getByRole('button', { name: /^CampusID\./ }));
      }
    }
  });
}

test('tabs support roving focus with ArrowLeft, ArrowRight, Home, and End', async ({ page }) => {
  await page.goto('/design-lab/normal');

  const overviewTab = page.getByRole('tab', { name: 'Übersicht' });
  const preparationTab = page.getByRole('tab', { name: 'Vorbereitung' });
  const reflectionTab = page.getByRole('tab', { name: 'Reflexion' });

  await expect(preparationTab).toHaveAttribute('tabindex', '0');
  await expect(overviewTab).toHaveAttribute('tabindex', '-1');
  await expect(reflectionTab).toHaveAttribute('tabindex', '-1');

  await preparationTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(reflectionTab).toBeFocused();
  await expect(reflectionTab).toHaveAttribute('aria-selected', 'false');
  await expect(reflectionTab).toHaveAttribute('tabindex', '0');
  await expect(preparationTab).toHaveAttribute('tabindex', '-1');
  await expect(preparationTab).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('ArrowRight');
  await expect(overviewTab).toBeFocused();
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('ArrowLeft');
  await expect(reflectionTab).toBeFocused();
  await expect(reflectionTab).toHaveAttribute('aria-selected', 'false');

  await page.keyboard.press('ArrowLeft');
  await expect(preparationTab).toBeFocused();
  await expect(preparationTab).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Home');
  await expect(overviewTab).toBeFocused();
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('End');
  await expect(reflectionTab).toBeFocused();
  await expect(reflectionTab).toHaveAttribute('aria-selected', 'false');
  await expect(reflectionTab).toHaveAttribute('tabindex', '0');
  await expect(overviewTab).toHaveAttribute('tabindex', '-1');
  await expect(preparationTab).toHaveAttribute('tabindex', '-1');
});

test('tabs and the active panel expose matching ARIA relationships', async ({ page }) => {
  await page.goto('/design-lab/normal');

  const tabs = page.getByRole('tab');
  const preparationTab = page.getByRole('tab', { name: 'Vorbereitung' });
  const overviewTab = page.getByRole('tab', { name: 'Übersicht' });
  const panel = page.getByRole('tabpanel');
  const panelId = await panel.getAttribute('id');
  const preparationTabId = await preparationTab.getAttribute('id');

  expect(panelId).not.toBeNull();
  expect(preparationTabId).not.toBeNull();
  if (panelId === null || preparationTabId === null) return;

  await expect(tabs).toHaveCount(3);
  for (const tab of await tabs.all()) {
    await expect(tab).toHaveAttribute('aria-controls', panelId);
  }
  await expect(panel).toHaveAttribute('aria-labelledby', preparationTabId);

  await overviewTab.click();
  const overviewTabId = await overviewTab.getAttribute('id');
  expect(overviewTabId).not.toBeNull();
  if (overviewTabId === null) return;

  await expect(panel).toHaveAttribute('aria-labelledby', overviewTabId);
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
});

test('a focused disabled tab keeps its reason accessible and cannot be activated', async ({
  page,
}) => {
  await page.goto('/design-lab/normal');

  const preparationTab = page.getByRole('tab', { name: 'Vorbereitung' });
  const reflectionTab = page.getByRole('tab', { name: 'Reflexion' });

  await expect(reflectionTab).toHaveAttribute('aria-disabled', 'true');
  await expect(reflectionTab).not.toHaveAttribute('disabled', '');
  await expect(reflectionTab).toHaveAccessibleDescription(
    /In diesem Design-Lab-Snapshot nicht freigegeben\./,
  );

  const reasonId = await reflectionTab.getAttribute('aria-describedby');
  expect(reasonId).not.toBeNull();
  if (reasonId === null) return;
  const hiddenReasonPresentation = await page.locator(`[id="${reasonId}"]`).evaluate((element) => {
    const container = element.parentElement;
    if (container === null) return null;
    const box = container.getBoundingClientRect();
    const style = getComputedStyle(container);
    return {
      width: box.width,
      height: box.height,
      overflow: style.overflow,
      clipPath: style.clipPath,
    };
  });
  expect(hiddenReasonPresentation).toEqual({
    width: 1,
    height: 1,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
  });

  await preparationTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(reflectionTab).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(reflectionTab).toHaveAttribute('aria-selected', 'false');
  await expect(preparationTab).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Space');
  await expect(reflectionTab).toHaveAttribute('aria-selected', 'false');
  await expect(preparationTab).toHaveAttribute('aria-selected', 'true');

  await reflectionTab.click({ force: true });
  await expect(reflectionTab).toHaveAttribute('aria-selected', 'false');
  await expect(preparationTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByLabel('Adresszeile')).toHaveText('campus.example/vorbereitung');
  await expect(
    page.getByRole('heading', { name: 'Eine Anmeldung in Ruhe vorbereiten' }),
  ).toBeVisible();
});

test('every selectable tab renders a coherent complete snapshot', async ({ page }) => {
  await page.goto('/design-lab/normal');

  const overviewTab = page.getByRole('tab', { name: 'Übersicht' });
  const completeMarker = overviewTab.getByRole('img', { name: 'Abgeschlossen' });
  const expectedSnapshots = [
    {
      tab: overviewTab,
      address: 'campus.example/uebersicht',
      heading: 'Übungsrahmen im Überblick',
      taskTitle: 'Darstellung und Bedienung',
      overviewComplete: false,
    },
    {
      tab: page.getByRole('tab', { name: 'Vorbereitung' }),
      address: 'campus.example/vorbereitung',
      heading: 'Eine Anmeldung in Ruhe vorbereiten',
      taskTitle: 'Übungsrahmen kennenlernen',
      overviewComplete: true,
    },
  ] as const;

  for (const expected of expectedSnapshots) {
    await expected.tab.click();
    await expect(expected.tab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Adresszeile')).toHaveText(expected.address);
    await expect(page.getByRole('heading', { name: expected.heading })).toBeVisible();
    await expect(page.getByRole('heading', { name: expected.taskTitle })).toBeVisible();
    await expect(completeMarker).toHaveCount(expected.overviewComplete ? 1 : 0);
  }
});

test('overlay layers remain above the dimmed inactive page', async ({ page }) => {
  await page.goto('/design-lab/passwo-overlay');

  const shell = page.getByRole('region', { name: /Szene PassWo-Overlay/ });
  await expect(shell).toHaveAttribute('data-dimmed', 'true');
  await expect(page.getByRole('img', { name: /PassWo-Platzhalter/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ein Schritt nach dem anderen.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Animation wiederholen' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeDisabled();

  const layerOrder = await page.locator('[data-browser-layer]').evaluateAll((layers) =>
    layers.map((layer) => ({
      name: layer.getAttribute('data-browser-layer'),
      zIndex: Number.parseInt(getComputedStyle(layer).zIndex, 10),
    })),
  );
  expect(layerOrder).toEqual([
    { name: 'dimming', zIndex: 10 },
    { name: 'passwo', zIndex: 20 },
    { name: 'speech', zIndex: 30 },
    { name: 'controls', zIndex: 40 },
  ]);

  await page.getByRole('button', { name: 'Animation wiederholen' }).click();
  const replayAnimationName = await page
    .getByRole('img', { name: /PassWo-Platzhalter/ })
    .evaluate((element) => getComputedStyle(element).animationName);
  expect(replayAnimationName).not.toBe('none');
});

test('reduced motion preserves the passwo overlay information state', async ({ page }) => {
  await page.goto('/design-lab/passwo-overlay');
  const shell = page.getByRole('region', { name: /Szene PassWo-Overlay/ });
  const defaultText = await shell.innerText();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  await expect(shell).toContainText('Ein Schritt nach dem anderen.');
  await expect(shell).toContainText('Animation wiederholen');
  expect(await shell.innerText()).toBe(defaultText);
  await expect(page.getByRole('img', { name: /PassWo-Platzhalter/ })).toHaveCSS(
    'animation-name',
    'none',
  );
  await page.getByRole('button', { name: 'Animation wiederholen' }).click();
  await expect(page.getByRole('img', { name: /PassWo-Platzhalter/ })).toHaveCSS(
    'animation-name',
    'none',
  );
});

test('S00 shows the safety boundary after the PassWo sequence and requires its acknowledgement', async ({
  page,
}) => {
  await page.goto('/design-lab/s00');

  await expect(page.getByRole('heading', { name: 'Willkommen im Training' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hinweis für die Übung' })).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);

  const acknowledgement = page.getByLabel('Ich verwende nur ausgedachte Passwörter.');
  const continueButton = page.getByRole('button', { name: 'Weiter' });
  await expect(acknowledgement).toBeEnabled();
  await expect(continueButton).toBeDisabled();
  await acknowledgement.check();
  await expect(continueButton).toBeEnabled();
  await expect(page.getByRole('button', { name: 'PassWo-Hilfe schließen' })).toBeEnabled();
});

test('S00 keeps the PassWo guide visibility and expanded state synchronized', async ({ page }) => {
  await page.goto('/design-lab/s00');

  const greeting = page.getByRole('heading', { name: 'Willkommen im Training' });
  await expect(greeting).toBeVisible();

  const closeGuide = page.getByRole('button', { name: 'PassWo-Hilfe schließen' });
  await expect(closeGuide).toHaveAttribute('aria-expanded', 'true');
  await closeGuide.click();

  await expect(greeting).toHaveCount(0);
  const openGuide = page.getByRole('button', { name: 'PassWo-Hilfe öffnen' });
  await expect(openGuide).toHaveAttribute('aria-expanded', 'false');
  await openGuide.click();

  await expect(greeting).toBeVisible();
  await expect(page.getByRole('button', { name: 'PassWo-Hilfe schließen' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});

test('S00 reduced motion and an adapter failure both reach the actionable end state', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design-lab/s00');
  await expect(page.getByRole('heading', { name: 'Hinweis für die Übung' })).toBeVisible();
  await expect(page.getByLabel('Ich verwende nur ausgedachte Passwörter.')).toBeEnabled();

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/design-lab/s00?animation=fail');
  await expect(
    page.getByText('Die Animation wurde beendet. Du kannst den Hinweis bestätigen und fortfahren.'),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hinweis für die Übung' })).toBeVisible();
  await page.getByLabel('Ich verwende nur ausgedachte Passwörter.').check();
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
});

test('S02 shows all accounts, keeps free-order partial progress, and restores an account', async ({
  page,
}) => {
  await page.goto('/design-lab/s02-campus-id');

  const campusId = page.getByRole('button', { name: /^CampusID\./ });
  const campusMail = page.getByRole('button', { name: /^CampusMail\./ });
  const campusBoard = page.getByRole('button', { name: /^CampusBoard Archiv\./ });

  await expect(campusId).toBeVisible();
  await expect(campusMail).toBeVisible();
  await expect(campusBoard).toBeVisible();
  await expect(page.getByRole('button', { name: /^LearnSpace\./ })).toHaveCount(0);
  await expect(page.getByText('Konten verstehen: 0/3 angesehen')).toBeVisible();

  await campusMail.press('Enter');
  await expect(page.getByRole('button', { name: /^Benachrichtigungen\./ })).toBeFocused();
  await page.getByRole('button', { name: /^Benachrichtigungen\./ }).press('Enter');
  await expect(page.getByText('Neue Kursnachricht, Terminänderung, Systemhinweis')).toBeVisible();
  await page.getByRole('button', { name: /^Bestätigungen\./ }).click();
  await expect(page.getByText('CampusMail: 2/4 Details angesehen').first()).toBeVisible();

  await campusId.click();
  await page.getByRole('button', { name: /^LearnSpace\./ }).click();
  await expect(page.getByText('CampusID: 1/3 Details angesehen').first()).toBeVisible();
  await campusMail.click();
  await expect(page.getByText('CampusMail: 2/4 Details angesehen').first()).toBeVisible();
  await expect(page.getByText('Bestätigung für Anmeldung oder Änderung')).toBeVisible();
});

test('S02 completes CampusID 3/3, CampusMail 4/4, and CampusBoard 3/3 without Board edges', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design-lab/s02-campus-id');

  const accounts = [
    {
      name: 'CampusID',
      detailNames: ['LearnSpace', 'Prüfungsportal', 'Cloud Notes'],
      localStatus: 'CampusID: 3/3 Details angesehen',
    },
    {
      name: 'CampusMail',
      detailNames: [
        'Benachrichtigungen',
        'Bestätigungen',
        'Zurücksetzungslinks',
        'Kommunikation in deinem Namen',
      ],
      localStatus: 'CampusMail: 4/4 Details angesehen',
    },
    {
      name: 'CampusBoard Archiv',
      detailNames: ['Alte Ankündigungen', 'Projektfragen', 'Archivierte Diskussionen'],
      localStatus: 'CampusBoard Archiv: 3/3 Details angesehen',
    },
  ] as const;

  await expect(page.getByRole('button', { name: 'Weiter' })).toHaveCount(0);
  for (const account of accounts) {
    const accountButton = page.getByRole('button', {
      name: new RegExp(`^${account.name.replace(' ', '\\s')}\\.`),
    });
    await accountButton.click();
    for (const detailName of account.detailNames) {
      await page
        .getByRole('button', { name: new RegExp(`^${detailName.replace(' ', '\\s')}\\.`) })
        .click();
    }
    await expect(page.getByText(account.localStatus).first()).toBeVisible();
    await expect(accountButton).toHaveAccessibleName(/Status: Verstanden/);
    if (account.name === 'CampusMail') {
      await expect(
        page.getByText(
          'CampusMail ist die Brücke zu persönlichen Informationen, Zurücksetzungen und Kommunikation in deinem Namen.',
        ),
      ).toBeVisible();
    }
    if (account.name === 'CampusBoard Archiv') {
      await expect(page.locator('.react-flow__edge')).toHaveCount(0);
    }
  }

  await expect(page.getByText('Konten verstehen: 3/3 angesehen')).toBeVisible();
  await expect(page.getByText('Alle drei Konten verstanden')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
  await expect(
    page
      .getByText(
        'CampusBoard öffnet hier keine weiteren Campusdienste und wird für typische Informationssammlung genutzt.',
        { exact: false },
      )
      .first(),
  ).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical'),
  ).toEqual([]);
});

const s06Expectations = [
  {
    scene: 's06-identical',
    result: '⚠ Gleiches Passwort: Der Zugang zum Zielkonto ist in dieser Szene betroffen.',
    edgeStatus: 'direct',
  },
  {
    scene: 's06-similar',
    result: '≈ Ähnliche Struktur: Der Zugang zum Zielkonto ist in dieser Szene betroffen.',
    edgeStatus: 'similar',
  },
  {
    scene: 's06-unique',
    result: 'Dieser Angriffsweg ist blockiert',
    edgeStatus: 'blocked',
  },
  {
    scene: 's06-hypothetical',
    result: 'Dieses direkte Ergebnis gehört nur zum hypothetischen Gegenbeispiel',
    edgeStatus: 'hypothetical',
  },
] as const;

for (const expected of s06Expectations) {
  test(`${expected.scene} applies its authored result deterministically`, async ({ page }) => {
    await page.goto(`/design-lab/${expected.scene}`);

    await expect(
      page.getByText('Vorgegebenes Beispiel — keine echte Passwortbewertung'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Vergleich starten' }).click();
    await expect(page.getByText(expected.result, { exact: false }).first()).toBeVisible();
    await expect(page.locator(`.react-flow__edge.edge-status-${expected.edgeStatus}`)).toHaveCount(
      1,
    );
  });
}

test('S06 similar exposes structure and a dashed orange path without relying on color alone', async ({
  page,
}) => {
  await page.goto('/design-lab/s06-similar');
  await page.getByRole('button', { name: 'Vergleich starten' }).click();

  await expect(page.getByText('Gemeinsamer Kern', { exact: true })).toBeVisible();
  await expect(page.getByText('Ähnlicher Aufbau', { exact: true })).toBeVisible();
  const edgePath = page.locator('.react-flow__edge.edge-status-similar .react-flow__edge-path');
  await expect(edgePath).toHaveCSS('stroke-dasharray', '9px, 7px');
});

test('S06 unique stops the line at the shield and limits its claim to this path', async ({
  page,
}) => {
  await page.goto('/design-lab/s06-unique');
  await page.getByRole('button', { name: 'Vergleich starten' }).click();

  await expect(
    page.getByText('Dieser Angriffsweg ist blockiert', { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Dieser Angriffsweg ist blockiert. Die Aussage gilt nur für diesen dargestellten Weg.',
    ),
  ).toBeVisible();
  await expect(page.locator('.react-flow__edge.edge-status-blocked')).toHaveCount(1);
  await expect(page.locator('.react-flow__edge.edge-status-direct')).toHaveCount(0);
});

test('S06 hypothetical keeps the non-real marker visible before and after comparison', async ({
  page,
}) => {
  await page.goto('/design-lab/s06-hypothetical');
  const marker = page.getByText('Hypothetisches Beispiel — nicht deine Auswahl', {
    exact: false,
  });

  await expect(marker.first()).toBeVisible();
  await page.getByRole('button', { name: 'Vergleich starten' }).click();
  await expect(marker.first()).toBeVisible();
  await expect(page.getByText('nicht zu einer realen Auswahl', { exact: false })).toBeVisible();
});

test('S06 reduced motion reaches the same authored unique end state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design-lab/s06-unique');
  await page.getByRole('button', { name: 'Vergleich starten' }).click();

  await expect(
    page.getByText('Dieser Angriffsweg ist blockiert', { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator('.react-flow__edge.edge-status-blocked')).toHaveCount(1);
});

test('S06 exposes replay and continue after completion with a textual semantic status', async ({
  page,
}) => {
  await page.goto('/design-lab/s06-similar');
  await page.getByRole('button', { name: 'Vergleich starten' }).click();

  await expect(page.getByText('Ähnliche Struktur · gestrichelter Weg')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Vergleich wiederholen' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled();
  await expect(page.locator('[data-emphasis="warning"]')).toHaveCSS('border-style', 'dashed');
});

for (const scene of scenes) {
  test(`${scene} has no serious or critical axe findings`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`/design-lab/${scene}`);

    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical'),
    ).toEqual([]);
  });
}
