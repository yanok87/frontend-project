// Mock authentication utility
// In a real app, this would interact with a backend or Firebase Auth

export interface User {
  id: string
  email: string
  name: string
}

const STORAGE_KEY = 'auth_user'

// Helper functions for localStorage (with SSR safety)
const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setStoredUser = (user: User | null): void => {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore localStorage errors
  }
}

export const auth = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Mock login - accept any email/password combination
    // In production, validate against a backend
    if (email && password) {
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      }
      setStoredUser(user)
      return user
    }
    return null
  },

  logout: async (): Promise<void> => {
    setStoredUser(null)
  },

  getCurrentUser: (): User | null => {
    return getStoredUser()
  },

  isAuthenticated: (): boolean => {
    return getStoredUser() !== null
  },
}
