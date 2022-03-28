import { Fragment, useState } from 'react'
import { Link, useFetcher, useNavigate } from 'remix'
import {
  ReplyIcon,
  DotsVerticalIcon,
  HeartIcon,
  PencilAltIcon,
  TrashIcon,
  UserAddIcon,
} from '@heroicons/react/solid'
import { Menu, Transition } from '@headlessui/react'
import ago from 's-ago'
import { formatter } from '~/utils/postFormatter'
import { classNames } from '~/utils/classNames'
import { VoteControls } from './Vote'
import { CreateComment } from './CreateComment'
import type { CommentInfo } from '../types'

export function Comment({
  commentId,
  postId,
  body,
  username,
  score,
  createdAt,
  updatedAt,
  currentUserVoted,
  currentUser,
  children,
  depth = 0,
  sortedBy,
}: CommentInfo & {
  currentUser: null | { username: string; userId: string }
  depth?: number
  sortedBy: 'popularity' | 'score' | 'createdAt'
}) {
  const [showCommentForm, setShowCommentForm] = useState(false)
  const createdDate = new Date(createdAt)
  const navigate = useNavigate()
  return (
    <div
      className={classNames(
        'mt-4 rounded-lg p-4 shadow',
        depth === 0
          ? ''
          : depth % 2
          ? 'bg-gray-50 dark:bg-gray-800'
          : 'bg-gray-100 dark:bg-gray-700',
      )}
    >
      <div className="flex flex-row">
        <VoteControls type="comment" voted={currentUserVoted} id={commentId} score={score} />
        <div className="w-full text-sm text-gray-600 dark:text-gray-400">
          <span>
            <a title={createdDate.toLocaleString()} className="cursor-help underline">
              {ago(createdDate)}
            </a>
            {updatedAt !== createdAt && (
              <span className="text-sm text-gray-500">(updated {ago(new Date(updatedAt))})</span>
            )}
          </span>
          {username && (
            <span>
              {' by '}
              <Link to={`/u/${username}`} className="text-gray-900 dark:text-gray-50">
                {username}
              </Link>
            </span>
          )}
          <div className="prose max-w-none dark:prose-invert">{formatter(body)}</div>
        </div>
        <span className="flex flex-col justify-between">
          <CommentMenu commentId={commentId} isOwner={username == currentUser?.username} />
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => {
              if (currentUser) setShowCommentForm(s => !s)
              else navigate(`/login?redirectTo=/p/${postId}`)
            }}
          >
            <ReplyIcon className="h-5 w-5" />
          </button>
        </span>
      </div>
      {showCommentForm && (
        <CreateComment
          postId={postId}
          parentId={commentId}
          isDone={() => setShowCommentForm(false)}
        />
      )}
      {children
        .slice(0)
        .sort((a, b) => b[sortedBy] - a[sortedBy])
        .map(props => (
          <Comment
            key={props.commentId}
            currentUser={currentUser}
            sortedBy={sortedBy}
            depth={depth + 1}
            {...props}
          />
        ))}
    </div>
  )
}

function CommentMenu({ commentId, isOwner }: { commentId: string; isOwner: boolean }) {
  const fetcher = useFetcher()
  return (
    <Menu as="span" className="relative inline-block text-left">
      <Menu.Button className="flex items-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <span className="sr-only">Open options</span>
        <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-700 dark:bg-gray-800">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
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
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  className={classNames(
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                      : 'text-gray-700 dark:text-gray-50',
                    'group flex items-center px-4 py-2 text-sm',
                  )}
                >
                  <HeartIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Add to favorites
                </a>
              )}
            </Menu.Item>
          </div>
          {!isOwner ? null : (
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                        : 'text-gray-700 dark:text-gray-50',
                      'group flex items-center px-4 py-2 text-sm',
                    )}
                  >
                    <PencilAltIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Edit
                  </a>
                )}
              </Menu.Item>
              <fetcher.Form method="post" action="/delete-comment" className="inline">
                <input type="hidden" name="id" value={commentId} />
                <Menu.Item>
                  {({ active }) => (
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
                  )}
                </Menu.Item>
              </fetcher.Form>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
