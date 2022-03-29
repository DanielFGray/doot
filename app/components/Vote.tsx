import { useFetcher } from 'remix'
import {
  ThumbDownIcon as ThumbDownOutline,
  ThumbUpIcon as ThumbUpOutline,
} from '@heroicons/react/outline'
import {
  ThumbDownIcon as ThumbDownSolid,
  ThumbUpIcon as ThumbUpSolid,
} from '@heroicons/react/solid'

export function VoteControls({
  id,
  voted,
  score,
  type,
}: {
  id: string
  voted: 'up' | 'down' | null
  score: number
  type: 'post' | 'comment'
}) {
  const fetcher = useFetcher()
  return (
    <fetcher.Form method="post" action="/vote" className="mr-2 flex flex-col text-center">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="type" value={type} />
      {voted === 'up' ? (
        <button name="vote" value="null" type="submit">
          <ThumbUpSolid className="h-5 w-5 text-blue-700 dark:text-blue-500" />
        </button>
      ) : (
        <button name="vote" value="up" type="submit">
          <ThumbUpOutline className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </button>
      )}
      {score}
      {voted === 'down' ? (
        <button name="vote" value="null" type="submit">
          <ThumbDownSolid className="h-5 w-5 text-red-700 dark:text-red-500" />
        </button>
      ) : (
        <button name="vote" value="down" type="submit">
          <ThumbDownOutline className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </button>
      )}
    </fetcher.Form>
  )
}
