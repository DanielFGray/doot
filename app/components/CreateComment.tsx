import { useEffect } from 'react'
import { useFetcher } from 'remix'
import { Button, PostInput } from './Forms'

export function CreateComment({
  postId,
  parentId = null,
  isDone,
}: {
  postId: string
  parentId?: null | string
  isDone?: () => void
}) {
  const fetcher = useFetcher()
  useEffect(() => {
    if (isDone && fetcher.type === 'done') isDone()
  }, [fetcher, isDone])
  return (
    <fetcher.Form method="post" action="/create-comment" className="py-4">
      <PostInput name="body" placeholder="Say something nice!" />
      <div className="mt-2 flex justify-between">
        <div className={fetcher.data?.formError || fetcher.data?.fieldError ? 'text-red-500' : ''}>
          {fetcher.data?.formError
            ? fetcher.data?.formError
            : fetcher.data?.fieldError?.body
              ? fetcher.data.fieldError.body
              : null}
        </div>
        <Button type="submit" primary>
          Post
        </Button>
      </div>
      <input type="hidden" name="postId" value={postId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
    </fetcher.Form>
  )
}
