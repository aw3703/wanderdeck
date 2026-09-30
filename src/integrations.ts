/**
 * Integration Billing Config
 *
 * Configure who pays for each integration's API calls.
 *
 * - 'developer': The app owner pays (default). Works for anonymous and signed-in users.
 * - 'user': The calling user pays. Requires sign-in.
 */

export const integrations: Record<string, { billing: 'developer' | 'user' }> = {
  anthropic: { billing: 'developer' },
  openweathermap: { billing: 'developer' },
  wikipedia: { billing: 'developer' },
  speech: { billing: 'developer' },
  gemini: { billing: 'developer' },
  google: { billing: 'user' },
}
