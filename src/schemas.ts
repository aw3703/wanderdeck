/**
 * Collection Schemas
 *
 * All collections with columns and RBAC permissions.
 * Single source of truth — imported by both worker and frontend.
 */

import type { CollectionSchema } from 'deepspace/schema'
import { usersSchema } from './schemas/users-schema'
import { settingsSchema } from './schemas/admin-schema'
import { expeditionsSchema } from './schemas/expeditions-schema'
import { waypointsSchema } from './schemas/waypoints-schema'
import { checklistsSchema } from './schemas/checklists-schema'
import { fieldnotesSchema } from './schemas/fieldnotes-schema'

export const schemas: CollectionSchema[] = [
  usersSchema,
  settingsSchema,
  expeditionsSchema,
  waypointsSchema,
  checklistsSchema,
  fieldnotesSchema,
]

export {
  usersSchema,
  settingsSchema,
  expeditionsSchema,
  waypointsSchema,
  checklistsSchema,
  fieldnotesSchema,
}
