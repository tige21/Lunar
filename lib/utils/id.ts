/**
 * ID generation utilities for Lunar Sleep Analysis App
 * Generates unique identifiers for database records
 */

/**
 * Generate a unique ID using timestamp and random components
 * Format: [timestamp_base36][random_suffix]
 * Example: 1j2k3l4m5n6o_abc123
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${randomSuffix}`;
}

/**
 * Generate a shorter unique ID for UI purposes
 * Format: [random_8_chars]
 * Example: a1b2c3d4
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Generate a conversation ID with a specific prefix
 * Format: conv_[timestamp]_[random]
 * Example: conv_1j2k3l4m_abc123
 */
export function generateConversationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `conv_${timestamp}_${random}`;
}

/**
 * Generate a session ID with date prefix for easier sorting
 * Format: session_[YYYYMMDD]_[timestamp]_[random]
 * Example: session_20241209_1j2k3l4m_abc123
 */
export function generateSessionId(date: Date = new Date()): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `session_${dateStr}_${timestamp}_${random}`;
}

/**
 * Validate if a string is a valid generated ID
 */
export function isValidId(id: string): boolean {
  // Basic validation - should contain at least one underscore and be reasonable length
  return typeof id === 'string' && 
         id.length >= 8 && 
         id.length <= 50 && 
         id.includes('_') &&
         /^[a-z0-9_]+$/.test(id);
}

/**
 * Extract timestamp from generated ID (if possible)
 */
export function extractTimestampFromId(id: string): Date | null {
  try {
    const parts = id.split('_');
    if (parts.length >= 2) {
      // Try to parse the first part as base36 timestamp
      const timestamp = parseInt(parts[0], 36);
      if (timestamp > 0 && timestamp < Date.now() * 2) { // Reasonable bounds
        return new Date(timestamp);
      }
    }
    return null;
  } catch {
    return null;
  }
}