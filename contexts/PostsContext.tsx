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

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await api.getPosts()
      setPosts(data)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const addPost = (post: Post) => {
    // Add new post at the beginning of the list
    setPosts((prev) => [post, ...prev])
  }

  const updatePost = (id: number, updatedPost: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, ...updatedPost } : post))
    )
  }

  const removePost = (id: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== id))
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
