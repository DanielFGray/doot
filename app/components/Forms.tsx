import React, { Fragment, useState } from 'react'
import { Tab } from '@headlessui/react'
import { ExclamationCircleIcon, AtSymbolIcon, CodeIcon, LinkIcon } from '@heroicons/react/solid'
import { classNames } from '../utils/classNames'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
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

export const Input = ({
  name,
  hasError,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> & {
  name: string
  hasError?: undefined | boolean
}) => {
  return (
    <>
      <input
        name={name}
        {...props}
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
}
export function PostInput({
  placeholder = '',
  defaultValue = '',
  name,
}: {
  placeholder?: string
  defaultValue?: string
  name: string
}) {
  const [textinput, changeTextinput] = useState(defaultValue)
  return (
    <Tab.Group>
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
              <div className="ml-auto flex items-center space-x-5">
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
              <label htmlFor="comment" className="sr-only">
                Comment
              </label>
              <div>
                <textarea
                  rows={5}
                  name={name}
                  className="block w-full bg-transparent max-w-none rounded-md border-gray-300 leading-7 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-500 dark:text-gray-200"
                  value={textinput}
                  onChange={e => changeTextinput(e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel className="-m-0.5 p-0.5">
              <div className="border-1 prose mx-px mt-px max-w-none rounded border-gray-100 px-3 pt-2 pb-12 dark:prose-invert">
                {formatter(textinput)}
                <input type="hidden" name={name} value={textinput} />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </>
      )}
    </Tab.Group>
  )
}

export function SelectMenu<T extends string>({
  items,
  selected,
  setSelected,
}: {
  selected: T
  setSelected(value: T): void
  items: Array<{ label: string; value: T }>
}) {
  return (
    <Fragment>
      <select
        id="location"
        name="location"
        className="mt-1 block text-sm rounded-md border-gray-300 bg-gray-50 py-2 pl-3 pr-10 focus:border-brand-500 focus:outline-none focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 sm:hidden"
        defaultValue={selected}
        onChange={e => setSelected(e.target.value as T)}
      >
        {items.map(({ label, value }) => (
          <option key={label} value={value} selected={value === selected}>
            {label}
          </option>
        ))}
      </select>
      <div className="hidden sm:block">
        <Listbox value={selected} onChange={setSelected}>
          {({ open }) => (
            <div className="relative mt-1">
              <Listbox.Button className="relative cursor-default rounded-md border border-gray-300 bg-gray-50 py-2 pl-3 pr-10 text-left shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 sm:text-sm">
                <span className="block truncate">
                  {items.find(({ value }) => value === selected)?.label}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {items.map(({ label, value }) => (
                    <Listbox.Option
                      key={label}
                      className={({ active }) =>
                        classNames(
                          active ? 'bg-brand-600 text-white' : 'dark:text-gray-50 text-gray-900',
                          'relative cursor-default select-none py-2 pl-3 pr-9',
                        )
                      }
                      value={value}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={classNames(
                              selected ? 'font-semibold' : 'font-normal',
                              'block truncate',
                            )}
                          >
                            {label}
                          </span>

                          {selected ? (
                            <span
                              className={classNames(
                                active ? 'text-white' : 'text-brand-600',
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          )}
        </Listbox>
      </div>
    </Fragment>
  )
}
