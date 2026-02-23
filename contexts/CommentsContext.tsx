'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Comment } from '@/lib/api'

interface CommentsContextType {
  comments: Record<number, Comment[]> // postId -> comments
  addComment: (postId: number, comment: Omit<Comment, 'id' | 'postId'>) => void
  getCommentsForPost: (postId: number) => Comment[]
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined)

const STORAGE_KEY = 'local_comments'

const getStoredComments = (): Record<number, Comment[]> => {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const setStoredComments = (comments: Record<number, Comment[]>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments))
  } catch {
    // Ignore localStorage errors
  }
}

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Record<number, Comment[]>>(() => getStoredComments())

  useEffect(() => {
    // Load from localStorage on mount
    const stored = getStoredComments()
    setComments(stored)
  }, [])

  const addComment = (postId: number, commentData: Omit<Comment, 'id' | 'postId'>) => {
    // Validate comment data - ensure it has required fields
    if (!commentData.name || !commentData.email || !commentData.body) {
      console.error('Invalid comment data - missing required fields:', commentData)
      return
    }

    // Additional validation: ensure commentData doesn't look like a post
    // Posts have 'title' and 'userId', comments don't
    if ('title' in commentData || 'userId' in commentData) {
      console.error('Rejected: Attempted to add post data as comment:', commentData)
      return
    }

    // Ensure we have the correct comment structure
    if (typeof commentData.name !== 'string' || typeof commentData.email !== 'string' || typeof commentData.body !== 'string') {
      console.error('Invalid comment data - wrong types:', commentData)
      return
    }

    console.log('Adding valid comment for postId:', postId, 'comment:', { name: commentData.name, email: commentData.email, body: commentData.body.substring(0, 50) + '...' })

    const newComment: Comment = {
      name: commentData.name,
      email: commentData.email,
      body: commentData.body,
      id: Date.now(), // Simple ID generation
      postId,
    }

    setComments((prev) => {
      const updated = {
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }
      setStoredComments(updated)
      return updated
    })
  }

  const getCommentsForPost = (postId: number): Comment[] => {
    const postComments = comments[postId] || []
    // Validate comments - ensure they have the correct structure
    return postComments.filter((comment) => {
      return (
        comment &&
        typeof comment === 'object' &&
        'id' in comment &&
        'postId' in comment &&
        'name' in comment &&
        'email' in comment &&
        'body' in comment &&
        comment.postId === postId
      )
    })
  }

  return (
    <CommentsContext.Provider
      value={{
        comments,
        addComment,
        getCommentsForPost,
      }}
    >
      {children}
    </CommentsContext.Provider>
  )
}

export function useComments() {
  const context = useContext(CommentsContext)
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentsProvider')
  }
  return context
}
