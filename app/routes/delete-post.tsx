import { db, sql } from '~/utils/db.server'
import { getUser } from '~/utils/session.server'
import { json, ActionFunction, redirect } from 'remix'

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request)
  if (!user) return json({ error: 'Not logged in' }, 401)
  const data = await request.formData()
  const id = data.get('id')
  await db.query(sql`
    delete from posts
    where post_id = ${id} and user_id = ${user.userId}
  `)
  return redirect('/')
}
