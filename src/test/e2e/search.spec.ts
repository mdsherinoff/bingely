import { test, expect } from '@playwright/test'

test.describe('Search box', () => {
  test('suggests titles as you type and opens the planner', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('combobox', { name: /search films/i })
    await input.fill('breaking bad')

    const option = page
      .getByRole('option', { name: /breaking bad.*series/i })
      .first()
    await expect(option).toBeVisible({ timeout: 10000 })
    await option.click()
    await expect(page).toHaveURL(/\/plan\/\d+\?type=/)
  })

  test('works from the keyboard', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('combobox', { name: /search films/i })
    await input.fill('inception')
    // Wait for real title rows, not the "Searching…" row
    await expect(
      page.getByRole('option', { name: /· (Film|Series)|Film ·|Series ·/ }).first()
    ).toBeVisible({ timeout: 10000 })

    await input.press('ArrowDown')
    await expect(input).toHaveAttribute('aria-activedescendant', /.+/)
    await input.press('Enter')
    await expect(page).toHaveURL(/\/plan\/\d+\?type=/)
  })

  test('remembers recent searches', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('combobox', { name: /search films/i })
    await input.fill('one piece')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=one/)

    await page.goto('/')
    await page.getByRole('combobox', { name: /search films/i }).focus()
    await expect(page.getByRole('option', { name: /one piece/i })).toBeVisible()
  })
})
