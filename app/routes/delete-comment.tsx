import { db, sql } from '~/utils/db.server'
import { ActionFunction, redirect } from 'remix'

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData()
  const id = data.get('id')
  await db.query(sql`
    delete from posts_comments
    where comment_id = ${id}
  `)
  return null
}
