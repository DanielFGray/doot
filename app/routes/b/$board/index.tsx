import { Link, useLoaderData, useParams, LoaderFunction, json } from "remix";
import { BoardCard } from "~/components/BoardInfo";
import { Post } from "~/components/PostCard";
import { db, sql } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import type { BoardInfo, BoardListing } from "~/types";
import { Header } from "~/components/Header";

type LoaderData = {
  board_info: null | BoardInfo;
  posts: BoardListing[];
  user: {
    user_id: string;
    username: string;
  } | null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request);
  try {
    const { data } = await db.one<{
      data: { board_info: BoardInfo; posts: BoardListing[] };
    }>(sql`
       select jsonb_build_object(
         'board_info', (
           select to_jsonb(b.*)
           from boards b
           where board_id = ${params.board!}
         ),
         'posts', (
           select coalesce(jsonb_agg(p.*), '[]')
           from (
             select *
             from board_listing(${params.board!}, ${user?.user_id ?? null})
             order by popularity desc
           ) p
         )
       ) as data
    `);
    return json<LoaderData>({ user, ...data });
  } catch (e) {
    return json<LoaderData>({ user: null, board_info: null, posts: [] });
  }
};

export default function Index() {
  const { user, board_info, posts } = useLoaderData<LoaderData>();
  return (
    <>
      <Header user={user} />
      <div className="mx-16">
        {board_info ? (
          <>
            <BoardCard {...board_info} />
            {posts.map((p) => (
              <Post key={p.post_id} {...p} />
            ))}
          </>
        ) : (
          "board does not exist"
        )}
      </div>
    </>
  );
}
