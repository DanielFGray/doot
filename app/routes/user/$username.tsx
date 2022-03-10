import { useLoaderData, LoaderFunction, json, useParams } from "remix";
import { db, sql } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import { Layout } from "~/components/Layout";
import { Post } from "~/components/PostCard";

type UserPost = {
  post_id: string;
  title: string;
  username: string;
  tags: string[];
  score: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  current_user_voted: null | "up" | "down";
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
        select *
        from
          users_posts(${params.username}, ${user?.user_id ?? null})
        order by
          created_at desc
      `,
    );
    return json<LoaderData>({ user, posts });
  } catch (e) {
    console.error(e);
    return json<LoaderData>({ user });
  }
};

export default function Index() {
  const { user, posts } = useLoaderData<LoaderData>();
  const { username } = useParams();
  return (
    <Layout user={user}>
      <div className="mx-16">
        {posts && posts.length > 0 ? (
          <>
            <h1 className="text-xl font-bold">posts by {username}</h1>
            {posts.map(post => (
              <Post key={post.post_id} currentUser={user} {...post} />
            ))}
          </>
        ) : (
          <div>no posts by {username}</div>
        )}
      </div>
    </Layout>
  );
}
