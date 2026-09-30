import { APP_NAME } from './constants'

declare const __DEEPSPACE_SITE_ORIGIN__: string | undefined

export const seo = {
  title: 'WanderDeck — Collaborative Expedition Studio & AI Audio Field Guide',
  description: 'Plan, scout, and navigate expeditions with real-time multiplayer sync, live meteorological telemetry, Wikipedia cultural dossiers, and AI voice field guides.',
  origin: typeof __DEEPSPACE_SITE_ORIGIN__ === 'string' ? __DEEPSPACE_SITE_ORIGIN__ : 'https://wanderdeck.app.space',
  noindex: false,
}
