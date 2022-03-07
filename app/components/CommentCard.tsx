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

export function Comment({
  comment_id,
  body,
  username,
  score,
  created_at,
  updated_at,
  current_user_voted,
  currentUser,
}: {
  comment_id: string;
  body: string;
  username: string;
  user_id: string;
  score: number;
  created_at: string;
  updated_at: string;
  current_user_voted: null | "up" | "down";
  currentUser: null | { username: string; user_id: string };
}) {
  const fetcher = useFetcher();
  return (
    <div className="flex flex-row">
      <fetcher.Form
        method="post"
        action="/vote"
        className="mr-2 flex flex-col text-center"
      >
        <input type="hidden" name="id" value={comment_id} />
        <input type="hidden" name="type" value="comment" />

        {current_user_voted === "up" ? (
          <button name="vote" value="null" type="submit">
            <ThumbUpSolid className="h-5 w-5 text-blue-700" />
          </button>
        ) : (
          <button name="vote" value="up" type="submit">
            <ThumbUpOutline className="h-5 w-5 text-gray-400" />
          </button>
        )}
        {score}
        {current_user_voted === "down" ? (
          <button name="vote" value="null" type="submit">
            <ThumbDownSolid className="h-5 w-5 text-red-700" />
          </button>
        ) : (
          <button name="vote" value="down" type="submit">
            <ThumbDownOutline className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </fetcher.Form>
      <div>
        <span className="text-sm">
          {ago(new Date(created_at))}
          {updated_at !== created_at && (
            <span className="text-sm text-gray-500">
              (updated {ago(new Date(updated_at))})
            </span>
          )}
          <span className="text-gray-500"> by </span>
          <Link to={`/user/${username}`}>{username}</Link>
        </span>
        <div>{body}</div>
        {currentUser && currentUser.username === username && (
          <div className="text-sm">
            <fetcher.Form
              method="post"
              action="/post/edit"
              className="inline"
            >
              <input type="hidden" name="id" value={comment_id} />
              <button type="submit" className="rounded-md px-1">
                Edit
              </button>
            </fetcher.Form>
            <fetcher.Form
              method="post"
              action="/post/delete"
              className="inline"
            >
              <input type="hidden" name="id" value={comment_id} />
              <button
                type="submit"
                className="ml-2 rounded-md text-red-700"
              >
                Delete
              </button>
            </fetcher.Form>
          </div>
        )}
      </div>
    </div>
  );
}
