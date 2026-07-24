import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const scenes = ['normal', 'dimmed', 'passwo-overlay', 's00', 's02-campus-id'] as const;
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

for (const viewport of viewports) {
  test(`all design-lab scenes fit ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);

    for (const scene of scenes) {
      await page.goto(`/design-lab/${scene}`);
      await expect(page.getByRole('heading', { name: 'BrowserShell Design Lab' })).toBeVisible();
      await expectShellInsideViewport(page);
      await expectNoHorizontalScroll(page);
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

test('a focused disabled tab keeps its reason visible and cannot be activated', async ({
  page,
}) => {
  await page.goto('/design-lab/normal');

  const preparationTab = page.getByRole('tab', { name: 'Vorbereitung' });
  const reflectionTab = page.getByRole('tab', { name: 'Reflexion' });
  const disabledReason = page.getByText('In diesem Design-Lab-Snapshot nicht freigegeben.', {
    exact: false,
  });

  await expect(reflectionTab).toHaveAttribute('aria-disabled', 'true');
  await expect(reflectionTab).not.toHaveAttribute('disabled', '');
  await expect(disabledReason).toBeVisible();

  const reasonId = await reflectionTab.getAttribute('aria-describedby');
  expect(reasonId).not.toBeNull();
  if (reasonId === null) return;
  await expect(page.locator(`[id="${reasonId}"]`)).toBeVisible();

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
  await expect(page.getByLabel('Fiktive Adresse')).toHaveText('campus.example/vorbereitung');
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
    await expect(page.getByLabel('Fiktive Adresse')).toHaveText(expected.address);
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

test('S02 CampusID reveals authored services in order and completes after all previews', async ({
  page,
}) => {
  await page.goto('/design-lab/s02-campus-id');

  const campusId = page.getByRole('button', { name: /^CampusID\./ });
  const learnSpace = page.getByRole('button', { name: /^LearnSpace\./ });
  const examPortal = page.getByRole('button', { name: /^Prüfungsportal\./ });
  const cloudNotes = page.getByRole('button', { name: /^Cloud Notes\./ });
  const completion = page.getByText('CampusID verstanden', { exact: true });

  await expect(campusId).toBeVisible();
  await expect(learnSpace).toHaveCount(0);
  await expect(completion).toHaveCount(0);

  await page.evaluate(() => {
    const revealOrder: string[] = [];
    Reflect.set(window, '__s02RevealOrder', revealOrder);
    const observer = new MutationObserver(() => {
      for (const serviceId of ['learnspace', 'exam-portal', 'cloud-notes']) {
        const button = document.querySelector<HTMLElement>(
          `[data-scene-node-button="${serviceId}"]`,
        );
        if (
          button !== null &&
          getComputedStyle(button).visibility !== 'hidden' &&
          !revealOrder.includes(serviceId)
        ) {
          revealOrder.push(serviceId);
        }
      }
    });
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  });

  await campusId.click();
  await expect(learnSpace).toBeVisible();
  await expect(examPortal).toBeVisible();
  await expect(cloudNotes).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, '__s02RevealOrder'))).toEqual([
    'learnspace',
    'exam-portal',
    'cloud-notes',
  ]);
  await expect(learnSpace).toBeFocused();

  await learnSpace.press('Enter');
  await expect(page.getByText('CampusID wird geprüft …', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Kurszugänge, Vorlesungsunterlagen, Abgaben', { exact: true }),
  ).toBeVisible();
  await expect(completion).toHaveCount(0);

  await examPortal.click();
  await expect(
    page.getByText('Anmeldungen, Termine, Ergebnisübersichten', { exact: true }),
  ).toBeVisible();
  await expect(completion).toHaveCount(0);

  await cloudNotes.click();
  await expect(
    page.getByText('Notizen, Entwürfe, Arbeitsdateien, Projektmaterial', { exact: true }),
  ).toBeVisible();
  await expect(completion).toBeVisible();
  await expect(page.getByLabel('3 von 3 Vorschauen geöffnet')).toHaveAttribute('value', '3');
  await expect(campusId).toHaveAccessibleName(/Status: Verstanden/);
  await expect(page.getByText('Mit CampusID geöffnet', { exact: true })).toHaveCount(3);
});

test('S02 CampusID reduced motion reaches the same logical end state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design-lab/s02-campus-id');

  await page.getByRole('button', { name: /^CampusID\./ }).click();
  for (const serviceName of ['LearnSpace', 'Prüfungsportal', 'Cloud Notes']) {
    await page.getByRole('button', { name: new RegExp(`^${serviceName}\\.`) }).click();
  }

  await expect(page.getByText('CampusID verstanden', { exact: true })).toBeVisible();
  await expect(page.getByLabel('3 von 3 Vorschauen geöffnet')).toHaveAttribute('value', '3');
  await expect(page.getByRole('button', { name: /^CampusID\./ })).toHaveAccessibleName(
    /Status: Verstanden/,
  );
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
