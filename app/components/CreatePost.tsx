import { Input, PostInput } from '~/components/Forms'

type Fields = {
  title: string
  body: string
  tags: string
}

export function CreatePostForm({
  defaultValues,
  fieldErrors,
}: {
  defaultValues?: Partial<Fields>
  fieldErrors?: Partial<Fields>
}) {
  return (
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
            defaultValue={defaultValues?.title}
            hasError={Boolean(fieldErrors?.title)}
          />
          {fieldErrors?.title && (
            <p className="mt-2 text-sm text-red-600" id="title-error">
              {fieldErrors.title}
            </p>
          )}
        </div>
      </div>
      <div className="mt-1">
        <PostInput
          name="body"
          defaultValue={defaultValues?.body}
          classes={{ textarea: 'dark:border-gray-700 dark:bg-gray-800' }}
        />
        {fieldErrors?.body && (
          <p className="mt-2 text-sm text-red-600" id="body-error">
            {fieldErrors.body}
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
            defaultValue={defaultValues?.tags}
            hasError={Boolean(fieldErrors?.tags)}
          />
          {fieldErrors?.tags && (
            <p className="mt-2 text-sm text-red-600" id="tags-error">
              {fieldErrors.tags}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
