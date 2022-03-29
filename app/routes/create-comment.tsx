import { json, ActionFunction } from 'remix'
import { requireUserId } from '~/utils/session.server'
import { db, sql } from '~/utils/db.server'

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const body = formData.get('body')
  const postId = formData.get('postId')
  const parentId = formData.get('parentId')

  if (typeof body !== 'string' || typeof postId !== 'string') {
    return json({ formError: 'invalid body type' }, { status: 400 })
  }

  if (parentId !== null && typeof parentId !== 'string') {
    return json({ formError: 'invalid parent id' }, { status: 400 })
  }

  if (body.length < 1) {
    return json({ fieldError: { body: 'please enter a comment' } }, { status: 400 })
  }

  const comment_id = await db.one<{ comment_id: string }>(sql`
    select * from create_comment(${postId}, ${body}, ${userId}, ${parentId}) as comment_id
  `)
  return json(comment_id)
}

