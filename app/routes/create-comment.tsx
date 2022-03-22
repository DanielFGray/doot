import { json, ActionFunction } from 'remix'
import { getUser } from '~/utils/session.server'
import { db, sql } from '~/utils/db.server'

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request)

  if (!user) throw json({ message: 'you must be logged in to do that' }, { status: 401 })

  const formData = await request.formData()
  const body = formData.get('body')
  const post_id = formData.get('post_id')

  if (typeof body !== 'string' || typeof post_id !== 'string') {
    return json({ formError: 'invalid body type' }, { status: 400 })
  }

  if (body.length < 1) {
    return json({ fieldError: { body: 'please enter a comment' } }, { status: 400 })
  }

  const comment_id = await db.one<{ comment_id: string }>(sql`
    select create_comment(${post_id}, ${body}, ${user.user_id}) as comment_id
  `)
  return json(comment_id)
}

