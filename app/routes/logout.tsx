import type { ActionFunction, LoaderFunction } from "remix";
import { redirect, useLoaderData } from "remix";
import { Layout } from "~/components/Layout";
import { getUser, logout } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) return redirect("/");
  return { user };
};

export default function Logout() {
  const { user } = useLoaderData();
  return (
    <Layout user={user}>
      <div className="mx-auto max-w-md rounded-lg px-4 py-5 text-center shadow-xl dark:bg-gray-800 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">Logout</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Are you sure you want to logout?</p>
        </div>
        <form action="/logout" method="post" className="mt-5">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:text-red-100 sm:text-sm"
          >
            Log out
          </button>
        </form>
      </div>
    </Layout>
  );
}
