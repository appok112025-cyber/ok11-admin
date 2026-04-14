/**
 * Data transformation utilities
 */

/**
 * Normalize ID from MongoDB _id or regular id field
 */
export const normalizeId = (item: any): string => {
  return item._id || item.id || ''
}

/**
 * Map array of items with normalized IDs
 */
export const normalizeIds = <T extends { _id?: string; id?: string }>(
  items: T[]
): Array<T & { id: string }> => {
  return items.map(item => ({
    ...item,
    id: normalizeId(item),
  })) as Array<T & { id: string }>
}
