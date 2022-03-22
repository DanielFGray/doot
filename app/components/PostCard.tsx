import { Link, useFetcher } from 'remix'
import ago from 's-ago'
import {
  ThumbDownIcon as ThumbDownOutline,
  ThumbUpIcon as ThumbUpOutline,
} from '@heroicons/react/outline'
import {
  ThumbDownIcon as ThumbDownSolid,
  ThumbUpIcon as ThumbUpSolid,
} from '@heroicons/react/solid'
import type { BoardListing } from '~/types'
import { formatter } from '~/utils/postFormatter'
import { classNames } from '~/utils/classNames'
import { Button } from './Forms'

export function Post({
  post_id,
  title,
  body,
  username,
  tags,
  score,
  created_at,
  comment_count,
  current_user_voted,
  currentUser,
}: BoardListing & {
  currentUser: null | { username: string; user_id: string }
}) {
  const fetcher = useFetcher()
  const createdDate = new Date(created_at)
  return (
    <div className="-mx-2 mb-4 text-clip rounded-lg bg-gray-50 p-2 p-4 shadow dark:bg-gray-800">
      <div className="flex flex-row dark:text-gray-50">
        <fetcher.Form
          method="post"
          action="/vote"
          className="block flex flex-col justify-around text-center"
        >
          <input type="hidden" name="id" value={post_id} />
          <input type="hidden" name="type" value="post" />
          {current_user_voted === 'up' ? (
            <button name="vote" value="null" type="submit">
              <ThumbUpSolid className="h-5 w-5 text-blue-600" />
            </button>
          ) : (
            <button name="vote" value="up" type="submit">
              <ThumbUpOutline className="h-5 w-5 text-gray-400" />
            </button>
          )}
          {score}
          {current_user_voted === 'down' ? (
            <button name="vote" value="null" type="submit">
              <ThumbDownSolid className="h-5 w-5 text-red-600" />
            </button>
          ) : (
            <button name="vote" value="down" type="submit">
              <ThumbDownOutline className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </fetcher.Form>
        <div className="ml-2 flex flex-col justify-center">
          <Link to={`/p/${post_id}`} className="text-bold text-xl text-gray-800 dark:text-gray-50">
            {title}
          </Link>
          <div className="flex flex-row flex-wrap items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {'by '}
              <Link to={`/u/${username}`} className="text-gray-900 dark:text-gray-50">
                {username}
              </Link>
            </span>
            <span>
              <a title={createdDate.toLocaleString()} className="cursor-help">
                {ago(createdDate)}
              </a>
            </span>
            <span>
              {'tagged '}
              <TagList tags={tags} />
            </span>
            <span>
              {'has '}
              <Link to={`/p/${post_id}`} className="text-gray-900 dark:text-gray-50">
                {comment_count === 0 ? 'no' : comment_count}{' '}
                {comment_count === 1 ? 'comment' : 'comments'}
              </Link>
            </span>
          </div>
          {body && (
            <div className="prose prose-lg max-w-none dark:prose-invert">{formatter(body)}</div>
          )}
          {body && currentUser && currentUser.username === username && (
            <div className="pt-1">
              <fetcher.Form method="post" action="/delete-post" className="inline">
                <input type="hidden" name="id" value={post_id} />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-red-100 bg-opacity-100 text-red-700 hover:bg-red-300 hover:bg-opacity-100 hover:text-red-700 dark:hover:text-red-800"
                >
                  Delete
                </Button>
              </fetcher.Form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="inline-flex flex-row flex-wrap gap-0.5">
      {tags?.map(tag => (
        <Tag key={tag} to={`/t/${tag}`} as={Link}>
          {tag}
        </Tag>
      ))}
    </div>
  )
}

function Tag<E extends React.ElementType>({
  as: As,
  className,
  ...props
}: { as: E; className?: string } & React.ComponentPropsWithoutRef<E>) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  return (
    //@ts-ignore
    <As
      {...props}
      className={classNames(
        'inline rounded-lg border border-gray-200 bg-gray-200 px-1 text-gray-900 hover:border-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-50',
        className,
      )}
    />
  )
}
