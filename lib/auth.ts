// Mock authentication utility
// In a real app, this would interact with a backend or Firebase Auth

import { getStorageItem, setStorageItem } from '@/lib/storage'
import { AUTH_STORAGE_KEY } from '@/lib/constants'

export interface User {
  id: string
  email: string
  name: string
}

export const auth = {
  login: async (email: string, password: string): Promise<User | null> => {
    if (email && password) {
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      }
      setStorageItem(AUTH_STORAGE_KEY, user)
      return user
    }
    return null
  },

  logout: async (): Promise<void> => {
    setStorageItem(AUTH_STORAGE_KEY, null)
  },

  getCurrentUser: (): User | null => {
    return getStorageItem<User>(AUTH_STORAGE_KEY)
  },

  isAuthenticated: (): boolean => {
    return getStorageItem<User>(AUTH_STORAGE_KEY) !== null
  },
}
