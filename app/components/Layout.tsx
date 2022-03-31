import React from 'react'
import { Form, Link, NavLink } from 'remix'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { PlusIcon, BellIcon, MenuIcon, XIcon, UserIcon, SearchIcon } from '@heroicons/react/outline'
import { classNames } from '~/utils/classNames'

export function Header({ user }: { user: { username: string } | null }) {
  const navigation = React.useMemo(() => [{ name: 'Home', href: '/' }], [])
  const userNavigation = React.useMemo(
    () => [
      { name: 'Your Profile', as: NavLink, to: `/u/${user?.username ?? ''}` },
      // { name: "Settings", href: "#" },
      { name: 'Create Post', as: NavLink, to: '/create-post' },
      { name: 'Sign out', as: NavLink, to: '/logout' },
    ],
    [],
  )
  return (
    <div className="min-h-full">
      <Disclosure
        as="nav"
        className="bg-white shadow-sm bgp-topography-[brand.700,.5] dark:bg-gray-800"
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <Link to="/">
                      <h1 className="text-3xl font-bold text-brand-600">doot</h1>
                    </Link>
                  </div>
                  <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map(item => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? 'border-brand-500 bg-white bg-opacity-50 text-gray-900 dark:bg-gray-800 dark:bg-opacity-50 dark:text-gray-300'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-200',
                            'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-center px-2 md:ml-6 md:justify-end">
                  <Form action="/search" method="post" className="w-full max-w-lg lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        id="search"
                        name="q"
                        className="block w-full rounded-md border border-brand-300 bg-white bg-opacity-75 py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-brand-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:bg-opacity-75 dark:text-gray-50 sm:text-sm"
                        placeholder="Search"
                        type="search"
                      />
                    </div>
                  </Form>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  {user ? (
                    <>
                      <Link
                        to="/create-post"
                        className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-800 dark:hover:text-gray-300"
                      >
                        <span className="sr-only">Create post</span>
                        <PlusIcon className="h-6 w-6" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        className="ml-3 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-800 dark:hover:text-gray-300"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>

                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex rounded-full bg-white p-1 text-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-800 dark:hover:text-gray-300">
                            <span className="sr-only">Open user menu</span>
                            <UserIcon className="h-6 w-6" />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={React.Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
                            {userNavigation.map(({ name, as: As, ...props }) => (
                              <Menu.Item key={name}>
                                {({ active }) => (
                                  <As
                                    {...props}
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      'block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-50',
                                    )}
                                  >
                                    {name}
                                  </As>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row gap-2">
                        <Link
                          to="/login"
                          className="inline-flex items-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                        >
                          Log in
                        </Link>
                        <Link
                          to="/register"
                          className="inline-flex items-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                        >
                          Register
                        </Link>
                      </div>
                    </>
                  )}
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-800 dark:hover:bg-gray-900 dark:hover:text-gray-200">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-50 sm:hidden">
              <div className="space-y-1 pt-2 pb-3">
                {navigation.map(item => (
                  <Disclosure.Button
                    key={item.name}
                    as={NavLink}
                    to={item.href}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-transparent bg-opacity-25 text-gray-800 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:text-gray-300',
                        'block border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                      )
                    }
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 pb-3">
                {user ? (
                  <>
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <UserIcon className="h-10 w-10 text-gray-500" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <Link
                          to={`/u/${user.username}`}
                          className="text-base font-medium text-gray-800 dark:text-gray-200"
                        >
                          {user.username}
                        </Link>
                      </div>
                      <button
                        type="button"
                        className="ml-auto flex-shrink-0 rounded-full p-1 text-gray-400 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:hover:text-gray-300"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-1">
                      {userNavigation.map(({ name, ...props }) => (
                        <Disclosure.Button
                          key={name}
                          className="block w-full px-4 py-2 text-left text-base font-medium text-gray-700 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-50"
                          {...props}
                        >
                          {name}
                        </Disclosure.Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      as={NavLink}
                      to="/login"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Log in
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={NavLink}
                      to="/register"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Register
                    </Disclosure.Button>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}

export function Layout({
  children,
  user,
}: {
  user: { username: string } | null
  children: React.ReactNode
}): React.ReactElement {
  return (
    <>
      <Header user={user} />
      <div className="mx-auto max-w-7xl p-8">{children}</div>
    </>
  )
}
