import {
  Link,
  useLoaderData,
  LoaderFunction,
  Form,
  ActionFunction,
  json,
} from "remix";
import { BoardCard } from "~/components/BoardInfo";
import { Comment } from "~/components/CommentCard";
import { Post } from "~/components/PostCard";
import { db, sql } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import type { BoardInfo, BoardListing, CommentInfo } from "~/types";
import { Header } from "~/components/Header";
import { PostInput } from "~/components/PostInput";
import { Button } from "~/components/Forms";

type DbRequest = {
  data: {
    board_info: BoardInfo;
    post: BoardListing & {
      comments: CommentInfo[];
    };
  };
};

type LoaderData = DbRequest["data"] & {
  user: {
    user_id: string;
    username: string;
  } | null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request);
  const { data } = await db.one<DbRequest>(
    sql`
      select jsonb_build_object(
        'board_info', (
          select to_json(b.*)
          from boards b
          where board_id = ${params.board!}
        ),
        'post', get_post_with_comments(
          ${params.post!},
          ${user?.user_id ?? null}
        )
      ) as data
    `
  );
  return json<LoaderData>({ user, ...data });
};

export default function Index() {
  const data = useLoaderData<LoaderData>();

  const {
    board_info,
    post: { comments, ...post },
  } = data;
  return (
    <>
      <Header user={data.user} />
      <div className="mx-16">
        {data.post ? (
          <>
            <Link to={`/b/${board_info.board_id}`}>
              <BoardCard {...board_info} />
            </Link>
            <Post {...post} />
            <div className="flex flex-col mt-4 gap-4">
              {comments?.map((c) => (
                <Comment key={c.comment_id} {...c} />
              ))}
            </div>
            <Form method="post" className="mt-4">
              <PostInput name="body" placeholder="Body" />
              <div className="flex justify-end mt-2">
                <Button type="submit">Post</Button>
              </div>
            </Form>
          </>
        ) : (
          <div>post not found</div>
        )}
      </div>
    </>
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
    insert into posts_comments (user_id, post_id, body)
    values (${user.user_id}, ${params.post!}, ${body})
    returning comment_id
  `);
  return json(comment);
};
