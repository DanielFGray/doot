export type BoardListing = {
  post_id: string
  title: string
  body?: string
  username: string
  board_id: string
  score: number
  comment_count: number
  created_at: string
  popularity: number
  current_user_voted: null | 'up' | 'down'
};

export type BoardInfo = {
  board_id: string
  created_at: Date
  description: string
};

export type CommentInfo = {
  body: string
  score: number
  user_id: string
  username: string
  comment_id: string
  current_user_voted: null | 'up' | 'down'
  created_at: string
}
