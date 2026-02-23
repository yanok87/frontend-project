'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Avatar,
  TextField,
} from '@mui/material'
import { Comment as CommentIcon, Close as CloseIcon, Send as SendIcon } from '@mui/icons-material'
import { usePostComments } from '@/hooks/usePostComments'
import { useComments } from '@/contexts/CommentsContext'
import { useAuth } from '@/contexts/AuthContext'

interface PostCommentsProps {
  postId: number
}

export default function PostComments({ postId }: PostCommentsProps) {
  const { comments, loading, error, openComments, closeComments, isOpen } = usePostComments(postId)
  const { addComment } = useComments()
  const { user } = useAuth()
  const [commentName, setCommentName] = useState(user?.name || '')
  const [commentEmail, setCommentEmail] = useState(user?.email || '')
  const [commentBody, setCommentBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    if (!commentBody.trim()) return

    // Validate that we have proper comment data
    if (!commentName || !commentEmail) {
      console.error('Cannot create comment: missing name or email')
      return
    }

    setSubmitting(true)
    try {
      console.log('Submitting comment for postId:', postId, 'body:', commentBody.substring(0, 50))
      addComment(postId, {
        name: commentName,
        email: commentEmail,
        body: commentBody,
      })
      setCommentBody('')
    } catch (err) {
      console.error('Error adding comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) {
    const buttonText = comments.length === 0 
      ? 'Comment' 
      : `Show Comments (${comments.length})`
    
    return (
      <Button
        size="small"
        startIcon={<CommentIcon />}
        onClick={openComments}
        variant="text"
        sx={{ mt: 1 }}
      >
        {buttonText}
      </Button>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Comments ({comments.length})
        </Typography>
        <Button
          size="small"
          startIcon={<CloseIcon />}
          onClick={closeComments}
          variant="text"
        >
          Hide Comments
        </Button>
      </Box>

      {loading && comments.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {comments.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
          {comments.map((comment, index) => (
            <Box key={comment.id}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {comment.email.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" fontWeight="bold">
                    {comment.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {comment.email}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {comment.body}
                  </Typography>
                </Box>
              </Box>
              {index < comments.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>
      )}

      {!loading && comments.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No comments yet
        </Typography>
      )}

      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Add a Comment
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            size="small"
            label="Name"
            value={commentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentName(e.target.value)}
            margin="dense"
            required
          />
          <TextField
            fullWidth
            size="small"
            label="Email"
            type="email"
            value={commentEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentEmail(e.target.value)}
            margin="dense"
            required
          />
          <TextField
            fullWidth
            size="small"
            label="Comment"
            value={commentBody}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentBody(e.target.value)}
            margin="dense"
            required
            multiline
            rows={3}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            startIcon={<SendIcon />}
            disabled={submitting || !commentBody.trim()}
            sx={{ mt: 1 }}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
