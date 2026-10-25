import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Automated accessibility checks (WCAG 2.1 A/AA) on the main screens
// Measure the settled page, not text that's still fading in
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

const pages = [
  { name: 'home', path: '/', ready: 'h1' },
  { name: 'search', path: '/search?q=breaking%20bad', ready: 'main a[href^="/plan/"]' },
  { name: 'planner', path: '/plan/1396?type=tv', ready: '#start-episode' },
  { name: 'challenges', path: '/challenges', ready: 'h1' },
  { name: 'library', path: '/library', ready: 'h1' },
  { name: 'list builder', path: '/list/new', ready: '#list-name' },
  { name: 'achievements', path: '/achievements', ready: 'h1' },
]

for (const p of pages) {
  test(`${p.name} has no accessibility violations`, async ({ page }) => {
    await page.goto(p.path)
    await page.waitForSelector(p.ready, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    // Cards and rows fade in on a stagger; measure the settled page
    await page.waitForTimeout(1000)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`
    )
    expect(summary).toEqual([])
  })
}

test('results page has no accessibility violations', async ({ page }) => {
  await page.goto('/plan/1396?type=tv')
  await page.getByRole('button', { name: /generate watch plan/i }).click()
  await page.waitForSelector('text=YOU\'LL FINISH ON', { timeout: 15000 })
  // Where-to-watch loads separately; wait for it rather than network idle
  await page.waitForSelector('text=WHERE TO WATCH', { timeout: 15000 })
  // The page title streams in with the plan's details
  await expect(page).toHaveTitle(/done/i, { timeout: 15000 })
  // Week rows fade in on a short stagger (opacity still animates with
  // reduced motion); measure once they've settled
  await page.waitForTimeout(1000)
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`
  )
  expect(summary).toEqual([])
})
