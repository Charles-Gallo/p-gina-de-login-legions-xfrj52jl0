/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes Looker Studio URLs by removing session parameters (/u/0/)
 * and ensuring the /embed/ path is used to prevent ERR_BLOCKED_BY_RESPONSE.
 * @param url - The original URL
 * @returns Cleaned URL safe for embedding
 */
export function sanitizeLookerUrl(url: string): string {
  if (!url) return url
  try {
    let cleanUrl = url.trim()

    // Remove session identifiers like /u/0/, /u/1/, etc.
    cleanUrl = cleanUrl.replace(/\/u\/\d+\//g, '/')

    // Ensure it uses /embed/reporting/ instead of just /reporting/
    if (cleanUrl.includes('lookerstudio.google.com/reporting/')) {
      cleanUrl = cleanUrl.replace(
        'lookerstudio.google.com/reporting/',
        'lookerstudio.google.com/embed/reporting/',
      )
    }

    return cleanUrl
  } catch (e) {
    return url // fallback to original if parsing fails
  }
}
