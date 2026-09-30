import { test, expect } from '@playwright/test'

test.describe('WanderDeck E2E flows', () => {
  test('landing page navigates to expedition studio', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('static-landing')).toBeVisible()

    const launchBtn = page.getByRole('link', { name: 'Launch Studio' }).first()
    await expect(launchBtn).toBeVisible()
    await launchBtn.click()

    await expect(page).toHaveURL(/\/home/)
    await expect(page.getByTestId('app-navigation')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('h1', { hasText: 'WanderDeck' })).toBeVisible()
  })

  test('expedition studio loads waypoints, tabs, and strategist drawer', async ({ page }) => {
    await page.goto('/home')
    await expect(page.getByTestId('app-navigation')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('h1', { hasText: 'WanderDeck' })).toBeVisible()

    // Wait for the flagship expedition card to be rendered (auto-seeded on mount)
    await expect(
      page.getByRole('heading', { name: /Iceland South Coast|Tokyo Heritage/i }).first()
    ).toBeVisible({ timeout: 20_000 })

    // Verify tabs exist
    const waypointsTab = page.getByRole('button', { name: /Route Waypoints/i })
    const checklistTab = page.getByRole('button', { name: /Gear Checklist/i })
    const logbookTab = page.getByRole('button', { name: /Field Logbook/i })

    await expect(waypointsTab).toBeVisible()
    await expect(checklistTab).toBeVisible()
    await expect(logbookTab).toBeVisible()

    // Test Checklist tab switch
    await checklistTab.click()
    await expect(page.getByRole('heading', { name: 'Expedition Gear & Prep' })).toBeVisible()

    // Test Logbook tab switch
    await logbookTab.click()
    await expect(page.getByRole('heading', { name: 'Field Logbook & Team Notes' })).toBeVisible()

    // Switch back to Waypoints tab
    await waypointsTab.click()
    await expect(page.getByRole('heading', { name: 'Itinerary & Telemetry' })).toBeVisible()

    // Test AI Field Strategist Drawer
    const strategistBtn = page.getByRole('button', { name: /Field Strategist/i })
    await expect(strategistBtn).toBeVisible()
    await strategistBtn.click()

    await expect(page.getByRole('heading', { name: 'Field Strategist' })).toBeVisible()
    await expect(page.getByPlaceholder(/Ask the strategist anything/i)).toBeVisible()
  })
})
