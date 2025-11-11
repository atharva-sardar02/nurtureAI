/**
 * Date Helper Utilities
 * Functions for formatting and manipulating dates
 */

/**
 * Format date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return ""
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ""

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateObj)
}

/**
 * Format date to short string (MM/DD/YYYY)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateShort(date) {
  if (!date) return ""
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ""

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(dateObj)
}

/**
 * Format date and time
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  if (!date) return ""
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ""

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj)
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return ""
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ""

  const now = new Date()
  const diffInSeconds = Math.floor((now - dateObj) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`
}

/**
 * Check if date is today
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  if (!date) return false
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return false

  const today = new Date()
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if date is in the past
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export function isPast(date) {
  if (!date) return false
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return false

  return dateObj < new Date()
}

/**
 * Check if date is in the future
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export function isFuture(date) {
  if (!date) return false
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return false

  return dateObj > new Date()
}

/**
 * Get days until date
 * @param {Date|string|number} date - Target date
 * @returns {number} Number of days until date (negative if past)
 */
export function daysUntil(date) {
  if (!date) return 0
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return 0

  const now = new Date()
  const diffInMs = dateObj - now
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
}

/**
 * Format time only (HH:MM AM/PM)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  if (!date) return ""
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ""

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj)
}

