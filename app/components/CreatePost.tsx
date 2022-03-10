import { useFetcher } from "remix";
import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { Button, Input } from "./Forms";

export function CreatePostSlider({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (b: boolean) => void;
}): JSX.Element {
  const postFetcher = useFetcher();
  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden" onClose={setOpen}>
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={React.Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <Transition.Child
              as={React.Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-md">
                <postFetcher.Form
                  method="post"
                  action="/create-post"
                  className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-gray-800 dark:bg-gray-900"
                >
                  <div className="h-0 flex-1 overflow-y-auto">
                    <div className="bg-brand-700 px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          New Post
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-brand-700 text-brand-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="divide-y divide-gray-200 px-4 sm:px-6">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label
                              htmlFor="post-title"
                              className="block text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                              Post title
                            </label>
                            <div className="mt-1">
                              <Input type="text" name="title" id="post-title" />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="post-body"
                              className="block text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                              Body
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="post-body"
                                name="body"
                                rows={4}
                                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 sm:text-sm"
                                defaultValue={""}
                              />
                            </div>
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
                                hasError={Boolean(postFetcher.data?.fieldErrors?.tags)}
                              />
                              {postFetcher.data?.fieldErrors?.tags && (
                                <p className="mt-2 text-sm text-red-600" id="tags-error">
                                  {postFetcher.data?.fieldErrors.tags}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 justify-end gap-2 px-4 py-4">
                    <Button type="submit" disabled={postFetcher.state === "submitting"}>
                      Save
                    </Button>
                    <Button type="button" primary={false} onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </postFetcher.Form>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
