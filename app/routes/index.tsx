import { Link, useLoaderData, LoaderFunction, json } from 'remix'
import { db, sql } from '~/utils/db.server'
import { getUser } from '~/utils/session.server'
import type { BoardListing } from '~/types'
import { Post } from '~/components/PostCard'
import { Layout } from '~/components/Layout'

type LoaderData = {
  posts: readonly BoardListing[];
  user: {
    user_id: string;
    username: string;
  } | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  const posts = await db.any<BoardListing>(sql`select * from top_posts(${user?.user_id ?? null})`)
  return json<LoaderData>({ user, posts })
}

export default function Index() {
  const { user, posts } = useLoaderData<LoaderData>()
  return (
    <Layout user={user}>
      {posts.map(p => (
        <Post key={p.post_id} currentUser={user} {...p} />
      ))}
    </Layout>
  )
}
