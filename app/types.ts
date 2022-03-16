export type BoardListing = {
  post_id: string
  title: string
  body?: string
  username: string
  tags: string[]
  score: number
  comment_count: number
  created_at: string
  updated_at: string
  current_user_voted: null | 'up' | 'down'
}

export type CommentInfo = {
  body: string
  score: number
  user_id: string
  username: string
  comment_id: string
  current_user_voted: null | 'up' | 'down'
  created_at: string
  updated_at: string
}
