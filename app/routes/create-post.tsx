import {
  LoaderFunction,
  ActionFunction,
  Form,
  redirect,
  json,
  useLoaderData,
} from "remix";
import { Layout } from "~/components/Layout";
import { PostInput } from "~/components/Forms";
import { db, sql } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    tags: string[];
    title: string;
    body: string;
  };
};

const badRequest = (data: { formError: string } | { message: string }) =>
  json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);

  if (!user)
    throw badRequest({
      message: "You must be logged in to create a new post",
    });
  const { user_id } = user;
  const form = await request.formData();
  const tags = form.get("tags");
  const title = form.get("title");
  const body = form.get("body");
  if (
    typeof tags !== "string" ||
    typeof title !== "string" ||
    typeof body !== "string"
  ) {
    throw badRequest({
      formError: "Form not submitted correctly.",
    });
  }

  // const fields = { title, body, user_id, tags };

  try {
    const post = await db.maybeOne<{ post_id: string }>(sql`
      with create_post as (
        insert into posts (tags, title, body, user_id)
        values (${sql.array(tags.split(/,\s*/), sql`citext[]`)}, ${title}, ${body}, ${user_id})
        returning post_id
      )
      insert into posts_votes (vote, user_id, post_id)
      values (
        'up',
        ${user_id},
        (select post_id from create_post)
      ) returning post_id
    `);
    if (!post) throw badRequest({ formError: "Something went wrong." });
    return redirect(`/p/${post.post_id}`);
  } catch (e) {
    console.log(e);
    throw badRequest({ formError: "Something went wrong." });
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user)
    throw badRequest({
      message: "You must be logged in to create a new post",
    });
  return { user };
};

export default function NewPost() {
  const { user } = useLoaderData();
  return (
    <Layout user={user}>
      <h1 className="text-xl font-bold">New Post</h1>
      <Form method="post" className="p-4">
        <div>
          <label>
            Board <input type="text" name="board_id" />
          </label>
        </div>
        <div>
          <label>
            Title <input type="text" name="title" />
          </label>
        </div>
        <div>
          <label>
            Body
            <PostInput name="body" />
          </label>
        </div>
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Submit
        </button>
      </Form>
    </Layout>
  );
}
