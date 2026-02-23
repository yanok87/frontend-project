'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from '@mui/icons-material'
import ProtectedRoute from '@/components/ProtectedRoute'
import { usePosts } from '@/contexts/PostsContext'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

export default function CreatePostPage() {
  return (
    <ProtectedRoute>
      <CreatePostContent />
    </ProtectedRoute>
  )
}

function CreatePostContent() {
  const router = useRouter()
  const { addPost } = usePosts()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const userId = user?.id ? parseInt(user.id) : 1
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    setSaving(true)
    setError('')

    try {
      const newPost = await api.createPost({
        title,
        body,
        userId,
      })
      console.log('Created post:', newPost) // Debug log
      // JSONPlaceholder always returns id: 101 for new posts
      // Generate a unique ID to avoid ID collisions with other new posts
      const uniquePost = {
        ...newPost,
        id: Date.now(), // Use timestamp as unique ID for locally created posts
      }
      // Add the new post to the context so it appears in the list
      addPost(uniquePost)
      router.push('/posts')
    } catch (err) {
      setError('Failed to create post. Please try again.')
      console.error('Error creating post:', err)
    } finally {
      setSaving(false)
    }
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
          Create New Post
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
              startIcon={<AddIcon />}
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Post'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
