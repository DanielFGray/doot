import { db, sql } from '~/utils/db.server'
import { requireUserId } from '~/utils/session.server'
import { ActionFunction, json } from 'remix'

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData()
  const userId = await requireUserId(request)
  const id = data.get('id')
  if (typeof id !== 'string')
    return json({ error: 'id is not a string' })
  try {
    await db.query(sql`
      delete from posts_comments
      where comment_id = ${id} and user_id = ${userId}
    `)
    return json({ deleted: true })
  } catch (e) {
    if (e?.originalError?.constraint === 'posts_comments_parent_id_fkey') {
      await db.query(sql`
        update posts_comments
        set (body, user_id) = ('[deleted]', null)
        where comment_id = ${id} and user_id = ${userId}
      `)
      return json({ deleted: true })
    }
    console.error('error', e)
    throw new Error(e)
  }
}
