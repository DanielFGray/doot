import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import {
  ExclamationCircleIcon,
  AtSymbolIcon,
  CodeIcon,
  LinkIcon,
} from "@heroicons/react/solid";
import { classNames } from "~/utils/classNames";

export const Button = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={classNames(
        "inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-200",
        className
      )}
    >
      {children}
    </button>
  );
};

export const Input = ({
  name,
  hasError,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> & {
  name: string;
  hasError?: undefined | boolean;
}) => {
  return (
    <div className="relative mt-1 rounded-md shadow-sm">
      <input
        name={name}
        {...props}
        className={classNames(
          hasError
            ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
            : "focus:border-indigo-500 focus:ring-indigo-500",
            "block w-full rounded-md pr-10 focus:outline-none border-gray-300 sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      {hasError && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ExclamationCircleIcon
            className="h-5 w-5 text-red-500"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};
export function PostInput({
  placeholder = "",
  defaultValue = "",
  name,
}: {
  placeholder?: string;
  defaultValue?: string;
  name: string;
}) {
  const [textinput, changeTextinput] = useState(defaultValue);
  return (
    <Tab.Group>
      {({ selectedIndex }) => (
        <>
          <Tab.List className="flex items-center gap-2">
            {[{label: "Write"}, {label: "Preview"}].map(({ label }) => (
              <Tab
                key={label}
                className={({ selected }) =>
                  classNames(
                    selected
                      ? "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:text-gray-200"
                      : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                      "rounded-md border border-transparent px-3 py-1.5 text-sm font-medium dark:bg-gray-800"
                  )
                }
              >
                {label}
              </Tab>
            ))}

            {/* These buttons are here simply as examples and don't actually do anything. */}
            {selectedIndex === 0 ? (
              <div className="ml-auto flex items-center space-x-5">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Insert link</span>
                    <LinkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Insert code</span>
                    <CodeIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Mention someone</span>
                    <AtSymbolIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : null}
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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:text-sm"
                  value={textinput}
                  onChange={(e) => changeTextinput(e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel className="-m-0.5 rounded-lg p-0.5">
              <div className="border-b">
                <div className="mx-px mt-px px-3 pt-2 pb-12 text-sm leading-5 text-gray-800">
                  {/* FIXME */ "Preview content will render here."}
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </>
      )}
    </Tab.Group>
  );
}
