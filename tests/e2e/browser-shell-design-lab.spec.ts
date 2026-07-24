import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const scenes = ['normal', 'dimmed', 'passwo-overlay'] as const;
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
