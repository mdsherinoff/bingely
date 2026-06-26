import { test, expect } from '@playwright/test'

test.describe('Challenges', () => {
  test('challenges page loads with cards', async ({ page }) => {
    await page.goto('/challenges')
    await expect(page.getByText('Choose your journey')).toBeVisible()
    const cards = page.locator('a[href^="/challenges/"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('nolan marathon challenge page loads', async ({ page }) => {
    await page.goto('/challenges/nolan-marathon')
    await expect(page.getByText('Nolan Marathon')).toBeVisible()
    await expect(page.getByText('The watchlist')).toBeVisible()
  })

  test('challenge page shows film list', async ({ page }) => {
    await page.goto('/challenges/nolan-marathon')
    await expect(page.getByText('Memento')).toBeVisible()
    await expect(page.getByText('Inception')).toBeVisible()
  })

  test('plan this challenge CTA is visible', async ({ page }) => {
    await page.goto('/challenges/nolan-marathon')
    await expect(page.getByText('Plan this challenge →')).toBeVisible()
  })

  test('back link returns to challenges list', async ({ page }) => {
    await page.goto('/challenges/nolan-marathon')
    await page.getByText('← ALL CHALLENGES').click()
    await expect(page).toHaveURL('/challenges')
  })

  test('ghibli journey loads correctly', async ({ page }) => {
    await page.goto('/challenges/ghibli-journey')
    await expect(page.getByText('Studio Ghibli Journey')).toBeVisible()
  })
})
