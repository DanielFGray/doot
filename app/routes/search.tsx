import { ActionFunction, json, useActionData, useLoaderData } from 'remix'
import { Layout } from '~/components/Layout'
import { getUser } from '~/utils/session.server'
import { db, sql } from '~/utils/db.server'
import { Post } from '~/components/PostCard'

type Result = {
  post_id: string
  title: string
  body: string
  username: string
  tags: string[]
  score: number
  comment_count: number
  created_at: string
  updated_at: string
  rank: number
  popularity: number
  current_user_voted: null | 'up' | 'down'
}
export const loader = async ({ request }) => {
  const user = await getUser(request)
  return { user }
}

export default function Search() {
  const { user } = useLoaderData()
  const data = useActionData<{ q: string; results: Result[] }>()
  return (
    <Layout user={user}>
      {!data?.q ? (
        <div>Search for something</div>
      ) : (
        <>
          <h1>
            search results for <b>{data?.q}</b>
          </h1>
          {data?.results.length === 0 ? (
            <div>no results found</div>
          ) : (
            data?.results.map(p => {
              return <Post key={p.post_id} currentUser={user} {...p} />
            })
          )}
        </>
      )}
    </Layout>
  )
}

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request)
  const data = await request.formData()
  const q = data.get('q')
  if (typeof q !== 'string') {
    throw json({
      status: 400,
      body: 'Bad Request',
    })
  }
  const results = await db.any<Result>(sql`
    select * 
    from search_posts(${q}, ${user?.user_id ?? null})
    order by rank
  `)
  return { results, q }
}
