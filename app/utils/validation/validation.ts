export const validateEmail = (
  email: string
): { valid: boolean; error?: string } => {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  return { valid: true }
}

export const validateRequired = (
  value: string | number | null | undefined,
  fieldName: string
): { valid: boolean; error?: string } => {
  const stringValue = value != null ? String(value) : ''
  if (!stringValue || !stringValue.trim()) {
    return { valid: false, error: `${fieldName} is required` }
  }
  return { valid: true }
}

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): { valid: boolean; error?: string } => {
  if (value.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters long`,
    }
  }
  return { valid: true }
}

export const validateUrl = (
  url: string
): { valid: boolean; error?: string } => {
  if (!url || !url.trim()) {
    return { valid: false, error: 'URL is required' }
  }

  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, error: 'Please enter a valid URL' }
  }
}
