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

    // Wait for an expedition card to be rendered (auto-seeded or loaded from store)
    await expect(
      page.getByRole('heading', { level: 2 }).first()
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

  test('interactive features: weather toggle, checklist filters, and custom deck creation', async ({ page }) => {
    await page.goto('/home')
    await expect(page.getByTestId('app-navigation')).toBeVisible({ timeout: 15_000 })

    // Wait for an expedition card to be rendered
    await expect(
      page.getByRole('heading', { level: 2 }).first()
    ).toBeVisible({ timeout: 20_000 })

    // 1. Test WeatherBadge °C / °F toggle
    const weatherBtn = page.locator('button[title*="toggle °C / °F"]').first()
    if (await weatherBtn.isVisible()) {
      const initialText = await weatherBtn.innerText()
      await weatherBtn.click()
      const toggledText = await weatherBtn.innerText()
      expect(toggledText).not.toEqual(initialText)
    }

    // 2. Test Checklist category filters
    const checklistTab = page.getByRole('button', { name: /Gear Checklist/i })
    await checklistTab.click()
    await expect(page.getByRole('heading', { name: 'Expedition Gear & Prep' })).toBeVisible()

    const safetyFilterBtn = page.getByRole('button', { name: 'safety' })
    if (await safetyFilterBtn.isVisible()) {
      await safetyFilterBtn.click()
      await expect(safetyFilterBtn).toHaveClass(/bg-primary/)
    }

    // 3. Test Custom Expedition Creation modal
    const newExpBtn = page.getByRole('button', { name: /New Expedition/i })
    await newExpBtn.click()

    const modalTitle = page.getByRole('heading', { name: 'Create Expedition Deck' })
    await expect(modalTitle).toBeVisible()

    // Switch to Custom Route
    const customRouteTab = page.getByRole('button', { name: 'Custom Route' })
    await customRouteTab.click()

    // Click quick preset
    const presetBtn = page.getByRole('button', { name: 'Dolomites Alta Via 1' })
    await presetBtn.click()

    // Submit custom creation
    const submitBtn = page.getByRole('button', { name: 'Create Expedition' })
    await submitBtn.click()

    // Verify modal closes and new deck is active
    await expect(modalTitle).not.toBeVisible({ timeout: 5_000 })

    const deckPill = page.getByRole('button', { name: /Dolomites Alta Via 1/i }).first()
    await expect(deckPill).toBeVisible({ timeout: 10_000 })
    await deckPill.click()
    await expect(page.getByRole('heading', { name: /Dolomites Alta Via 1/i }).first()).toBeVisible({ timeout: 10_000 })
  })
})
