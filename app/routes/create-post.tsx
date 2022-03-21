import { ActionFunction, redirect, json } from 'remix'
import { db, sql } from '~/utils/db.server'
import { getUser } from '~/utils/session.server'

const badRequest = (data: { formError: string } | { message: string }) =>
  json(data, { status: 400 })

function validateTitle(title: string) {
  if (title.length < 1) {
    return 'Title must not not empty'
  }
  if (title.length > 140) {
    return 'Title must be less than 100 characters long'
  }
  return null
}

function validateBody(body: string) {
  if (body.length < 1) {
    return 'Body must not not empty'
  }
  if (body.length > 140) {
    return 'Body must be less than 100 characters long'
  }
  return null
}

function validateTags(tags: string[]) {
  if (tags.length > 5 || tags.length < 1) {
    return 'Must have between 1 and 5 tags'
  }
  if (tags.some(tag => tag.length > 64)) {
    return 'Tags must be less than 64 characters long'
  }
  return null
}

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request)

  if (!user)
    throw badRequest({
      message: 'You must be logged in to create a new post',
    })
  const { user_id } = user
  const form = await request.formData()
  const tags = form.get('tags')
  const title = form.get('title')
  const body = form.get('body')
  if (typeof tags !== 'string' || typeof title !== 'string' || typeof body !== 'string') {
    return badRequest({
      formError: 'Form not submitted correctly.',
    })
  }

  const tagList = tags.split(/,\s*/).filter(Boolean)

  const fields = { title, tags, body }
  const fieldErrors = {
    title: validateTitle(title),
    body: validateBody(body),
    tags: validateTags(tagList),
  }
  const hasError = Object.values(fieldErrors).some(Boolean)
  if (hasError) return json({ fieldErrors, fields })

  try {
    const post = await db.maybeOne<{ post_id: string }>(sql`
      select * from create_post(
        ${title},
        ${body},
        ${sql.array(tagList, sql`tag[]`)},
        ${user_id}
      ) as post_id
    `)
    if (!post) throw badRequest({ formError: 'Something went wrong.' })
    return redirect(`/p/${post.post_id}`)
  } catch (e) {
    console.log(e)
    return badRequest({ formError: 'Something went wrong.' })
  }
}
