import { useState, useEffect, useRef, useCallback } from 'react'
import { api, Comment } from '@/lib/api'
import { useComments } from '@/contexts/CommentsContext'

interface UsePostCommentsReturn {
  comments: Comment[]
  loading: boolean
  error: string | null
  openComments: () => void
  closeComments: () => void
  isOpen: boolean
}

export function usePostComments(postId: number): UsePostCommentsReturn {
  const { getCommentsForPost, comments: allLocalComments } = useComments()
  const [apiComments, setApiComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cacheRef = useRef<{ data: Comment[]; timestamp: number } | null>(null)

  // Merge API comments with local comments
  // Newer comments appear first (sorted by ID descending)
  const localComments = getCommentsForPost(postId)
  const allComments = [...apiComments, ...localComments]
  const comments = allComments.sort((a, b) => b.id - a.id) // Descending order - newest first

  const CACHE_DURATION = 30000 // 30 seconds
  const REFETCH_INTERVAL = 30000 // 30 seconds

  const fetchComments = useCallback(async (useCache = true) => {
    // Check cache first if enabled
    if (useCache && cacheRef.current) {
      const cacheAge = Date.now() - cacheRef.current.timestamp
      if (cacheAge < CACHE_DURATION) {
        setApiComments(cacheRef.current.data)
        setLoading(false)
        return
      }
    }

    try {
      setLoading(true)
      setError(null)
      const data = await api.getPostComments(postId)
      setApiComments(data)
      // Update cache
      cacheRef.current = {
        data,
        timestamp: Date.now(),
      }
    } catch (err) {
      setError('Failed to load comments')
      console.error('Error loading comments:', err)
    } finally {
      setLoading(false)
    }
  }, [postId])

  const openComments = () => {
    setIsOpen(true)
    fetchComments(true) // Use cache if available

    // Set up auto-refetch interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      fetchComments(false) // Force refetch, bypass cache
    }, REFETCH_INTERVAL)
  }

  const closeComments = () => {
    setIsOpen(false)
    // Clear interval when comments are closed
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Load comments on mount to show count
  useEffect(() => {
    fetchComments(true) // Load comments initially to show count
  }, [postId, fetchComments])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    comments,
    loading,
    error,
    openComments,
    closeComments,
    isOpen,
  }
}
