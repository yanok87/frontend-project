/** SSR-safe localStorage helpers */

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getStorageItem<T>(key: string): T | null {
  if (!isClient()) return null
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : null
  } catch {
    return null
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (!isClient()) return
  try {
    if (value == null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch {
    // Ignore localStorage errors
  }
}

export function removeStorageItem(key: string): void {
  if (!isClient()) return
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore
  }
}
