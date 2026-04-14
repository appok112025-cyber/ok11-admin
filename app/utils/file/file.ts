/**
 * File utility functions
 */

/**
 * Sanitize a filename by removing special characters and converting to lowercase
 */
export const sanitizeFileName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

/**
 * Get file extension from filename
 */
export const getFileExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.substring(lastDot) : '.jpg'
}
