import {
  LoaderFunction,
  ActionFunction,
  Form,
  redirect,
  json,
  useLoaderData,
} from "remix";
import { Header } from "~/components/Header";
import { PostInput } from "~/components/PostInput";
import { db, sql } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    board_id: string;
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
  const board_id = form.get("board_id");
  const title = form.get("title");
  const body = form.get("body");
  if (
    typeof board_id !== "string" ||
    typeof title !== "string" ||
    typeof body !== "string"
  ) {
    throw badRequest({
      formError: "Form not submitted correctly.",
    });
  }

  // const fields = { title, body, user_id, board_id };

  try {
    const post = await db.maybeOne<{ post_id: string }>(sql`
      insert into posts (board_id, title, body, user_id)
      values (${board_id}, ${title}, ${body}, ${user_id})
      returning post_id
    `);
    if (!post) throw badRequest({ formError: "Something went wrong." });
    return redirect(`/b/${board_id}/${post.post_id}`);
  } catch (e) {
    if (e.originalError.detail.includes('is not present in table "boards"'))
      throw badRequest({ formError: `board ${board_id} does not exist` });
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
    <div>
      <Header user={user} />
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
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent leading-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </Form>
    </div>
  );
}
