import { Link, useFetcher } from "remix";
import ago from "s-ago";
import {
  ThumbDownIcon as ThumbDownOutline,
  ThumbUpIcon as ThumbUpOutline,
} from "@heroicons/react/outline";
import {
  ThumbDownIcon as ThumbDownSolid,
  ThumbUpIcon as ThumbUpSolid,
} from "@heroicons/react/solid";
import type { BoardListing } from "~/types";

export function Post({
  post_id,
  title,
  body,
  username,
  tags,
  score,
  created_at,
  comment_count,
  current_user_voted,
  currentUser,
}: BoardListing & {
  currentUser: null | { username: string; user_id: string };
}) {
  const fetcher = useFetcher();
  return (
    <div className="-mx-2 mb-4 overflow-clip rounded-lg bg-gray-50 p-2 p-4 shadow dark:bg-gray-800">
      <div className="flex flex-row dark:text-gray-50">
        <fetcher.Form
          method="post"
          action="/vote"
          className="block flex flex-col justify-around text-center"
        >
          <input type="hidden" name="id" value={post_id} />
          <input type="hidden" name="type" value="post" />
          {current_user_voted === "up" ? (
            <button name="vote" value="null" type="submit">
              <ThumbUpSolid className="h-5 w-5 text-blue-600" />
            </button>
          ) : (
            <button name="vote" value="up" type="submit">
              <ThumbUpOutline className="h-5 w-5 text-gray-400" />
            </button>
          )}
          {score}
          {current_user_voted === "down" ? (
            <button name="vote" value="null" type="submit">
              <ThumbDownSolid className="h-5 w-5 text-red-600" />
            </button>
          ) : (
            <button name="vote" value="down" type="submit">
              <ThumbDownOutline className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </fetcher.Form>
        <div className="ml-2 flex flex-col justify-center">
          <Link
            to={`/p/${post_id}`}
            className="text-bold text-xl text-gray-800 dark:text-gray-50"
          >
            {title}
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {"by "}
            <Link
              to={`/user/${username}`}
              className="text-gray-900 dark:text-gray-50"
            >
              {username}
            </Link>
            {" tagged "}
            <TagList tags={tags} />
            {ago(new Date(created_at))}
            {" has "}
            <Link
              to={`/p/${post_id}`}
              className="text-gray-900 dark:text-gray-50"
            >
              {comment_count === 0 ? "no" : comment_count}{" "}
              {comment_count === 1 ? "comment" : "comments"}
            </Link>
            {body && currentUser && currentUser.username === username && (
              <div>
                <fetcher.Form
                  method="post"
                  action="/post/edit"
                  className="inline"
                >
                  <input type="hidden" name="id" value={post_id} />
                  <button type="submit" className="rounded-md px-1">
                    Edit
                  </button>
                </fetcher.Form>
                <fetcher.Form
                  method="post"
                  action="/post/delete"
                  className="inline"
                >
                  <input type="hidden" name="id" value={post_id} />
                  <button
                    type="submit"
                    className="rounded-md text-red-700"
                  >
                    Delete
                  </button>
                </fetcher.Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="inline-flex flex-row flex-wrap gap-0.5">
      {tags.map((tag) => (
        <Link
          key={tag}
          to={`/t/${tag}`}
          className="inline rounded-lg bg-gray-200 px-2 text-gray-900 dark:bg-gray-700 dark:text-gray-50 border border-gray-200 dark:border-gray-700 hover:border-gray-500"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
