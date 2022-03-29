import { ActionFunction, json } from 'remix'
import { db, sql } from '~/utils/db.server'
import { requireUserId } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const form = await request.formData()
  const id = form.get('id')
  const body = form.get('body')

  if (typeof id !== 'string' || typeof body !== 'string') {
    return json({ body: 'Invalid request' }, 400)
  }

  try {
    const result = await db.one(sql`
      update posts_comments
      set body = ${body}
      where user_id = ${userId} and comment_id = ${id}
      returning *
    `)
    return result
  } catch (e) {
    console.error(e)
    return json({ body: 'Internal server error' }, 500)
  }
}
