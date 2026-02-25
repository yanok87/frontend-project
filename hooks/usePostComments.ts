import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { api, Comment } from '@/lib/api'
import { useComments } from '@/contexts/CommentsContext'
import { COMMENTS_CACHE_MS } from '@/lib/constants'

interface UsePostCommentsReturn {
  comments: Comment[]
  loading: boolean
  error: string | null
  openComments: () => void
  closeComments: () => void
  isOpen: boolean
}

/** API comments are fetched on mount (for correct count) and when the panel is opened; merged with local comments from CommentsContext. */
export function usePostComments(postId: number): UsePostCommentsReturn {
  const { getCommentsForPost } = useComments()
  const [apiComments, setApiComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cacheRef = useRef<{ data: Comment[]; timestamp: number } | null>(null)

  const localComments = getCommentsForPost(postId)

  const comments = useMemo(() => {
    const merged = [...apiComments, ...localComments]
    return [...merged].sort((a, b) => b.id - a.id)
  }, [apiComments, localComments])

  const fetchComments = useCallback(
    async (useCache = true) => {
      if (useCache && cacheRef.current) {
        const cacheAge = Date.now() - cacheRef.current.timestamp
        if (cacheAge < COMMENTS_CACHE_MS) {
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
        cacheRef.current = { data, timestamp: Date.now() }
      } catch (err) {
        setError('Failed to load comments')
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading comments:', err)
        }
      } finally {
        setLoading(false)
      }
    },
    [postId]
  )

  const openComments = useCallback(() => {
    setIsOpen(true)
    fetchComments(true)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      fetchComments(false)
    }, COMMENTS_CACHE_MS)
  }, [fetchComments])

  const closeComments = useCallback(() => {
    setIsOpen(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Fetch on mount so the comment count is correct before the user opens the panel
  useEffect(() => {
    fetchComments(true)
  }, [fetchComments])

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
