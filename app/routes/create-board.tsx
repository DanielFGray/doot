import {
  LoaderFunction,
  ActionFunction,
  useActionData,
  Form,
  redirect,
  json,
  useLoaderData,
} from "remix";
import { Layout } from "~/components/Layout";
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

const badRequest = (data, status = 400) => json(data, { status });

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user)
    throw badRequest("You must be logged in to create a new board", 401);

  const form = await request.formData();
  const board_id = form.get("board_id");
  const description = form.get("description");
  if (typeof board_id !== "string" || typeof description !== "string") {
    throw badRequest({ formError: `Form not submitted correctly.` }, 401);
  }

  // const fields = { user_id: user.user_id, board_id, description };

  const result = await db.maybeOne<{ board_id: string }>(sql`
    with insert_board as (
      insert into boards (board_id, description)
      values (${board_id}, ${description})
    )
    insert into board_admins (board_id, user_id)
    values (${board_id}, ${user.user_id})
    returning board_id
  `);
  if (!result) throw badRequest("already exists", 400);
  return redirect(`/b/${result.board_id}`);
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user)
    throw badRequest("You must be logged in to create a new board", 401);
  return { user };
};

export default function NewBoard() {
  const { user } = useLoaderData();
  return (
    <Layout user={user} >
      <h1>Board</h1>
      <Form method="post">
        <div>
          <label>
            Board Name <input type="text" name="board_id" />
          </label>
        </div>
        <div>
          <label>
            Body
            <textarea name="description"></textarea>
          </label>
        </div>
        <button type="submit">Submit</button>
      </Form>
    </Layout>
  );
}
