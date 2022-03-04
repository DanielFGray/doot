import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/solid";
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
        "inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
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
  hasError?: undefined | null | boolean,
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
          "block w-full rounded-md pr-10 focus:outline-none sm:text-sm"
        )}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${name}-error` : undefined
        }
      />
      {hasError && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ExclamationCircleIcon
            className="w-5 h-5 text-red-500"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};
