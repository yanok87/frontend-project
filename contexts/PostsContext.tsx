'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, Post } from '@/lib/api'

interface PostsContextType {
  posts: Post[]
  loading: boolean
  addPost: (post: Post) => void
  updatePost: (id: number, post: Partial<Post>) => void
  removePost: (id: number) => void
  refreshPosts: () => Promise<void>
}

const PostsContext = createContext<PostsContextType | undefined>(undefined)

const STORAGE_KEY = 'local_posts'

const getStoredPosts = (): Post[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setStoredPosts = (posts: Post[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  } catch {
    // Ignore localStorage errors
  }
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const loadPosts = async () => {
    try {
      setLoading(true)
      const apiPosts = await api.getPosts()
      const localPosts = getStoredPosts()
      
      // Merge API posts with local posts
      // Local posts (with timestamp IDs > 1000000) take precedence over API posts
      const apiPostIds = new Set(apiPosts.map(p => p.id))
      const localPostsOnly = localPosts.filter(p => p.id > 1000000) // Timestamp-based IDs are large
      
      // Combine: local posts first, then API posts (excluding any that were replaced by local versions)
      const mergedPosts = [
        ...localPostsOnly,
        ...apiPosts.filter(p => !localPostsOnly.some(lp => lp.id === p.id))
      ]
      
      setPosts(mergedPosts)
      setStoredPosts(mergedPosts) // Update storage with merged list
    } catch (error) {
      console.error('Error loading posts:', error)
      // On error, try to load from localStorage
      const localPosts = getStoredPosts()
      if (localPosts.length > 0) {
        setPosts(localPosts)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const addPost = (post: Post) => {
    setPosts((prev) => {
      const updated = [post, ...prev]
      setStoredPosts(updated)
      return updated
    })
  }

  const updatePost = (id: number, updatedPost: Partial<Post>) => {
    setPosts((prev) => {
      const updated = prev.map((post) => (post.id === id ? { ...post, ...updatedPost } : post))
      setStoredPosts(updated)
      return updated
    })
  }

  const removePost = (id: number) => {
    setPosts((prev) => {
      const updated = prev.filter((post) => post.id !== id)
      setStoredPosts(updated)
      return updated
    })
  }

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        addPost,
        updatePost,
        removePost,
        refreshPosts: loadPosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  )
}

export function usePosts() {
  const context = useContext(PostsContext)
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider')
  }
  return context
}
