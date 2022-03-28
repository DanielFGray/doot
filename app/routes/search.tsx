import { ActionFunction, json, useActionData, useLoaderData } from 'remix'
import { Layout } from '~/components/Layout'
import { getUser } from '~/utils/session.server'
import { db, sql } from '~/utils/db.server'
import { Post } from '~/components/PostCard'
import type { SearchInfo } from '~/types'

export const loader = async ({ request }) => {
  const user = await getUser(request)
  return { user }
}

export default function Search() {
  const { user } = useLoaderData()
  const data = useActionData<{ q: string; results: SearchInfo[] }>()
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
              return <Post key={p.postId} currentUser={user} {...p} />
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
  const results = await db.any<SearchInfo>(sql`
    select * 
    from search_posts(${q}, ${user?.userId ?? null})
    order by rank
  `)
  return { results, q }
}
