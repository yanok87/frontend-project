'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Pagination,
  Skeleton,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import PostComments from '@/components/PostComments'
import { usePosts } from '@/contexts/PostsContext'
import { useAuth } from '@/contexts/AuthContext'
import { useUsers } from '@/contexts/UsersContext'
import { api, Post } from '@/lib/api'
import { POSTS_PER_PAGE } from '@/lib/constants'

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
  const { userNamesByUserId } = useUsers()
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const getAuthorName = (post: Post): string => {
    if (user && post.userId === parseInt(user.id)) {
      return user.name
    }
    return userNamesByUserId[post.userId] ?? `User ${post.userId}`
  }

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
      } catch {
        // Locally created posts don't exist in API; still remove from state
      }
      removePost(id)
    } catch (err) {
      setError('Failed to delete post. Please try again.')
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting post:', err)
      }
    }
  }

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts
    }
    const query = searchQuery.toLowerCase()
    return posts.filter((post) => post.title.toLowerCase().includes(query))
  }, [posts, searchQuery])

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE) || 1
  const paginatedPosts = useMemo(() => {
    const start = (page - 1) * POSTS_PER_PAGE
    return filteredPosts.slice(start, start + POSTS_PER_PAGE)
  }, [filteredPosts, page])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={220} height={40} />
          <Skeleton variant="rounded" width={140} height={36} />
        </Box>
        <Paper sx={{ mb: 2, p: 2 }}>
          <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Skeleton variant="rounded" width={120} height={24} />
            <Skeleton variant="text" width={180} height={24} />
          </Box>
        </Paper>
        <Paper>
          <Box>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} sx={{ m: 1 }}>
                <CardContent sx={{ pb: 1 }}>
                  <Skeleton variant="text" width="90%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" width={80} height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" width={100} height={28} />
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 1, pt: 0, pb: 1, px: 2 }}>
                  <Skeleton variant="rounded" width={70} height={32} />
                  <Skeleton variant="rounded" width={70} height={32} />
                </CardActions>
              </Card>
            ))}
          </Box>
        </Paper>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''} total`}
            color="primary"
            variant="outlined"
          />
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages} (100 per page)
          </Typography>
        </Box>
      </Paper>

      <Paper>
        <Box>
          {paginatedPosts.length > 0 ? (
            paginatedPosts.map((post) => (
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
                    <Chip
                      label={getAuthorName(post)}
                      size="small"
                      variant="outlined"
                    />
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
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value: number) => setPage(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
    </Container>
  )
}
