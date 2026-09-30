import type { CollectionSchema } from 'deepspace/schema'

export const expeditionsSchema: CollectionSchema = {
  name: 'expeditions',
  columns: [
    { name: 'title', storage: 'text', interpretation: 'plain' },
    { name: 'destination', storage: 'text', interpretation: 'plain' },
    { name: 'country', storage: 'text', interpretation: 'plain' },
    { name: 'summary', storage: 'text', interpretation: 'plain' },
    { name: 'coverImage', storage: 'text', interpretation: 'plain' },
    { name: 'tags', storage: 'text', interpretation: 'plain' },
    { name: 'startDate', storage: 'text', interpretation: 'plain' },
    { name: 'endDate', storage: 'text', interpretation: 'plain' },
    { name: 'status', storage: 'text', interpretation: 'plain' },
    { name: 'aiBriefing', storage: 'text', interpretation: 'plain' },
  ],
  permissions: {
    viewer: { read: true, create: true, update: true, delete: true },
    member: { read: true, create: true, update: true, delete: true },
    admin: { read: true, create: true, update: true, delete: true },
  },
}
