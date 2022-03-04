import { useFetcher } from "remix";
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
}: {
  comment_id: string;
  body: string;
  username: string;
  user_id: string;
  score: number;
  created_at: string;
  updated_at: string;
  current_user_voted: null | "up" | "down";
}) {
  const fetcher = useFetcher();
  return (
    <div>
      <div className="flex flex-row">
        <div>
          <div>
            <fetcher.Form method="post" action="/vote">
              <input type="hidden" name="id" value={comment_id} />
              <input type="hidden" name="type" value="comment" />

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
          </div>
          <div>
            <a href={`/user/${username}`}>{username}</a>
          </div>
        </div>
        <div>
          <div>{created_at}</div>
          {updated_at !== created_at && <div>{updated_at}</div>}
        </div>
      </div>
      <div className="Comment-body">
        <div className="Comment-body-text">{body}</div>
      </div>
    </div>
  );
}
