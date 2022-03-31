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
import { UserSession, getUser } from '~/utils/session.server'

type LoaderData = {
  user: UserSession
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  if (!user) {
    return redirect('/login?redirectTo=/')
  }
  return json<LoaderData>({ user })
}

type Fields = { title?: string; body?: string; tags?: string }

export default function CreatePostPage() {
  const { user } = useLoaderData<LoaderData>()
  const actionData = useActionData()
  const [stateErrors, setFieldErrors] = useState<Fields>(actionData)
  const fieldErrors = { ...(actionData?.fieldErrors ?? {}), ...stateErrors }
  return (
    <Layout user={user}>
      <Form
        method="post"
        action="/create-post"
        className="mx-auto flex h-full max-w-7xl flex-col divide-y divide-gray-200 divide-gray-200 px-4 dark:divide-gray-700 sm:px-6"
        onSubmit={ev => {
          const form = Object.fromEntries(new FormData(ev.currentTarget).entries())
          const title = form['title']
          const body = form['body']
          const tags = form['tags']
          if (typeof title !== 'string' || typeof body !== 'string' || typeof tags !== 'string')
            return badRequest({ formError: 'Form not submitted correctly.' })

          const tagList = normalizeTags(tags)

          const fieldErrors = {
            title: validateTitle(title),
            body: validateBody(body),
            tags: validateTags(tagList),
          }
          const hasError = Object.values(fieldErrors).some(Boolean)
          if (hasError) {
            ev.preventDefault()
            setFieldErrors(fieldErrors)
          }
        }}
      >
        <CreatePostForm fieldErrors={fieldErrors} />
        <div className="justify-end gap-2 py-4">
          <Button type="submit" primary>
            Create Post
          </Button>
        </div>
      </Form>
    </Layout>
  )
}

const badRequest = (data: { formError: string } | { message: string }) =>
  json(data, { status: 400 })

function validateTitle(title: string) {
  if (title.length < 1) {
    return 'Title must not not empty'
  }
  if (title.length > 140) {
    return 'Title must be less than 100 characters long'
  }
}

function validateBody(body: string) {
  if (body.length < 1) {
    return 'Body must not not empty'
  }
  if (body.length > 2000) {
    return 'Body must be less than 2000 characters long'
  }
}

function validateTags(tags: string[]) {
  if (tags.length > 5 || tags.length < 1) {
    return 'Must have between 1 and 5 tags'
  }
  if (tags.some(tag => tag.length > 64)) {
    return 'Tags must be less than 64 characters long'
  }
}

export const normalizeTags = (tagList: string) =>
  Array.from(new Set(tagList.split(/,\s*/).filter(Boolean)))
export const validator = {
  title: validateTitle,
  body: validateBody,
  tags: validateTags,
}

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request)

  if (!user) throw badRequest({ message: 'You must be logged in to create a new post' })
  const { userId } = user
  const form = await request.formData()
  const title = form.get('title')
  const body = form.get('body')
  const tags = form.get('tags')
  if (typeof title !== 'string' || typeof body !== 'string' || typeof tags !== 'string')
    return badRequest({ formError: 'Form not submitted correctly.' })

  const tagList = normalizeTags(tags)
  const fields = { title, body, tags }
  const fieldErrors = {
    title: validateTitle(title),
    body: validateBody(body),
    tags: validateTags(tagList),
  }
  const hasError = Object.values(fieldErrors).some(Boolean)
  if (hasError) return json({ fieldErrors, fields })

  try {
    const post = await db.maybeOne<{ postId: string }>(sql`
      select * from create_post(
        ${title},
        ${body},
        ${sql.array(tagList, sql`tag[]`)},
        ${userId}
      ) as post_id
    `)
    if (!post) throw badRequest({ formError: 'Something went wrong.' })
    return redirect(`/p/${post.postId}`)
  } catch (e) {
    console.log(e)
    return badRequest({ formError: 'Something went wrong.' })
  }
}
