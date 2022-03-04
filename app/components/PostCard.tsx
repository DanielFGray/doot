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
  board_id,
  score,
  created_at,
  comment_count,
  current_user_voted,
}: BoardListing) {
  const fetcher = useFetcher();
  return (
    <div className="mb-4">
      <div className="flex flex-row">
        <fetcher.Form
          method="post"
          action="/vote"
          className="flex flex-col justify-around block text-center"
        >
          <input type="hidden" name="id" value={post_id} />
          <input type="hidden" name="type" value="post" />
          {current_user_voted === "up" ? (
            <button name="vote" value="null" type="submit">
              <ThumbUpSolid className="w-5 h-5 text-blue-700" />
            </button>
          ) : (
            <button name="vote" value="up" type="submit">
              <ThumbUpOutline className="w-5 h-5 text-gray-400" />
            </button>
          )}
          {score}
          {current_user_voted === "down" ? (
            <button name="vote" value="null" type="submit">
              <ThumbDownSolid className="w-5 h-5 text-red-700" />
            </button>
          ) : (
            <button name="vote" value="down" type="submit">
              <ThumbDownOutline className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </fetcher.Form>
        <div className="flex flex-col justify-center ml-2">
          <Link to={`/b/${board_id}/${post_id}`} className="text-lg text-bold">
            {title}
          </Link>
          <div className="text-sm text-gray-600">
            by <span className="text-gray-900">{username}</span>
            {" in "}
            <span className="text-gray-900">{board_id}</span>{" "}
            <span className="text-gray-900">{ago(new Date(created_at))}</span>
            {" has "}
            <span className="text-gray-900">
              {comment_count === 0 ? "no" : comment_count}{" "}
              {comment_count === 1 ? "comment" : "comments"}
            </span>
          </div>
        </div>
      </div>
      {body && <div className="prose">{body}</div>}
    </div>
  );
}
