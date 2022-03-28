import React, { useState, useEffect } from 'react'
import { Link, useFetcher, useNavigate } from 'remix'
import {
  DotsVerticalIcon,
  HeartIcon,
  PencilAltIcon,
  ReplyIcon,
  TrashIcon,
  UserAddIcon,
} from '@heroicons/react/solid'
import { Menu, Transition } from '@headlessui/react'
import ago from 's-ago'
import type { PostInfo } from '~/types'
import { formatter } from '~/utils/postFormatter'
import { classNames } from '~/utils/classNames'
import { VoteControls } from './Vote'
import { CreateComment } from './CreateComment'

type CommentFetcher = {
  fieldError?: { body?: string }
  formError?: string
  commentId?: string
}

export function Post({
  postId,
  title,
  body,
  username,
  tags,
  score,
  createdAt,
  commentCount,
  currentUserVoted,
  currentUser,
}: PostInfo & {
  currentUser: null | { username: string; userId: string }
}) {
  const [showCommentForm, setShowCommentForm] = useState(false)
  const fetcher = useFetcher<CommentFetcher>()
  const navigate = useNavigate()

  useEffect(() => {
    if (fetcher.type === 'done') setShowCommentForm(false)
  }, [fetcher])
  const createdDate = new Date(createdAt)
  return (
    <>
      <div className="mb-4 flex flex-row text-clip rounded-lg bg-gray-50 p-4 shadow dark:bg-gray-800 dark:text-gray-50">
        <VoteControls type="post" voted={currentUserVoted} id={postId} score={score} />
        <div className="ml-2 flex w-full flex-col justify-center">
          <div className="flex flex-row">
            <Link
              to={`/p/${postId}`}
              className="text-bold w-full text-xl text-gray-800 dark:text-gray-50"
            >
              {title}
            </Link>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {'by '}
              <Link to={`/u/${username}`} className="text-gray-900 dark:text-gray-50">
                {username}
              </Link>
            </span>
            <span>
              <a title={createdDate.toLocaleString()} className="cursor-help underline">
                {ago(createdDate)}
              </a>
            </span>
            <span>
              {'tagged '}
              <TagList tags={tags} />
            </span>
            <span>
              {'has '}
              <Link to={`/p/${postId}`} className="text-gray-900 dark:text-gray-50">
                {commentCount === 0 ? 'no' : commentCount}{' '}
                {commentCount === 1 ? 'comment' : 'comments'}
              </Link>
            </span>
          </div>
          {body && (
            <div className="prose prose-lg max-w-none dark:prose-invert">{formatter(body)}</div>
          )}
        </div>
        <div className="flex flex-col justify-between">
          <PostMenu id={postId} isOwner={username === currentUser?.username} />
          {body && (
            <button
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => {
                if (currentUser) setShowCommentForm(s => !s)
                else navigate(`/login?redirectTo=/p/${postId}`)
              }}
            >
              <ReplyIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      {showCommentForm && (
        <CreateComment postId={postId} isDone={() => setShowCommentForm(false)} />
      )}
    </>
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

function PostMenu({
  id,
  isOwner = false,
  ...actions
}:
  | {
      isOwner: false
      id: string
      share?: () => void
      favorite?: () => void
    }
  | {
      isOwner: true
      id: string
      delete?: () => void
      edit?: () => void
      share?: () => void
      favorite?: () => void
    }) {
  const fetcher = useFetcher()
  return (
    <Menu as="span" className="relative inline-block text-left">
      <Menu.Button className="flex items-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <span className="sr-only">Open options</span>
        <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-10 right-0 mt-2 w-56 origin-top-right origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-700 dark:bg-gray-800">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={actions.share}
                  className={classNames(
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                      : 'text-gray-700 dark:text-gray-50',
                    'group flex items-center px-4 py-2 text-sm',
                  )}
                >
                  <UserAddIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Share
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={actions.favorite}
                  className={classNames(
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                      : 'text-gray-700 dark:text-gray-50',
                    'group flex w-full items-center px-4 py-2 text-sm',
                  )}
                >
                  <HeartIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Add to favorites
                </button>
              )}
            </Menu.Item>
          </div>
          {!isOwner ? null : (
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={actions.edit}
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                        : 'text-gray-700 dark:text-gray-50',
                      'group flex w-full items-center px-4 py-2 text-sm',
                    )}
                  >
                    <PencilAltIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Edit
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <fetcher.Form method="post" action="/delete-post" className="inline">
                    <input type="hidden" name="id" value={id} />
                    <button
                      type="submit"
                      className={classNames(
                        active
                          ? 'bg-red-500 text-white text-gray-900 dark:bg-red-700 dark:text-gray-50'
                          : 'text-gray-700 dark:text-gray-50',
                        'group flex w-full items-center px-4 py-2 text-sm',
                      )}
                    >
                      <TrashIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-100"
                        aria-hidden="true"
                      />
                      Delete
                    </button>
                  </fetcher.Form>
                )}
              </Menu.Item>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
