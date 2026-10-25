import { test, expect } from '@playwright/test'

test('feedback opens a pre-filled email', async ({ page }) => {
  // Record the mailto link instead of launching a mail app
  await page.addInitScript(() => {
    HTMLAnchorElement.prototype.click = function () {
      ;(window as unknown as { __mailto: string }).__mailto = this.href
    }
  })
  await page.goto('/challenges')
  await page.getByRole('button', { name: 'Give feedback' }).click()
  await page.getByRole('radio', { name: /bug/i }).click()
  await page.getByRole('textbox', { name: /your message/i }).fill('The calendar overlaps & breaks')
  await page.getByRole('button', { name: /send by email/i }).click()

  const href = await page.evaluate(() => (window as unknown as { __mailto: string }).__mailto)
  const url = new URL(href)
  expect(url.protocol).toBe('mailto:')
  expect(url.pathname).toBe('mohammedsherinofficial@gmail.com')
  expect(url.searchParams.get('subject')).toBe('[Bingely] Bug report')
  expect(url.searchParams.get('body')).toContain('The calendar overlaps & breaks')
  expect(url.searchParams.get('body')).toContain('/challenges')
  await expect(page.getByText(/email app should have opened/i)).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: /send feedback/i })).toBeHidden()
})
