import { Form } from "remix";
import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import {Input} from "./Forms";

export function CreatePostSlider({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (b: boolean) => void;
}): JSX.Element {
  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden"
        onClose={setOpen}
      >
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
                <Form
                  method="post"
                  action="/create-post"
                  className="flex h-full flex-col divide-y dark:divide-gray-800 divide-gray-200 bg-white shadow-xl dark:bg-gray-900"
                >
                  <div className="h-0 flex-1 overflow-y-auto">
                    <div className="bg-indigo-700 px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          New Post
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
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
                              <Input
                                type="text"
                                name="title"
                                id="post-title"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="body"
                              className="block text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                              Body
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="post-body"
                                name="body"
                                rows={4}
                                className="block w-full dark:bg-gray-800 dark:border-gray-700 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 justify-end gap-2 px-4 py-4">
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setOpen(false)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
