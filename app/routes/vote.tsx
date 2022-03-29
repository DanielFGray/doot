import { ActionFunction, json, redirect } from 'remix'
import { db, sql } from '~/utils/db.server'
import { requireUserId } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const vote = form.get('vote')
  const id = form.get('id')
  const type = form.get('type')
  const userId = await requireUserId(request, id ? `/p/${id}` : '/')
  if (typeof vote !== 'string' || typeof id !== 'string' || typeof type !== 'string')
    throw json('Invalid parameters', 400)

  if (type === 'post') {
    if (vote === 'null') {
      await db.any(sql`
        delete from posts_votes
        where user_id = ${userId} and post_id = ${id}
      `)
    } else {
      await db.any(sql`
        insert into posts_votes (user_id, post_id, vote)
        values (${userId}, ${id}, ${vote})
        on conflict (user_id, post_id) do update set vote = ${vote}
      `)
    }
  } else if (type === 'comment') {
    if (vote === 'null') {
      await db.any(sql`
        delete from comments_votes
        where user_id = ${userId} and comment_id = ${id}
      `)
    } else {
      await db.any(sql`
        insert into comments_votes (user_id, comment_id, vote)
        values (${userId}, ${id}, ${vote})
        on conflict (user_id, comment_id) do update set vote = ${vote}
      `)
    }
  }
  const referer = request.headers.get('referer')
  return referer ? redirect(referer) : null
}
