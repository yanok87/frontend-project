// API client for JSONPlaceholder

const BASE_URL = 'https://jsonplaceholder.typicode.com'

export interface Post {
  userId: number
  id: number
  title: string
  body: string
}

export interface Comment {
  postId: number
  id: number
  name: string
  email: string
  body: string
}

export interface Photo {
  albumId: number
  id: number
  title: string
  url: string
  thumbnailUrl: string
}

export const api = {
  // Posts
  getPosts: async (): Promise<Post[]> => {
    const response = await fetch(`${BASE_URL}/posts`)
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    return response.json()
  },

  getPost: async (id: number): Promise<Post> => {
    const response = await fetch(`${BASE_URL}/posts/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch post')
    }
    return response.json()
  },

  createPost: async (post: Omit<Post, 'id'>): Promise<Post> => {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    })
    if (!response.ok) {
      throw new Error('Failed to create post')
    }
    return response.json()
  },

  updatePost: async (id: number, post: Partial<Post>): Promise<Post> => {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    })
    if (!response.ok) {
      throw new Error('Failed to update post')
    }
    return response.json()
  },

  deletePost: async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'DELETE',
    })
    // JSONPlaceholder returns 200 even for non-existent posts
    // Only throw error for actual network/server errors
    if (!response.ok && response.status >= 500) {
      throw new Error('Failed to delete post')
    }
    // For 200-299 status codes, consider it successful
    // For 404, also consider it successful (post might not exist in API but that's ok)
  },

  // Comments
  getPostComments: async (postId: number): Promise<Comment[]> => {
    const response = await fetch(`${BASE_URL}/posts/${postId}/comments`)
    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }
    return response.json()
  },

  // Photos
  getPhotos: async (): Promise<Photo[]> => {
    const response = await fetch(`${BASE_URL}/photos`)
    if (!response.ok) {
      throw new Error('Failed to fetch photos')
    }
    return response.json()
  },
}
