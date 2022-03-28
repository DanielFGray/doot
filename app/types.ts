export interface BaseInfo {
  username: string
  body?: string
  score: number
  currentUserVoted: null | 'up' | 'down'
  popularity: number
  commentCount: number
  createdAt: number
}

export interface PostInfo extends BaseInfo {
  postId: string
  title: string
  tags: string[]
  updatedAt: number
}

export interface CommentInfo extends BaseInfo {
  commentId: string
  body: string
  postId: string
  updatedAt: number
  children: CommentInfo[]
}

export interface SearchInfo extends PostInfo {
  rank: number
}
