import type { ActionFunction } from "remix";
import { Form, useActionData, json, useSearchParams } from "remix";
import { Layout } from "~/components/Layout";
import { Input, Button } from "~/components/Forms";
import { createUserSession, login } from "~/utils/session.server";

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return "Usernames must be at least 3 characters long";
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return "Passwords must be at least 6 characters long";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  return (
    <Layout user={null}>
      <Form
        method="post"
        className="space-y-8 divide-y dark:divide-gray-800 divide-gray-200 p-8"
        aria-describedby={
          actionData?.formError ? "form-error-message" : undefined
        }
      >
        <h3 className="text-lg dark:text-gray-50 font-medium leading-6 text-gray-900">Log in</h3>
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label
            htmlFor="username-input"
            className="block text-sm font-medium dark:text-gray-300 text-gray-700 sm:mt-px sm:pt-2"
          >
            Username or Email
          </label>
          <div className="mt-1 sm:col-span-2 sm:mt-0">
            <div className="relative mt-1 rounded-md shadow-sm">
              <Input
                type="text"
                id="username-input"
                name="username"
                defaultValue={actionData?.fields?.username}
                hasError={Boolean(actionData?.fieldErrors?.username)}
              />
            </div>
            {actionData?.fieldErrors?.username && (
              <p className="mt-2 text-sm text-red-600" id="username-error">
                {actionData?.fieldErrors.username}
              </p>
            )}
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
          <label
            htmlFor="password-input"
            className="block text-sm font-medium dark:text-gray-300 text-gray-700 sm:mt-px sm:pt-2"
          >
            Password
          </label>
          <div className="mt-1 sm:col-span-2 sm:mt-0">
            <div className="relative mt-1 rounded-md shadow-sm">
              <Input
                type="password"
                id="password-input"
                name="password"
                defaultValue={actionData?.fields?.password}
                hasError={Boolean(actionData?.fieldErrors?.password)}
              />
            </div>
            {actionData?.fieldErrors?.password && (
              <p className="mt-2 text-sm text-red-600" id="password-error">
                {actionData?.fieldErrors.password}
              </p>
            )}
          </div>
        </div>
        <div className="pt-5">
          <div id="form-error-message">
            {actionData?.formError ? (
              <p className="form-validation-error" role="alert">
                {actionData?.formError}
              </p>
            ) : null}
          </div>{" "}
          <div className="flex justify-end">
            <Button type="submit">Submit</Button>
            <input
              type="hidden"
              name="redirectTo"
              value={searchParams.get("redirectTo") ?? undefined}
            />
          </div>
        </div>
      </Form>
    </Layout>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/";
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return badRequest({
      formError: "Form not submitted correctly.",
    });
  }

  const fields = { username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  const user = await login({ username, password });
  if (!user) {
    return badRequest({
      fields,
      formError: "Username/Password combination is incorrect",
    });
  }
  return createUserSession(user.id, redirectTo);
};
