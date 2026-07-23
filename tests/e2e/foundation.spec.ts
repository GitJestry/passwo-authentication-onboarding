import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('foundation shell renders without serious accessibility findings', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'PassWo Foundation' })).toBeVisible();
  await expect(page.getByText('18 Trainingssegmente')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const blockingFindings = results.violations.filter(
    ({ impact }) => impact === 'serious' || impact === 'critical',
  );

  expect(blockingFindings).toEqual([]);
});
