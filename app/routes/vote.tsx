import { ActionFunction, json } from "remix";
import { db, sql } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) throw json("Not logged in", 401);
  const body = await request.formData();
  const vote = body.get("vote");
  const id = body.get("id");
  const type = body.get("type");
  if (typeof vote !== "string" || typeof id !== "string" || typeof type !== "string")
    throw json("Invalid parameters", 400);

  if (type === "post") {
    if (vote === "null") {
      const unvote = await db.any(sql`
        delete from posts_votes
        where user_id = ${user.user_id} and post_id = ${id}
      `);
      console.log({ unvote })
    } else {
      const upsert = await db.any(sql`
        insert into posts_votes (user_id, post_id, vote)
        values (${user.user_id}, ${id}, ${vote})
        on conflict (user_id, post_id) do update set vote = ${vote}
      `);
      console.log({ upsert })
    }
  } else if (type ===  "comment") {
    if (vote === "null") {
      const unvote = await db.any(sql`
        delete from comments_votes
        where user_id = ${user.user_id} and comment_id = ${id}
      `);
      console.log({ unvote })
    } else {
      const upsert = await db.any(sql`
        insert into comments_votes (user_id, comment_id, vote)
        values (${user.user_id}, ${id}, ${vote})
        on conflict (user_id, comment_id) do update set vote = ${vote}
      `);
      console.log({ upsert })
    }
  }
  return null
};
