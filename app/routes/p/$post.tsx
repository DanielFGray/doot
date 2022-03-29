import { useLoaderData, LoaderFunction, json } from 'remix'
import { useState } from 'react'
import { Comment } from '~/components/CommentCard'
import { Post } from '~/components/PostCard'
import { db, sql } from '~/utils/db.server'
import { getUser } from '~/utils/session.server'
import type { PostInfo, CommentInfo } from '~/types'
import { Layout } from '~/components/Layout'
import { SelectMenu } from '~/components/Forms'
import { Modal } from '~/components/Modal'

type DbRequest = PostInfo & {
  comments: CommentInfo[]
}

type LoaderData = {
  post: null | DbRequest
  user: {
    userId: string
    username: string
  } | null
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request)
  try {
    const post = await db.one<DbRequest>(
      sql`select * from get_post_with_comments(
        ${params.post},
        ${user?.userId ?? null}
      )`,
    )
    return json<LoaderData>({ user, post })
  } catch (e) {
    return json<LoaderData>({ user, post: null }, 404)
  }
}

const SortNames = {
  popularity: 'Popularity',
  score: 'Score',
  createdAt: 'Newest',
}
const sortItems = Object.entries(SortNames).map(([value, label]) => ({ label, value })) as Array<{
  label: string
  value: keyof typeof SortNames
}>

export default function PostPage() {
  const [commentSort, setCommentSort] = useState<keyof typeof SortNames>('popularity')
  const { user, post } = useLoaderData<LoaderData>()
  return (
    <Layout user={user}>
      {!post ? (
        <div>post not found</div>
      ) : (
        <>
          <Post {...post} currentUser={user} />
          {post.comments.length < 1 ? null : (
            <>
              <div>
                <span>sort comments</span>
                <SelectMenu
                  items={sortItems}
                  selected={commentSort}
                  setSelected={sort => setCommentSort(sort)}
                />
              </div>
              <div className="flex flex-col gap-4">
                {post.comments
                  .slice(0)
                  .sort((a, b) => b[commentSort] - a[commentSort])
                  .map(c => (
                    <Comment key={c.commentId} {...c} currentUser={user} sortedBy={commentSort} />
                  ))}
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  )
}
