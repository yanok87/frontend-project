'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { Comment } from '@/lib/api'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import { COMMENTS_STORAGE_KEY } from '@/lib/constants'
import { validateCommentInput } from '@/lib/validation'

interface CommentsContextType {
  comments: Record<number, Comment[]>
  addComment: (postId: number, comment: Omit<Comment, 'id' | 'postId'>) => void
  getCommentsForPost: (postId: number) => Comment[]
}

/** Holds only local comments. API comments are loaded per-post in usePostComments and merged there. */
const CommentsContext = createContext<CommentsContextType | undefined>(undefined)

function isValidStoredComment(c: unknown, postId: number): c is Comment {
  return (
    !!c &&
    typeof c === 'object' &&
    'id' in c &&
    'postId' in c &&
    'name' in c &&
    'email' in c &&
    'body' in c &&
    (c as Comment).postId === postId
  )
}

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Record<number, Comment[]>>(() => getStorageItem<Record<number, Comment[]>>(COMMENTS_STORAGE_KEY) ?? {})

  useEffect(() => {
    const stored = getStorageItem<Record<number, Comment[]>>(COMMENTS_STORAGE_KEY)
    if (stored) setComments(stored)
  }, [])

  const addComment = useCallback((postId: number, commentData: Omit<Comment, 'id' | 'postId'>) => {
    if (!validateCommentInput(commentData)) return

    const newComment: Comment = {
      name: commentData.name,
      email: commentData.email,
      body: commentData.body,
      ...(commentData.subject !== undefined && commentData.subject !== '' && { subject: commentData.subject }),
      id: Date.now(),
      postId,
    }

    setComments((prev) => {
      const updated = {
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }
      setStorageItem(COMMENTS_STORAGE_KEY, updated)
      return updated
    })
  }, [])

  const getCommentsForPost = useCallback(
    (postId: number): Comment[] => {
      const postComments = comments[postId] || []
      return postComments.filter((c) => isValidStoredComment(c, postId))
    },
    [comments]
  )

  const value = useMemo(
    () => ({
      comments,
      addComment,
      getCommentsForPost,
    }),
    [comments, addComment, getCommentsForPost]
  )

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>
}

export function useComments() {
  const context = useContext(CommentsContext)
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentsProvider')
  }
  return context
}
