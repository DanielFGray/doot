import {
  Link,
  useLoaderData,
  LoaderFunction,
  Form,
  ActionFunction,
  json,
} from "remix";
import { Comment } from "~/components/CommentCard";
import { Post } from "~/components/PostCard";
import { db, sql } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import type { BoardInfo, BoardListing, CommentInfo } from "~/types";
import { Layout } from "~/components/Layout";
import { PostInput, Button } from "~/components/Forms";

type DbRequest = BoardListing & {
  comments: CommentInfo[];
};

type LoaderData = {
  post: DbRequest;
  user: {
    user_id: string;
    username: string;
  } | null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request);
  const post = await db.one<DbRequest>(
    sql`select * from get_post_with_comments(
      ${params.post!},
      ${user?.user_id ?? null}
    )`
  );
  return json<LoaderData>({ user, post });
};

export default function Index() {
  const {
    user,
    post: { comments, ...post },
  } = useLoaderData<LoaderData>();
  return (
    <Layout user={user}>
      {post ? (
        <>
          <Post {...post} currentUser={user} />
          <div className="mt-4 flex flex-col gap-4">
            {comments?.map((c) => (
              <Comment key={c.comment_id} {...c} currentUser={user} />
            ))}
          </div>
          {user && (
            <Form method="post" className="mt-4">
              <PostInput name="body" placeholder="Body" />
              <div className="mt-2 flex justify-end">
                <Button type="submit">Post</Button>
              </div>
            </Form>
          )}
        </>
      ) : (
        <div>post not found</div>
      )}
    </Layout>
  );
}

export const action: ActionFunction = async ({ request, params }) => {
  const user = await getUser(request);

  if (!user) {
    throw json(
      { message: "you must be logged in to do that" },
      { status: 401 }
    );
  }
  const formData = await request.formData();
  const body = formData.get("body");

  if (typeof body !== "string") {
    return json({ message: "invalid body type" }, { status: 400 });
  }

  const comment = await db.one<{ comment_id: string }>(sql`
    with create_comment as (
      insert into posts_comments (user_id, post_id, body)
      values (${user.user_id}, ${params.post!}, ${body})
      returning comment_id
    )
    insert into comments_votes (vote, user_id, comment_id)
    values (
      'up',
      ${user.user_id},
      (select comment_id from create_comment)
    ) returning comment_id
  `);
  return json(comment);
};
