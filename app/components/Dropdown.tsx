import { Fragment } from 'react'
import {
  DotsVerticalIcon,
  HeartIcon,
  PencilAltIcon,
  TrashIcon,
  UserAddIcon,
} from '@heroicons/react/solid'
import { Menu, Transition } from '@headlessui/react'
import { classNames } from '~/utils/classNames'

export function DropdownControls({
  id,
  isOwner = false,
  ...actions
}: {
  isOwner: boolean
  id: string
  delete: () => void
  edit: () => void
  share: () => void
  favorite: () => void
}) {
  return (
    <>
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
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-700 dark:bg-gray-800">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={actions.share}
                    className={classNames(
                      active
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                        : 'text-gray-700 dark:text-gray-200',
                        'group flex w-full items-center px-4 py-2 text-sm',
                    )}
                  >
                    <UserAddIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-50"
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
                        : 'text-gray-700 dark:text-gray-200',
                        'group flex w-full items-center px-4 py-2 text-sm',
                    )}
                  >
                    <HeartIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-50"
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
                          : 'text-gray-700 dark:text-gray-200',
                          'group flex w-full items-center px-4 py-2 text-sm',
                      )}
                    >
                      <PencilAltIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-50"
                        aria-hidden="true"
                      />
                      Edit
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="submit"
                      onClick={actions.delete}
                      className={classNames(
                        active
                          ? 'bg-red-500 text-white text-gray-900 dark:bg-red-700 dark:text-gray-50'
                          : 'text-gray-700 dark:text-gray-200',
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
              </div>
            )}
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  )
}
