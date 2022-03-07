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
      <div className="px-4 py-5 sm:p-6 mx-auto max-w-md text-center shadow-xl dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium dark:text-gray-300 text-gray-900 leading-6">Logout</h3>
        <div className="max-w-xl mt-2 text-sm text-gray-500">
          <p>Are you sure you want to logout?</p>
        </div>
        <form action="/logout" method="post" className="mt-5">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 font-medium dark:bg-red-700 dark:text-red-100 text-red-700 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
          >
            Log out
          </button>
        </form>
      </div>
    </Layout>
  );
}
