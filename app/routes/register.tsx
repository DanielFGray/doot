import type { ActionFunction } from 'remix'
import { useState } from 'react'
import { Form, useActionData, json, useSearchParams } from 'remix'
import { Layout } from '~/components/Layout'
import { Input, Button } from '~/components/Forms'
import { createUserSession, register } from '~/utils/session.server'

type ActionData = {
  formError?: string
  fieldErrors?: {
    username: string | undefined
    password: string | undefined
    email: string | undefined
  }
  fields?: {
    username: string
    password: string
    email: string
  }
}

export default function Register() {
  const actionData = useActionData<ActionData>()
  const [password, setPassword] = useState(actionData?.fields?.password ?? '')
  const [searchParams] = useSearchParams()
  return (
    <Layout user={null}>
      <Form
        method="post"
        className="space-y-8 divide-y divide-gray-200 px-8 dark:divide-gray-800"
        aria-describedby={actionData?.formError ? 'form-error-message' : undefined}
      >
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-50">Register</h3>
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label
            htmlFor="username-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2"
          >
            Username
          </label>
          <div className="mt-1 sm:col-span-2 sm:mt-0">
            <div className="relative mt-1 rounded-md shadow-sm">
              <Input
                type="text"
                id="username-input"
                name="username"
                required
                defaultValue={actionData?.fields?.username}
                hasError={Boolean(actionData?.fieldErrors?.username)}
              />
            </div>
            {actionData?.fieldErrors?.username && (
              <p className="mt-2 text-sm text-red-600" id="username-error">
                {actionData?.fieldErrors.username}
              </p>
            )}
          </div>
        </div>
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label
            htmlFor="email-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2"
          >
            Email (optional)
          </label>
          <div className="mt-1 sm:col-span-2 sm:mt-0">
            <div className="relative mt-1 rounded-md shadow-sm">
              <Input
                type="text"
                id="email-input"
                name="email"
                defaultValue={actionData?.fields?.email}
                hasError={Boolean(actionData?.fieldErrors?.email)}
              />
            </div>
            {actionData?.fieldErrors?.email && (
              <p className="mt-2 text-sm text-red-600" id="email-error">
                {actionData?.fieldErrors.email}
              </p>
            )}
          </div>
        </div>
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label
            htmlFor="password-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2"
          >
            Password
          </label>
          <div className="mt-1 sm:col-span-2 sm:mt-0">
            <div className="relative mt-1 shadow-sm">
              <Input
                type="password"
                id="password-input"
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                defaultValue={actionData?.fields?.password}
                hasError={Boolean(actionData?.fieldErrors?.password)}
              />
            </div>
            {actionData?.fieldErrors?.password && (
              <p className="mt-2 text-sm text-red-600" id="password-error">
                {actionData?.fieldErrors.password}
              </p>
            )}
          </div>
        </div>
        {actionData?.formError ? (
          <div id="form-error-message">
            <p className="form-validation-error" role="alert">
              {actionData?.formError}
            </p>
          </div>
        ) : null}

        <div className="pt-5">
          <div className="flex justify-end">
            <Button type="submit" primary>
              Submit
            </Button>
            <input
              type="hidden"
              name="redirectTo"
              value={searchParams.get('redirectTo') ?? undefined}
            />
          </div>
        </div>
      </Form>
    </Layout>
  )
}

function validateUsername(username: string) {
  if (username.length < 3) {
    return 'Usernames must be at least 3 characters long'
  }
  if (username.length > 64) {
    return 'Usernames must be less than 64 characters long'
  }
}

function validatePassword(password: string) {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Passwords must be at least 6 characters long'
  }
}

function validateEmail(email: string) {
  if (email.length > 1 && ! email.includes('@')) {
    return 'Please enter a valid email address'
  }
}

const badRequest = (data: ActionData) => json(data, { status: 400 })

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const username = form.get('username')
  const password = form.get('password')
  const email = form.get('email')
  const redirectTo = (form.get('redirectTo') as string) || '/'
  if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
    return badRequest({
      formError: 'Form not submitted correctly.',
    })
  }

  const fields = { username, email, password }
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
    email: validateEmail(email),
  }
  const hasErrors = Object.values(fieldErrors).some(Boolean)
  if (hasErrors) return badRequest({ fieldErrors, fields })

  const user = await register({ email, username, password })
  if (!user) {
    return badRequest({
      fields,
      formError: 'Username or email already exists',
    })
  }
  return createUserSession(user.userId, redirectTo)
}
