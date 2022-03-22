import { useLoaderData, LoaderFunction, useFetcher, json } from 'remix'
import { useRef, useEffect } from 'react'
import { Comment } from '~/components/CommentCard'
import { Post } from '~/components/PostCard'
import { db, sql } from '~/utils/db.server'
import { getUser } from '~/utils/session.server'
import type { BoardListing, CommentInfo } from '~/types'
import { Layout } from '~/components/Layout'
import { PostInput, Button } from '~/components/Forms'

type DbRequest = BoardListing & {
  comments: CommentInfo[]
}

type LoaderData = {
  post: null | DbRequest
  user: {
    user_id: string
    username: string
  } | null
}

type CommentFetcher = {
  fieldError?: { body?: string };
  formError?: string;
  comment_id?: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request)
  try {
    const post = await db.one<DbRequest>(
      sql`select * from get_post_with_comments(
        ${params.post!},
        ${user?.user_id ?? null}
      )`,
    )
    return json<LoaderData>({ user, post })
  } catch (e) {
    return json<LoaderData>({ user, post: null })
  }
}

export default function Index() {
  const { user, post } = useLoaderData<LoaderData>()
  const commentFetcher = useFetcher<CommentFetcher>()
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (commentFetcher.data?.comment_id) {
      console.log('created comment', commentFetcher.data?.comment_id)
      formRef.current?.reset()
    }
  }, [commentFetcher])

  return (
    <Layout user={user}>
      {!post ? (
        <div>post not found</div>
      ) : (
        <>
          <Post {...post} currentUser={user} />
          <div className="mt-4 flex flex-col gap-4">
            {post.comments?.map(c => (
              <Comment key={c.comment_id} {...c} currentUser={user} />
            ))}
          </div>
          {user && (
            <commentFetcher.Form
              ref={formRef}
              method="post"
              action="/create-comment"
              className="mx-2 mt-4"
            >
              <PostInput name="body" placeholder="say something nice!" />
              <div className="mt-2 flex justify-between">
                <div
                  className={
                    commentFetcher.data?.formError || commentFetcher.data?.fieldError
                      ? 'text-red-500'
                      : ''
                  }
                >
                  {commentFetcher.data?.formError
                    ? commentFetcher.data?.formError
                    : commentFetcher.data?.fieldError?.body
                      ? commentFetcher.data.fieldError.body
                      : null}
                </div>
                <Button type="submit" primary className="">
                  Post
                </Button>
              </div>
              <input type="hidden" name="post_id" value={post.post_id} />
            </commentFetcher.Form>
          )}
        </>
      )}
    </Layout>
  )
}
