import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('loads and shows the Bingely title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Bingely')
  })

  test('quote marquee is visible', async ({ page }) => {
    await page.goto('/')
    const marquee = page.locator('.animate-marquee').first()
    await expect(marquee).toBeVisible()
  })

  test('hero search navigates to search page', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder('Search a film, series, or anime...')
    await input.fill('Breaking Bad')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=Breaking/)
  })

  test('suggestion buttons navigate to search', async ({ page }) => {
    await page.goto('/')
    // Target specifically the suggestion buttons in the hero
    await page
      .locator('button')
      .filter({ hasText: 'One Piece' })
      .first()
      .click()
    await expect(page).toHaveURL(/\/search\?q=One/)
  })

  test('clicking Bingely title reveals a film quote', async ({ page }) => {
    await page.goto('/')
    await page.locator('h1').click()
    const quote = page.locator('.animate-in').first()
    await expect(quote).toBeVisible()
  })

  test('challenges link in footer works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'CHALLENGES' }).first().click()
    await expect(page).toHaveURL('/challenges')
  })

  test('achievements link in footer works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'ACHIEVEMENTS' }).first().click()
    await expect(page).toHaveURL('/achievements')
  })

  test('mystery reel button is visible', async ({ page }) => {
    await page.goto('/')
    const mysteryBtn = page.locator(
      '[aria-label="Mystery Reel — discover a random film challenge"]'
    )
    await expect(mysteryBtn).toBeVisible()
  })
})
