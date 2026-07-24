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

test('tabs and address are controlled by the selected snapshot', async ({ page }) => {
  await page.goto('/design-lab/normal');

  const overviewTab = page.getByRole('tab', { name: 'Übersicht' });
  const preparationTab = page.getByRole('tab', { name: 'Vorbereitung' });
  const reflectionTab = page.getByRole('tab', {
    name: /Reflexion.*nicht freigegeben/,
  });

  await expect(page.getByLabel('Fiktive Adresse')).toHaveText('campus.example/vorbereitung');
  await expect(preparationTab).toHaveAttribute('aria-selected', 'true');
  await expect(overviewTab).toHaveAttribute('aria-selected', 'false');
  await expect(reflectionTab).toBeDisabled();

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(overviewTab).toBeFocused();
  await expect(overviewTab).toHaveCSS('outline-style', 'solid');
  await expect(overviewTab).toHaveCSS('outline-width', '3px');

  await page.keyboard.press('Enter');
  await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  await expect(preparationTab).toHaveAttribute('aria-selected', 'false');
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
