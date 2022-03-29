import React, { useState } from 'react'
import { Tab } from '@headlessui/react'
import { ExclamationCircleIcon, AtSymbolIcon, CodeIcon, LinkIcon } from '@heroicons/react/solid'
import { classNames } from '../utils/classNames'
import { formatter } from '../utils/postFormatter'

export const Button = ({
  children,
  className,
  primary = false,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean
  size?: 'sm' | 'md' | 'lg'
}) => {
  return (
    <button
      {...props}
      className={classNames(
        className,
        'inline-flex items-center rounded-md border border-transparent font-medium shadow focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        primary
          ? 'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500'
          : 'bg-white bg-opacity-25 text-brand-700 dark:bg-gray-700 dark:text-white',
        size === 'sm' ? 'px-2 py-1 text-sm' : size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2',
      )}
    >
      {children}
    </button>
  )
}

export const Input = React.forwardRef(function Input(
  {
    name,
    hasError,
    className,
    ...props
  }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> & {
    name: string
    hasError?: undefined | boolean
  },
  ref,
) {
  return (
    <>
      <input
        name={name}
        {...props}
        ref={ref}
        className={classNames(
          hasError
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
            : 'focus:border-brand-500 focus:ring-brand-500',
          'block w-full rounded-md border-gray-300 bg-white pr-10 focus:outline-none dark:border-gray-700 dark:bg-gray-800 sm:text-sm',
          className,
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      {hasError && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
        </div>
      )}
    </>
  )
})

export const PostInput = React.forwardRef(function PostInput(
  {
    name,
    classes = {},
    ...textareaprops
  }: Omit<React.InputHTMLAttributes<HTMLTextAreaElement>, 'name'> & {
    name: string
    classes?: Partial<Record<'textarea' | 'actions', string>>
  },
  ref,
) {
  const [textinput, changeTextinput] = useState(textareaprops.defaultValue)
  return (
    <Tab.Group defaultIndex={0}>
      {({ selectedIndex }) => (
        <>
          <Tab.List className="flex items-center gap-2">
            {[{ label: 'Write' }, { label: 'Preview', disabled: !textinput }].map(
              ({ label, ...props }) => (
                <Tab
                  key={label}
                  {...props}
                  className={({ selected }) =>
                    classNames(
                      selected
                        ? 'text-gray-900 dark:text-gray-50'
                        : 'text-gray-500 hover:bg-gray-300 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50',
                      'rounded-md border border-transparent px-3 py-1.5 text-sm font-medium',
                    )
                  }
                >
                  {label}
                </Tab>
              ),
            )}
            {/* These buttons are here simply as examples and don't actually do anything. */}
            {selectedIndex !== 0 ? null : (
              <div className={classNames('ml-auto flex items-center space-x-5', classes.actions)}>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Insert link</span>
                    <LinkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Insert code</span>
                    <CodeIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Mention someone</span>
                    <AtSymbolIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel className="-m-0.5 rounded-lg p-0.5">
              <textarea
                rows={5}
                ref={ref}
                {...textareaprops}
                name={name}
                className={classNames(
                  'block w-full max-w-none rounded-md border-gray-300 bg-white leading-7 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800',
                  classes.textarea,
                )}
                value={textinput}
                onChange={e => changeTextinput(e.target.value)}
              />
            </Tab.Panel>
            <Tab.Panel className="-m-0.5 p-0.5">
              <div className="prose mx-px mt-px max-w-none rounded border-gray-100 px-3 pt-2 pb-12 shadow-lg outline outline-2 outline-brand-500 dark:prose-invert">
                {formatter(textinput)}
                <input type="hidden" name={name} value={textinput} />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </>
      )}
    </Tab.Group>
  )
})

export function SelectMenu<T extends string>({
  items,
  selected,
  setSelected,
  name,
  id,
}: {
  name?: string
  id?: string
  selected: T
  setSelected(value: T): void
  items: Array<{ value: T; label: string }>
}) {
  return (
    <select
      name={name}
      id={id}
      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
      defaultValue={selected}
      onChange={e => setSelected(e.target.value as T)}
    >
      {items.map(({ label, value }) => (
        <option key={label} value={value} selected={value === selected}>
          {label}
        </option>
      ))}
    </select>
  )
}
