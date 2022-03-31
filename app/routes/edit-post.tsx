import { useState } from 'react'
import {
  Form,
  useLoaderData,
  useActionData,
  ActionFunction,
  LoaderFunction,
  redirect,
  json,
} from 'remix'
import { CreatePostForm } from '~/components/CreatePost'
import { Button } from '~/components/Forms'
import { Layout } from '~/components/Layout'
import { db, sql } from '~/utils/db.server'
import { getUser, UserSession } from '~/utils/session.server'
import { requireUserId } from '~/utils/session.server'
import { normalizeTags, validator } from './create-post'

type LoaderData = {
  user: UserSession
  post?: null | { postId: string; title: string; body: string; tags: string }
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  if (!user) {
    return redirect('/login?redirectTo=/')
  }
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (id) {
    try {
      const post = await db.maybeOne<LoaderData['post']>(sql`
        select
          post_id,
          title,
          body,
          to_json(tags) as tags
        from posts
        where post_id = ${id} and user_id = ${user.userId}
      `)
      return json<LoaderData>({ user, post })
    } catch (e) {
      return json<LoaderData>({ user })
    }
  }
}

export default function CreatePostPage() {
  const { user, post } = useLoaderData<LoaderData>()
  const actionData = useActionData()
  const [stateErrors, setFieldErrors] = useState(actionData)
  const fieldErrors = { ...(actionData?.fieldErrors ?? {}), ...stateErrors }
  return (
    <Layout user={user}>
      <Form
        method="post"
        className="mx-auto flex h-full max-w-7xl flex-col divide-y divide-gray-200 divide-gray-200 px-4 dark:divide-gray-700 sm:px-6"
        onSubmit={ev => {
          const form = Object.fromEntries(new FormData(ev.currentTarget).entries())
          const title = form['title']
          const body = form['body']
          const tags = form['tags']
          if (typeof title !== 'string' || typeof body !== 'string' || typeof tags !== 'string')
            return json({ formError: 'Form not submitted correctly.' })

          const tagList = normalizeTags(tags)

          const fieldErrors = {
            title: validator.title(title),
            body: validator.body(body),
            tags: validator.tags(tagList),
          }
          const hasError = Object.values(fieldErrors).some(Boolean)
          if (hasError) {
            ev.preventDefault()
            setFieldErrors(fieldErrors)
          }
        }}
      >
        <CreatePostForm defaultValues={post} fieldErrors={fieldErrors} />
        <div className="justify-end gap-2 py-4">
          <Button type="submit" primary>
            Update Post
          </Button>
        </div>
        <input type="hidden" name="id" value={post?.postId} />
      </Form>
    </Layout>
  )
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  if (!userId) throw json({ message: 'You must be logged in to edit a post' })
  const form = await request.formData()
  const id = form.get('id')
  const title = form.get('title')
  const body = form.get('body')
  const tags = form.get('tags')
  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    typeof body !== 'string' ||
    typeof tags !== 'string'
  )
    return json({ formError: 'Form not submitted correctly.' })

  const tagList = normalizeTags(tags)

  const fields = { title, body, tags }
  const fieldErrors = {
    title: validator.title(title),
    body: validator.body(body),
    tags: validator.tags(tagList),
  }
  const hasError = Object.values(fieldErrors).some(Boolean)
  if (hasError) return json({ fieldErrors, fields })

  try {
    await db.any(sql`
      update posts set (title, body, tags) = (
        ${title},
        ${body},
        ${sql.array(tagList, sql`tag[]`)}
      ) where user_id = ${userId} and post_id = ${id}
    `)
    return redirect(`/p/${id}`)
  } catch (e) {
    console.log(e)
    return json({ formError: 'Something went wrong.' }, 400)
  }
}
