import React, { useState } from 'react'
import { Link, useNavigate, useFetcher } from 'remix'
import { ReplyIcon } from '@heroicons/react/solid'
import ago from 's-ago'
import type { PostInfo } from '~/types'
import { formatter } from '~/utils/postFormatter'
import { classNames } from '~/utils/classNames'
import { VoteControls } from './Vote'
import { DropdownControls } from './Dropdown'
import { CreateCommentForm } from './CreateComment'
import {ExclamationIcon} from '@heroicons/react/outline'
import {Modal} from './Modal'

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const navigate = useNavigate()
  const fetcher = useFetcher()
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
          <DropdownControls
            id={postId}
            isOwner={username === currentUser?.username}
            delete={() => setShowDeleteModal(true)}
            edit={() => navigate(`/edit-post?id=${postId}`)}
          />
          {body && (
            <button
              className={classNames(
                'text-gray-400 rounded-full hover:text-gray-600 dark:hover:text-gray-300',
                showCommentForm &&
                  'bg-gray-200 text-gray-700 outline outline-8 outline-gray-200 dark:bg-gray-600 dark:text-gray-400 dark:outline-gray-600',
              )}
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
        <CreateCommentForm postId={postId} isDone={() => setShowCommentForm(false)} />
      )}
      <Modal
        open={showDeleteModal}
        title="Delete post?"
        close={() => setShowDeleteModal(false)}
        confirmed={() => {
          fetcher.submit({ id: postId }, { action: '/delete-post', method: 'post' })
          setShowDeleteModal(false)
        }}
        danger
        icon={ExclamationIcon}
      >
        Are you sure you want to delete your post?
      </Modal>
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
