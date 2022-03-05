import { useLoaderData, LoaderFunction, json, useParams } from "remix";
import { db, sql } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import { Header } from "~/components/Header";

type UserPost = {
  post_id: string;
  title: string;
  username: string;
  board_id: string;
  score: number;
  comment_count: number;
  created_at: string;
};

type LoaderData = {
  user: {
    user_id: string;
    username: string;
  } | null;
  posts?: readonly UserPost[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request);
  try {
    const posts = await db.any<UserPost>(
      sql`
        select
          post_id,
          title,
          username,
          board_id,
          score,
          comment_count,
          p.created_at
        from posts p
          join users u using(user_id),
        lateral score_post(p.post_id) score,
        lateral comment_count(p.post_id)
        where
          u.username = ${params.user_id ?? user?.username ?? null}
        order by
          p.created_at desc
      `
    );
    return json<LoaderData>({ user, posts });
  } catch (e) {
    console.error(e);
    return json<LoaderData>({ user });
  }
};

export default function Index() {
  const { user_id } = useParams();
  const { user, posts } = useLoaderData<LoaderData>();
  return (
    <>
      <Header user={user} />
      <div className="mx-16">
        {posts && posts.length > 0 ? (
          <>
            <h1 className="text-xl font-bold">posts by {user_id}</h1>
            {posts.map((post) => (
              <pre key={post.post_id}>{JSON.stringify(post, null, 2)}</pre>
            ))}
          </>
        ) : (
          <div>no posts by {user_id}</div>
        )}
      </div>
    </>
  );
}
