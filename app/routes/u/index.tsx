import { redirect, LoaderFunction } from 'remix'
import { getUser } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request)
  if (user) return redirect(`/u/${user.username}`)
  return redirect('/')
}
