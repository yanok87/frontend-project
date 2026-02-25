/** localStorage key for the current auth user */
export const AUTH_STORAGE_KEY = 'auth_user'

/** localStorage key for merged posts (API + local) */
export const POSTS_STORAGE_KEY = 'local_posts'

/** localStorage key for comments by postId */
export const COMMENTS_STORAGE_KEY = 'local_comments'

/** Local posts use timestamp IDs; IDs above this are treated as local in merge logic */
export const LOCAL_POST_ID_MIN = 1_000_000

/** How long to cache API comments before refetch (ms) */
export const COMMENTS_CACHE_MS = 30_000

/** Number of posts per page in the list */
export const POSTS_PER_PAGE = 100
