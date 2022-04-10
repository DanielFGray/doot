import { useState, useEffect } from 'react'
import { Link, useNavigate, useFetcher } from 'remix'
import { ReplyIcon } from '@heroicons/react/solid'
import ago from 's-ago'
import { formatter } from '~/utils/postFormatter'
import { Button, PostInput } from './Forms'
import { CreateCommentForm } from './CreateComment'
import { classNames } from '~/utils/classNames'
import { VoteControls } from './Vote'
import { DropdownControls } from './Dropdown'
import type { CommentInfo } from '../types'
import { Modal } from './Modal'
import { ExclamationIcon } from '@heroicons/react/outline'

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const createdDate = new Date(createdAt)
  const navigate = useNavigate()
  const deleteFetcher = useFetcher()
  const editFetcher = useFetcher()
  useEffect(() => {
    if (deleteFetcher.data?.commentId) {
      setShowCommentForm(false)
    }
  }, [deleteFetcher])
  useEffect(() => {
    if (editFetcher.data?.commentId) {
      setShowEditForm(false)
    }
  }, [editFetcher])
  return (
    <div
      className={classNames(
        'rounded-l-xl pt-1 pl-2 sm:rounded-r-xl',
        depth % 2 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700',
      )}
    >
      <div className="flex flex-row p-1">
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
          {showEditForm ? (
            <editFetcher.Form method="post" action="/edit-comment">
              <PostInput name="body" defaultValue={body} />
              <div className="mt-2 flex justify-between">
                <div
                  className={
                    editFetcher.data?.formError || editFetcher.data?.fieldError
                      ? 'text-red-500'
                      : ''
                  }
                >
                  {editFetcher.data?.formError
                    ? editFetcher.data?.formError
                    : editFetcher.data?.fieldError?.body
                    ? editFetcher.data.fieldError.body
                    : null}
                </div>
                <div>
                  <Button type="submit" onClick={() => setShowEditForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" primary>
                    Post
                  </Button>
                </div>
              </div>
              <input type="hidden" name="id" value={commentId} />
            </editFetcher.Form>
          ) : (
            <div className="prose max-w-none dark:prose-invert">{formatter(body)}</div>
          )}
        </div>
        <span className="flex flex-col justify-between">
          <DropdownControls
            id={commentId}
            isOwner={username == currentUser?.username}
            delete={() => setShowDeleteModal(true)}
            edit={() => setShowEditForm(true)}
          />
          <button
            className={classNames(
              'rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
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
        </span>
      </div>
      {showCommentForm && (
        <CreateCommentForm
          postId={postId}
          parentId={commentId}
          isDone={() => setShowCommentForm(false)}
        />
      )}
      <div className="flex flex-col pt-1 gap-2">
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
      <Modal
        open={showDeleteModal}
        title="Delete comment?"
        close={() => setShowDeleteModal(false)}
        confirmed={() => {
          deleteFetcher.submit({ id: commentId }, { action: '/delete-comment', method: 'post' })
          setShowDeleteModal(false)
        }}
        danger
        icon={ExclamationIcon}
      >
        Are you sure you want to delete your comment?
      </Modal>
    </div>
  )
}
