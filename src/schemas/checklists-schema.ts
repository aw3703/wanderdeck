import type { CollectionSchema } from 'deepspace/schema'

export const checklistsSchema: CollectionSchema = {
  name: 'checklists',
  columns: [
    { name: 'expeditionId', storage: 'text', interpretation: 'plain' },
    { name: 'item', storage: 'text', interpretation: 'plain' },
    { name: 'category', storage: 'text', interpretation: 'plain' },
    { name: 'completed', storage: 'number', interpretation: { kind: 'boolean' } },
    { name: 'assignedTo', storage: 'text', interpretation: 'plain' },
  ],
  permissions: {
    viewer: { read: true, create: true, update: true, delete: true },
    member: { read: true, create: true, update: true, delete: true },
    admin: { read: true, create: true, update: true, delete: true },
  },
}
