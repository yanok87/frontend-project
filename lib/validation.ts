import type { Comment } from '@/lib/api'

export type CommentInput = Omit<Comment, 'id' | 'postId'>

/**
 * Validates comment payload. Returns true if valid; logs and returns false otherwise.
 * Ensures required fields and that the payload is not post-shaped data.
 */
export function validateCommentInput(
  data: unknown,
  logErrors = process.env.NODE_ENV === 'development'
): data is CommentInput {
  if (!data || typeof data !== 'object') {
    if (logErrors) console.error('Invalid comment data - not an object:', data)
    return false
  }
  const d = data as Record<string, unknown>
  if (!d.name || !d.email || !d.body) {
    if (logErrors) console.error('Invalid comment data - missing required fields (name, email, body):', d)
    return false
  }
  if ('title' in d || 'userId' in d) {
    if (logErrors) console.error('Rejected: Attempted to add post data as comment:', d)
    return false
  }
  if (typeof d.name !== 'string' || typeof d.email !== 'string' || typeof d.body !== 'string') {
    if (logErrors) console.error('Invalid comment data - wrong types:', d)
    return false
  }
  return true
}
