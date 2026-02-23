'use client'

import { useState, useMemo } from 'react'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import PostComments from '@/components/PostComments'
import { usePosts } from '@/contexts/PostsContext'
import { useAuth } from '@/contexts/AuthContext'
import { api, Post } from '@/lib/api'

export default function PostsPage() {
  return (
    <ProtectedRoute>
      <PostsContent />
    </ProtectedRoute>
  )
}

function PostsContent() {
  const { posts, loading, removePost } = usePosts()
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Check if current user created the post
  const canEditPost = (post: Post) => {
    // For locally created posts, check if userId matches
    // For API posts, we'll use userId 1 as default (since mock auth uses id: '1')
    const currentUserId = user?.id ? parseInt(user.id) : null
    return currentUserId !== null && post.userId === currentUserId
  }


  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      // Try to delete from API (for original posts)
      // If it fails, we'll still remove it locally since JSONPlaceholder doesn't persist anyway
      try {
        await api.deletePost(id)
      } catch (apiError) {
        // If it's a locally created post (doesn't exist in API), that's fine
        // We'll still remove it from the local state
        console.log('Post not found in API (likely locally created), removing from local state')
      }
      // Remove from context regardless of API call result
      removePost(id)
    } catch (err) {
      setError('Failed to delete post. Please try again.')
      console.error('Error deleting post:', err)
    }
  }

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts
    }
    const query = searchQuery.toLowerCase()
    return posts.filter((post) => post.title.toLowerCase().includes(query))
  }, [posts, searchQuery])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Posts Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/posts/new')}
        >
          Create Post
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search posts by title..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />
        <Chip
          label={`Showing ${filteredPosts.length} of ${posts.length} posts`}
          color="primary"
          variant="outlined"
        />
      </Paper>

      <Paper>
        <Box>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Card
                key={post.id}
                sx={{
                  m: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography variant="h6" component="div" noWrap sx={{ mb: 1 }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
                    {post.body}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip label={`ID: ${post.id}`} size="small" />
                    <Chip label={`User: ${post.userId}`} size="small" variant="outlined" />
                  </Box>
                  <PostComments postId={post.id} />
                </CardContent>
                {canEditPost(post) && (
                  <CardActions sx={{ justifyContent: 'flex-end', gap: 1, pt: 0, pb: 1, px: 2 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => router.push(`/posts/${post.id}`)}
                      variant="outlined"
                      color="primary"
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(post.id)}
                      variant="outlined"
                      color="error"
                    >
                      Delete
                    </Button>
                  </CardActions>
                )}
              </Card>
            ))
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No posts found
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  )
}
