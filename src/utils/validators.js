/**
 * Validation Utilities
 * Reusable validation functions for forms and data
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate phone number (US format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== "string") return false
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "")
  // Check if it's 10 or 11 digits (11 if includes country code)
  return digitsOnly.length === 10 || digitsOnly.length === 11
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with isValid and errors
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = options

  const errors = []

  if (!password || password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`)
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field (for error message)
 * @returns {Object} Validation result
 */
export function validateRequired(value, fieldName = "Field") {
  const isValid = value !== null && value !== undefined && value !== ""
  return {
    isValid,
    error: isValid ? null : `${fieldName} is required`,
  }
}

/**
 * Validate date
 * @param {Date|string} date - Date to validate
 * @returns {boolean} True if valid date
 */
export function isValidDate(date) {
  if (!date) return false
  const dateObj = date instanceof Date ? date : new Date(date)
  return !isNaN(dateObj.getTime())
}

/**
 * Validate date is in the future
 * @param {Date|string} date - Date to validate
 * @returns {Object} Validation result
 */
export function validateFutureDate(date) {
  if (!isValidDate(date)) {
    return {
      isValid: false,
      error: "Invalid date",
    }
  }

  const dateObj = date instanceof Date ? date : new Date(date)
  const isValid = dateObj > new Date()

  return {
    isValid,
    error: isValid ? null : "Date must be in the future",
  }
}

/**
 * Validate date is in the past
 * @param {Date|string} date - Date to validate
 * @returns {Object} Validation result
 */
export function validatePastDate(date) {
  if (!isValidDate(date)) {
    return {
      isValid: false,
      error: "Invalid date",
    }
  }

  const dateObj = date instanceof Date ? date : new Date(date)
  const isValid = dateObj < new Date()

  return {
    isValid,
    error: isValid ? null : "Date must be in the past",
  }
}

/**
 * Validate age (for date of birth)
 * @param {Date|string} dateOfBirth - Date of birth
 * @param {number} minAge - Minimum age required
 * @param {number} maxAge - Maximum age allowed
 * @returns {Object} Validation result
 */
export function validateAge(dateOfBirth, minAge = 0, maxAge = 150) {
  if (!isValidDate(dateOfBirth)) {
    return {
      isValid: false,
      error: "Invalid date of birth",
    }
  }

  const dob = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  if (age < minAge) {
    return {
      isValid: false,
      error: `Must be at least ${minAge} years old`,
    }
  }

  if (age > maxAge) {
    return {
      isValid: false,
      error: `Age cannot exceed ${maxAge} years`,
    }
  }

  return {
    isValid: true,
    age,
    error: null,
  }
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  if (!url || typeof url !== "string") return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate ZIP code (US format)
 * @param {string} zip - ZIP code to validate
 * @returns {boolean} True if valid ZIP code
 */
export function isValidZipCode(zip) {
  if (!zip || typeof zip !== "string") return false
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zip.trim())
}

/**
 * Validate form fields object
 * @param {Object} fields - Object with field names and values
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} Validation result with isValid and errors
 */
export function validateForm(fields, rules) {
  const errors = {}
  let isValid = true

  for (const [fieldName, value] of Object.entries(fields)) {
    const fieldRules = rules[fieldName] || []
    
    for (const rule of fieldRules) {
      if (rule.required && !validateRequired(value, fieldName).isValid) {
        errors[fieldName] = `${fieldName} is required`
        isValid = false
        break
      }

      if (rule.email && value && !isValidEmail(value)) {
        errors[fieldName] = "Invalid email address"
        isValid = false
        break
      }

      if (rule.minLength && value && value.length < rule.minLength) {
        errors[fieldName] = `Must be at least ${rule.minLength} characters`
        isValid = false
        break
      }

      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors[fieldName] = `Must be no more than ${rule.maxLength} characters`
        isValid = false
        break
      }

      if (rule.custom && value) {
        const customResult = rule.custom(value)
        if (!customResult.isValid) {
          errors[fieldName] = customResult.error || "Invalid value"
          isValid = false
          break
        }
      }
    }
  }

  return {
    isValid,
    errors,
  }
}

