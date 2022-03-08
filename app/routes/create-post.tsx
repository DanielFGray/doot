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

  const tagList = tags.split(/,\s*/)
  if (tagList.length > 5 || tagList.length < 1) {
    return json({ fieldErrors: { tags: 'post must have between 1 and 5 tags' } })
  }

  // const fields = { title, body, user_id, tags };

  try {
    const post = await db.maybeOne<{ post_id: string }>(sql`
      select * from create_post(
        ${title},
        ${body},
        ${sql.array(tagList, sql`citext[]`)},
        ${user_id}
      ) as post_id
    `);
    console.log({post})
    if (!post) throw badRequest({ formError: "Something went wrong." });
    return redirect(`/p/${post.post_id}`);
  } catch (e) {
    console.log(e);
    throw badRequest({ formError: "Something went wrong." });
  }
};
