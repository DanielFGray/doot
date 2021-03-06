import { Link, useLoaderData, LoaderFunction, json } from 'remix'
import { Post } from '~/components/PostCard'
import { db, sql } from '~/utils/db.server'
import { getUser } from '~/utils/session.server'
import type { BoardListing } from '~/types'
import { Layout } from '~/components/Layout'

type LoaderData = {
  posts: readonly BoardListing[]
  user: {
    userId: string
    username: string
  } | null
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request)
  const tags = params.tag!.split('+')
  try {
    const posts = await db.any<BoardListing>(sql`
       select *
       from
         tag_listing(${sql.array(tags, sql`citext[]`)}, ${user?.userId ?? null})
       order by
         popularity desc
    `)
    return json<LoaderData>({ user, posts })
  } catch (e) {
    return json<LoaderData>({ user: null, posts: [] })
  }
}

export default function Index() {
  const { user, posts } = useLoaderData<LoaderData>()
  return (
    <Layout user={user}>
      {posts?.length ? (
        <>
          {posts.map(p => (
            <Link key={p.postId} to={`/p/${p.postId}`}>
              <Post currentUser={user} {...p} />
            </Link>
          ))}
        </>
      ) : (
        'no tags found'
      )}
    </Layout>
  )
}
