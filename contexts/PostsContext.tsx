'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { api, Post } from '@/lib/api'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import { POSTS_STORAGE_KEY, LOCAL_POST_ID_MIN } from '@/lib/constants'

interface PostsContextType {
  posts: Post[]
  loading: boolean
  addPost: (post: Post) => void
  updatePost: (id: number, post: Partial<Post>) => void
  removePost: (id: number) => void
  refreshPosts: () => Promise<void>
}

const PostsContext = createContext<PostsContextType | undefined>(undefined)

function getStoredPosts(): Post[] {
  return getStorageItem<Post[]>(POSTS_STORAGE_KEY) ?? []
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true)
      const apiPosts = await api.getPosts()
      const localPosts = getStoredPosts()
      const localPostsOnly = localPosts.filter((p) => p.id > LOCAL_POST_ID_MIN)
      const mergedPosts = [
        ...localPostsOnly,
        ...apiPosts.filter((p) => !localPostsOnly.some((lp) => lp.id === p.id)),
      ]
      setPosts(mergedPosts)
      setStorageItem(POSTS_STORAGE_KEY, mergedPosts)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading posts:', error)
      }
      const localPosts = getStoredPosts()
      if (localPosts.length > 0) {
        setPosts(localPosts)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const addPost = useCallback((post: Post) => {
    setPosts((prev) => {
      const updated = [post, ...prev]
      setStorageItem(POSTS_STORAGE_KEY, updated)
      return updated
    })
  }, [])

  const updatePost = useCallback((id: number, updatedPost: Partial<Post>) => {
    setPosts((prev) => {
      const updated = prev.map((post) => (post.id === id ? { ...post, ...updatedPost } : post))
      setStorageItem(POSTS_STORAGE_KEY, updated)
      return updated
    })
  }, [])

  const removePost = useCallback((id: number) => {
    setPosts((prev) => {
      const updated = prev.filter((post) => post.id !== id)
      setStorageItem(POSTS_STORAGE_KEY, updated)
      return updated
    })
  }, [])

  const value = useMemo(
    () => ({
      posts,
      loading,
      addPost,
      updatePost,
      removePost,
      refreshPosts: loadPosts,
    }),
    [posts, loading, addPost, updatePost, removePost, loadPosts]
  )

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}

export function usePosts() {
  const context = useContext(PostsContext)
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider')
  }
  return context
}
