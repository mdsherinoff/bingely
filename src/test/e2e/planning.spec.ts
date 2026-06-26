import { test, expect } from '@playwright/test'

test.describe('Planning flow', () => {
  // Use a known TMDB ID — Breaking Bad is 1396
  const TV_ID = 1396
  const MOVIE_ID = 550 // Fight Club

  test('plan page loads for a TV show', async ({ page }) => {
    await page.goto(`/plan/${TV_ID}?type=tv`)
    await page.waitForSelector('h1', { timeout: 10000 })
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('plan page loads for a movie', async ({ page }) => {
    await page.goto(`/plan/${MOVIE_ID}?type=movie`)
    await page.waitForSelector('h1', { timeout: 10000 })
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('day selector toggles days on and off', async ({ page }) => {
    await page.goto(`/plan/${TV_ID}?type=tv`)
    await page.waitForSelector('h1', { timeout: 10000 })

    const mondayBtn = page.getByRole('button', { name: /monday/i })
    await mondayBtn.click()
    await expect(mondayBtn).toHaveAttribute('aria-pressed', 'true')
    await mondayBtn.click()
    await expect(mondayBtn).toHaveAttribute('aria-pressed', 'false')
  })

  test('pace selector changes selection', async ({ page }) => {
    await page.goto(`/plan/${TV_ID}?type=tv`)
    await page.waitForSelector('h1', { timeout: 10000 })

    const bingeBtn = page.getByRole('radio', { name: /binge/i })
    await bingeBtn.click()
    await expect(bingeBtn).toHaveAttribute('aria-checked', 'true')
  })

  test('generate button navigates to results', async ({ page }) => {
    await page.goto(`/plan/${TV_ID}?type=tv`)
    await page.waitForSelector('h1', { timeout: 10000 })

    // Enable Monday
    const mondayBtn = page.getByRole('button', { name: /monday/i })
    await mondayBtn.click()

    // Click generate
    const generateBtn = page.getByRole('button', {
      name: /generate watch plan/i,
    })
    await generateBtn.click()

    await expect(page).toHaveURL(/\/plan\/\d+\/results/, { timeout: 10000 })
  })

  test('results page shows completion date', async ({ page }) => {
    await page.goto(`/plan/${TV_ID}?type=tv`)
    await page.waitForSelector('h1', { timeout: 10000 })

    const mondayBtn = page.getByRole('button', { name: /monday/i })
    await mondayBtn.click()

    await page.getByRole('button', { name: /generate watch plan/i }).click()
    await page.waitForSelector('text=FINISH LINE', { timeout: 10000 })

    await expect(page.getByText('FINISH LINE')).toBeVisible()
  })

  test('results page shows week by week breakdown', async ({ page }) => {
    await page.goto(`/plan/${TV_ID}?type=tv`)
    await page.waitForSelector('h1', { timeout: 10000 })

    const mondayBtn = page.getByRole('button', { name: /monday/i })
    await mondayBtn.click()

    await page.getByRole('button', { name: /generate watch plan/i }).click()
    await page.waitForSelector('text=Week by week', { timeout: 15000 })

    await expect(page.getByText('Week by week')).toBeVisible()
    // Check at least one week row exists
    await expect(page.locator('text=WEEK 1').first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('back to planner link works from results', async ({ page }) => {
    await page.goto(`/plan/${TV_ID}?type=tv`)
    await page.waitForSelector('h1', { timeout: 10000 })

    const mondayBtn = page.getByRole('button', { name: /monday/i })
    await mondayBtn.click()

    await page.getByRole('button', { name: /generate watch plan/i }).click()
    await page.waitForSelector('text=BACK TO PLANNER', { timeout: 10000 })

    await page.getByText('← BACK TO PLANNER').click()
    await expect(page).toHaveURL(new RegExp(`/plan/${TV_ID}`))
  })
})
