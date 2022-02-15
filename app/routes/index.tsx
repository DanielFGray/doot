import { Link, useLoaderData, LoaderFunction } from "remix";
import { getUser } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return { user };
};

export default function Index() {
  const data = useLoaderData();
  return (
    <>
      <header>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {data.user ? (
            <span>
              <Link to="/new">New Post</Link>
            </span>
          ) : null}
        </ul>
        {data.user ? (
          <div>
            <span>
              Hi <b>{data.user.username}</b>!{" "}
            </span>
            <form action="/logout" method="post" className="inline">
              <button type="submit" className="button">
                Logout
              </button>
            </form>
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            {" | "}
            <Link to="/register">Register</Link>
          </>
        )}
      </header>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
