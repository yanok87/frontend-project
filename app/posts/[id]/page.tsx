'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material'
import ProtectedRoute from '@/components/ProtectedRoute'
import { usePosts } from '@/contexts/PostsContext'
import { useAuth } from '@/contexts/AuthContext'
import { api, Post } from '@/lib/api'

export default function EditPostPage() {
  return (
    <ProtectedRoute>
      <EditPostContent />
    </ProtectedRoute>
  )
}

function EditPostContent() {
  const params = useParams()
  const router = useRouter()
  const { posts, updatePost } = usePosts()
  const { user } = useAuth()
  const postId = parseInt(params.id as string)

  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [unauthorized, setUnauthorized] = useState(false)

  // Check if current user owns the post
  const canEdit = useCallback((post: Post | null) => {
    if (!post || !user) return false
    const currentUserId = parseInt(user.id)
    return post.userId === currentUserId
  }, [user])

  const loadPost = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      // First, try to find the post in the context (for locally created posts)
      const postFromContext = posts.find((p) => p.id === postId)
      
      if (postFromContext) {
        if (!canEdit(postFromContext)) {
          setUnauthorized(true)
          setLoading(false)
          return
        }
        setPost(postFromContext)
        setTitle(postFromContext.title)
        setBody(postFromContext.body)
        setLoading(false)
        return
      }

      // If not found in context, try to fetch from API (for original API posts)
      const data = await api.getPost(postId)
      if (!canEdit(data)) {
        setUnauthorized(true)
        setLoading(false)
        return
      }
      setPost(data)
      setTitle(data.title)
      setBody(data.body)
    } catch (err) {
      setError('Failed to load post. Please try again.')
      console.error('Error loading post:', err)
    } finally {
      setLoading(false)
    }
  }, [postId, posts, canEdit])

  useEffect(() => {
    if (postId) {
      loadPost()
    }
  }, [postId, loadPost])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const currentUserId = user?.id ? parseInt(user.id) : 1
      await api.updatePost(postId, {
        title,
        body,
        userId: currentUserId,
      })
      // Update the post in the context so it reflects in the list
      updatePost(postId, { title, body, userId: currentUserId })
      router.push('/posts')
    } catch (err) {
      setError('Failed to update post. Please try again.')
      console.error('Error updating post:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (unauthorized) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          You can only edit posts that you created.
        </Alert>
        <Button variant="outlined" onClick={() => router.push('/posts')}>
          Back to Posts
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/posts')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Edit Post
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            margin="normal"
            required
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Body"
            value={body}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBody(e.target.value)}
            margin="normal"
            required
            multiline
            rows={6}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/posts')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
