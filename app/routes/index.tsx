import { useLoaderData, LoaderFunction, json } from 'remix'
import { db, sql } from '~/utils/db.server'
import { getUser, UserSession } from '~/utils/session.server'
import type { PostInfo } from '~/types'
import { Post } from '~/components/PostCard'
import { Layout } from '~/components/Layout'

type LoaderData = {
  posts: readonly PostInfo[]
  user: UserSession
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  const posts = await db.any<PostInfo>(sql`select * from top_posts(${user?.userId ?? null})`)
  return json<LoaderData>({ user, posts })
}

export default function Index() {
  const { user, posts } = useLoaderData<LoaderData>()
  return (
    <Layout user={user}>
      {posts.map(p => (
        <Post key={p.postId} currentUser={user} {...p} />
      ))}
    </Layout>
  )
}
