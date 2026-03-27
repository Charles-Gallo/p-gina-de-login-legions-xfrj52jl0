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
 * Parses a Looker Studio URL and returns separate URLs for embedding and external viewing.
 * Removes session parameters (/u/0/) and ensures the correct path is used to prevent ERR_BLOCKED_BY_RESPONSE.
 * @param url - The original URL
 * @returns Object containing embedUrl (with /embed/) and externalUrl (without /embed/)
 */
export function getLookerUrls(url: string): { embedUrl: string; externalUrl: string } {
  if (!url) return { embedUrl: '', externalUrl: '' }
  try {
    let cleanUrl = url.trim()

    // Remove session identifiers like /u/0/, /u/1/, etc.
    cleanUrl = cleanUrl.replace(/\/u\/\d+\//g, '/')

    let embedUrl = cleanUrl
    let externalUrl = cleanUrl

    // If it has /embed/reporting/, externalUrl should use /reporting/
    if (cleanUrl.includes('lookerstudio.google.com/embed/reporting/')) {
      externalUrl = cleanUrl.replace(
        'lookerstudio.google.com/embed/reporting/',
        'lookerstudio.google.com/reporting/',
      )
    }
    // If it has /reporting/ (but not /embed/reporting/), embedUrl should use /embed/reporting/
    else if (cleanUrl.includes('lookerstudio.google.com/reporting/')) {
      embedUrl = cleanUrl.replace(
        'lookerstudio.google.com/reporting/',
        'lookerstudio.google.com/embed/reporting/',
      )
    }

    return { embedUrl, externalUrl }
  } catch (e) {
    return { embedUrl: url, externalUrl: url }
  }
}

/**
 * Backwards compatibility wrapper
 */
export function sanitizeLookerUrl(url: string): string {
  return getLookerUrls(url).embedUrl
}
