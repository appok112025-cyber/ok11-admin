/**
 * Upload utility functions for error handling
 */

/**
 * Get user-friendly error message from upload errors
 */
export const getUploadErrorMessage = (error: any): string => {
  const message = error?.statusMessage || error?.message || ''

  if (
    message.includes('CORS') ||
    message.includes('Failed to fetch') ||
    message.includes('network')
  ) {
    return 'Upload failed due to network configuration. Please check CORS settings or try again.'
  }

  if (message.includes('401') || message.includes('Unauthorized')) {
    return 'Authentication required. Please log in again.'
  }

  if (message.includes('413') || message.includes('too large')) {
    return 'Image is too large. Please use an image smaller than 5MB.'
  }

  if (message.includes('400') || message.includes('Bad Request')) {
    return 'Invalid image file. Please try a different image.'
  }

  if (message.includes('contentType') || message.includes('file type')) {
    return 'Image format not supported. Please use PNG, JPG, or GIF.'
  }

  return 'Unable to upload image. Please try again or contact support if the problem persists.'
}
