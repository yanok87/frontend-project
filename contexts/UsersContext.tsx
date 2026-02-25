'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface UsersContextType {
  /** Map of userId -> display name (for post authors) */
  userNamesByUserId: Record<number, string>
  /** Map of email -> display name (for comment authors) */
  userNameByEmail: Record<string, string>
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [userNamesByUserId, setUserNamesByUserId] = useState<Record<number, string>>({})
  const [userNameByEmail, setUserNameByEmail] = useState<Record<string, string>>({})

  useEffect(() => {
    api
      .getUsers()
      .then((users) => {
        const byId: Record<number, string> = {}
        const byEmail: Record<string, string> = {}
        users.forEach((u) => {
          byId[u.id] = u.name
          byEmail[u.email] = u.name
        })
        if (user?.email) {
          byEmail[user.email] = user.name
        }
        setUserNamesByUserId(byId)
        setUserNameByEmail(byEmail)
      })
      .catch(() => {
        if (user?.email) {
          setUserNameByEmail((prev) => ({ ...prev, [user.email]: user.name }))
        }
      })
  }, [user?.email, user?.name])

  const value = useMemo(
    () => ({
      userNamesByUserId,
      userNameByEmail,
    }),
    [userNamesByUserId, userNameByEmail]
  )

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider')
  }
  return context
}
