import type { CollectionSchema } from 'deepspace/schema'

export const fieldnotesSchema: CollectionSchema = {
  name: 'fieldnotes',
  columns: [
    { name: 'expeditionId', storage: 'text', interpretation: 'plain' },
    { name: 'author', storage: 'text', interpretation: 'plain' },
    { name: 'content', storage: 'text', interpretation: 'plain' },
    { name: 'waypointTitle', storage: 'text', interpretation: 'plain' },
    { name: 'category', storage: 'text', interpretation: 'plain' },
  ],
  permissions: {
    viewer: { read: true, create: true, update: true, delete: true },
    member: { read: true, create: true, update: true, delete: true },
    admin: { read: true, create: true, update: true, delete: true },
  },
}
