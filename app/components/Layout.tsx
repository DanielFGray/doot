import React from "react";
import { Link, NavLink } from "remix";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  PlusIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  UserIcon,
} from "@heroicons/react/outline";
import { classNames } from "~/utils/classNames";
import { CreatePostSlider } from "./CreatePost";

export function Header({ user }: { user: { username: string } | null }) {
  const [createBoardModalVisible, setCreatePostModalVisible] = React.useState(false);
  const navigation = React.useMemo(() => [{ name: "Home", href: "/" }], []);
  const userNavigation = React.useMemo(() => [
    { name: "Your Profile", as: NavLink, to: "/user" },
    // { name: "Settings", href: "#" },
    { name: "Create Post", as: "button", onClick: () => setCreatePostModalVisible(true) },
    { name: "Sign out", as: NavLink, to: "/logout" },
  ], []);

  return (
    <div className="mb-4 min-h-full">
      <Disclosure as="nav" className="bg-white shadow-sm dark:bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <h1 className="text-3xl font-bold text-indigo-600">doot</h1>
                  </div>
                  <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? "border-indigo-500 text-gray-900 dark:text-gray-300"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-200",
                            "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  {user ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setCreatePostModalVisible(true)}
                        className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:hover:text-gray-300"
                      >
                        <span className="sr-only">Create post</span>
                        <PlusIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="ml-3 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:hover:text-gray-300"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>

                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:hover:text-gray-300">
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
                          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
                            {userNavigation.map(
                              ({ name, as: As, ...props }) => (
                                <Menu.Item key={name}>
                                  {({ active }) => (
                                    <As
                                      {...props}
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-50"
                                      )}
                                    >
                                      {name}
                                    </As>
                                  )}
                                </Menu.Item>
                              )
                            )}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row gap-2">
                        <Link
                          to="/login"
                          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Log in
                        </Link>
                        <Link
                          to="/register"
                          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Register
                        </Link>
                      </div>
                    </>
                  )}
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-900 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800">
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

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pt-2 pb-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={NavLink}
                    to={item.href}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-800 hover:bg-gray-50 hover:text-gray-800 dark:hover:border-gray-700 dark:hover:text-gray-300",
                        "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
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
                        <UserIcon
                          className="h-10 w-10 text-gray-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium dark:text-gray-200 text-gray-800">
                          {user.username}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ml-auto flex-shrink-0 rounded-full p-1 text-gray-400 text-gray-400 dark:hover:text-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-1">
                      {userNavigation.map(({ name, ...props }) => (
                        <Disclosure.Button
                          key={name}
                          className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300"
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
      <CreatePostSlider
        open={createBoardModalVisible}
        setOpen={setCreatePostModalVisible}
      />
    </div>
  );
}

export function Layout({
  children,
  user,
}: {
  user: { username: string } | null;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <Header user={user} />
      <div className="mx-auto p-8 max-w-7xl">{children}</div>
    </>
  );
}
