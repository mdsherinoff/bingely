import { test, expect } from '@playwright/test'

test.describe('Achievements page', () => {
  test('loads with all achievement badges', async ({ page }) => {
    await page.goto('/achievements')
    await expect(page.getByText('Your badges')).toBeVisible()
  })

  test('shows progress bar', async ({ page }) => {
    await page.goto('/achievements')
    const progressBar = page.getByRole('progressbar')
    await expect(progressBar).toBeVisible()
  })

  test('shows correct total achievement count', async ({ page }) => {
    await page.goto('/achievements')
    await expect(page.getByText(/of 10 unlocked/)).toBeVisible()
  })
})
