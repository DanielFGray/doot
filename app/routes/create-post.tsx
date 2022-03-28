import { Form, useLoaderData, useActionData, ActionFunction, LoaderFunction, redirect, json } from 'remix'
import { Input, Button, PostInput } from '~/components/Forms'
import { Layout } from '~/components/Layout'
import { db, sql } from '~/utils/db.server'
import { getUser } from '~/utils/session.server'

export const loader: LoaderFunction = ({ request }) => {
  const user = getUser(request)
  if (!user) {
    return redirect('/login?redirectTo=/create-post')
  }
  return { user }
}

export default function CreatePostPage() {
  const { user } = useLoaderData<{ userId: string, username: string }>()
  const actionData = useActionData()
  return (
    <Layout user={user}>
      <Form
        method="post"
        action="/create-post"
        className="flex h-full flex-col divide-gray-200 dark:divide-gray-700"
      >
        <div className="flex flex-1 flex-col justify-between">
          <div className="divide-y divide-gray-200 px-4 sm:px-6">
            <div className="space-y-6 pt-6 pb-5">
              <div>
                <label
                  htmlFor="post-title"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Post title
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    name="title"
                    id="post-title"
                    hasError={Boolean(actionData?.fieldErrors?.title)}
                  />
                  {actionData?.fieldErrors?.title && (
                    <p className="mt-2 text-sm text-red-600" id="title-error">
                      {actionData?.fieldErrors.title}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-1">
                <PostInput name="body" />
                {actionData?.fieldErrors?.body && (
                  <p className="mt-2 text-sm text-red-600" id="body-error">
                    {actionData?.fieldErrors.body}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Tags
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    name="tags"
                    id="tags"
                    hasError={Boolean(actionData?.fieldErrors?.tags)}
                  />
                  {actionData?.fieldErrors?.tags && (
                    <p className="mt-2 text-sm text-red-600" id="tags-error">
                      {actionData?.fieldErrors.tags}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="justify-end gap-2 px-4 py-4">
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
  const { userId } = user
  const form = await request.formData()
  const tags = form.get('tags')
  const title = form.get('title')
  const body = form.get('body')
  if (typeof tags !== 'string' || typeof title !== 'string' || typeof body !== 'string') {
    return badRequest({
      formError: 'Form not submitted correctly.',
    })
  }

  const tagList = Array.from(new Set(tags.split(/,\s*/).filter(Boolean)))

  const fields = { title, tags, body }
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
