import { db, sql } from '~/utils/db.server'
import { requireUserId } from '~/utils/session.server'
import { ActionFunction, redirect } from 'remix'

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const data = await request.formData()
  const id = data.get('id')
  if (typeof id !== 'string') {
    return redirect('/')
  }
  await db.any(sql`
    delete from posts
    where post_id = ${id} and user_id = ${userId}
  `)
  return redirect('/')
}
