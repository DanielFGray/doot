import { useLoaderData, LoaderFunction, json, useParams } from 'remix'
import { db, sql } from '~/utils/db.server'
import { getUser, UserSession } from '~/utils/session.server'
import { Layout } from '~/components/Layout'
import { Post } from '~/components/PostCard'
import { PostInfo } from '~/types'

type LoaderData = {
  user: UserSession
  posts?: readonly PostInfo[]
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request)
  try {
    const posts = await db.any<PostInfo>(
      sql`
        select *
        from
          users_posts(${params.username}::text, ${user?.userId ?? null}::uuid)
        order by
          "createdAt" desc
      `,
    )
    return json<LoaderData>({ user, posts })
  } catch (e) {
    console.error(e)
    return json<LoaderData>({ user }, 500)
  }
}

export default function Index() {
  const { user, posts } = useLoaderData<LoaderData>()
  const { username } = useParams()
  return (
    <Layout user={user}>
      {!posts?.length ? (
        <div>no posts by {username}</div>
      ) : (
        <>
          <h1 className="pb-8 text-xl font-bold">posts by {username}</h1>
          {posts.map(post => (
            <Post key={post.postId} currentUser={user} {...post} />
          ))}
        </>
      )}
    </Layout>
  )
}
