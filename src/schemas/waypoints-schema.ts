import type { CollectionSchema } from 'deepspace/schema'

export const waypointsSchema: CollectionSchema = {
  name: 'waypoints',
  columns: [
    { name: 'expeditionId', storage: 'text', interpretation: 'plain' },
    { name: 'title', storage: 'text', interpretation: 'plain' },
    { name: 'location', storage: 'text', interpretation: 'plain' },
    { name: 'category', storage: 'text', interpretation: 'plain' },
    { name: 'lat', storage: 'text', interpretation: 'plain' },
    { name: 'lon', storage: 'text', interpretation: 'plain' },
    { name: 'order', storage: 'number', interpretation: 'plain' },
    { name: 'visited', storage: 'number', interpretation: { kind: 'boolean' } },
    { name: 'notes', storage: 'text', interpretation: 'plain' },
    { name: 'weatherJson', storage: 'text', interpretation: 'plain' },
    { name: 'wikiJson', storage: 'text', interpretation: 'plain' },
    { name: 'audioUrl', storage: 'text', interpretation: 'plain' },
    { name: 'audioNarrator', storage: 'text', interpretation: 'plain' },
    { name: 'audioNarrative', storage: 'text', interpretation: 'plain' },
  ],
  permissions: {
    viewer: { read: true, create: true, update: true, delete: true },
    member: { read: true, create: true, update: true, delete: true },
    admin: { read: true, create: true, update: true, delete: true },
  },
}
