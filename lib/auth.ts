// Mock authentication utility
// In a real app, this would interact with a backend or Firebase Auth

export interface User {
  id: string
  email: string
  name: string
}

// Simple in-memory storage for demo purposes
// In production, use cookies, localStorage, or a proper auth service
let currentUser: User | null = null

export const auth = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Mock login - accept any email/password combination
    // In production, validate against a backend
    if (email && password) {
      currentUser = {
        id: '1',
        email,
        name: email.split('@')[0],
      }
      return currentUser
    }
    return null
  },

  logout: async (): Promise<void> => {
    currentUser = null
  },

  getCurrentUser: (): User | null => {
    return currentUser
  },

  isAuthenticated: (): boolean => {
    return currentUser !== null
  },
}
