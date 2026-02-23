'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { api, Post } from '@/lib/api'
import { FixedSizeList as List } from 'react-window'

const ITEM_HEIGHT = 120 // Height of each card in pixels

export default function PostsPage() {
  return (
    <ProtectedRoute>
      <PostsContent />
    </ProtectedRoute>
  )
}

function PostsContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.getPosts()
      setPosts(data)
    } catch (err) {
      setError('Failed to load posts. Please try again.')
      console.error('Error loading posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await api.deletePost(id)
      setPosts(posts.filter((post) => post.id !== id))
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

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const post = filteredPosts[index]
    if (!post) return null

    return (
      <div style={style}>
        <Card
          sx={{
            m: 1,
            '&:hover': {
              boxShadow: 4,
            },
            cursor: 'pointer',
          }}
          onClick={() => router.push(`/posts/${post.id}`)}
        >
          <CardContent>
            <Typography variant="h6" component="div" noWrap>
              {post.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
              {post.body}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label={`ID: ${post.id}`} size="small" />
              <Chip label={`User: ${post.userId}`} size="small" variant="outlined" />
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/posts/${post.id}`)
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(post.id)
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      </div>
    )
  }

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
        <Box sx={{ height: Math.min(filteredPosts.length * ITEM_HEIGHT, 600), width: '100%' }}>
          {filteredPosts.length > 0 ? (
            <List
              height={Math.min(filteredPosts.length * ITEM_HEIGHT, 600)}
              itemCount={filteredPosts.length}
              itemSize={ITEM_HEIGHT}
              width="100%"
            >
              {Row}
            </List>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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
