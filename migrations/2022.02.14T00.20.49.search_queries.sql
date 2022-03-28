create or replace function create_post(
  v_title text,
  v_body text,
  v_tags tag[],
  v_user_id uuid
) returns uuid as $$
  with create_post as (
    insert into posts (title, body, tags, user_id)
    values (v_title, v_body, v_tags, v_user_id)
    returning post_id
  )
  insert into posts_votes (vote, user_id, post_id)
  values ('up', v_user_id, (select post_id from create_post))
  returning post_id
$$ language sql volatile;

create or replace function create_comment(
  v_post_id uuid,
  v_body text,
  v_user_id uuid,
  v_parent_id uuid
) returns uuid as $$
  with create_comment as (
    insert into posts_comments (post_id, parent_id, body, user_id)
    values (v_post_id, v_parent_id, v_body, v_user_id)
    returning comment_id
  )
  insert into comments_votes (vote, user_id, comment_id)
  values ('up', v_user_id, (select comment_id from create_comment))
  returning comment_id
$$ language sql volatile;

create or replace function score_post(
  v_post_id uuid
) returns int as $$
  select
    coalesce(sum(
      case vote
        when 'up' then 1
        when 'down' then -1
      end
    ), 0) as score
  from
    posts_votes v
  where
    v.post_id = v_post_id
$$ language sql stable;

create or replace function post_popularity(
  score bigint,
  created_at timestamptz,
  comments int default 0
) returns float as $$
  -- https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
  select
    (1.2 * comments + score + 1) /
    pow((extract(epoch from (now() - created_at)) / 3600) + 2, 1.8)
$$ language sql stable;

create or replace function comment_count(
  v_post_id uuid
) returns int as $$
  select
    count(1)
  from
    posts_comments
  where
    post_id = v_post_id
$$ language sql stable;

create type post_info as (
  "postId" uuid,
  title text,
  username citext,
  tags tag[],
  score int,
  "commentCount" int,
  "createdAt" timestamptz,
  "updatedAt" timestamptz,
  popularity float,
  "currentUserVoted" vote_type
);

create or replace function new_posts(
  v_current_user uuid default null
) returns setof post_info as $$
  select
    p.post_id,
    title,
    username,
    tags,
    score,
    comment_count,
    p.created_at,
    p.updated_at,
    post_popularity(score, p.created_at, comment_count) as popularity,
    v.vote as current_user_voted
  from
    posts p
    join users u using (user_id)
    left join posts_votes v on p.post_id = v.post_id and v.user_id = v_current_user,
    score_post(p.post_id) score,
    comment_count(p.post_id)
  order by
    p.created_at
$$ language sql stable;

create or replace function top_posts(
  v_current_user uuid default null
) returns setof post_info as $$
  select
    p.post_id,
    title,
    username,
    tags,
    score,
    comment_count,
    p.created_at,
    p.updated_at,
    post_popularity(score, p.created_at, comment_count) as popularity,
    v.vote as current_user_voted
  from
    posts p
    join users u using (user_id)
    left join posts_votes v on p.post_id = v.post_id and v.user_id = v_current_user,
    score_post(p.post_id) score,
    comment_count(p.post_id)
  order by
    popularity desc
$$ language sql stable;

create or replace function tag_listing(
  v_tags tag[],
  v_current_user uuid default null
) returns setof post_info as $$
  select
    p.post_id,
    title,
    username,
    tags,
    score,
    comment_count,
    p.created_at,
    p.updated_at,
    post_popularity(score, p.created_at, comment_count) as popularity,
    v.vote as current_user_voted
  from
    posts p
    join users u using (user_id)
    left join posts_votes v on p.post_id = v.post_id and v.user_id = v_current_user,
    score_post(p.post_id) score,
    comment_count(p.post_id)
  where
    tags && v_tags
$$ language sql stable;

create type search_results as (
  "postId" uuid,
  title text,
  body text,
  username citext,
  tags tag[],
  score int,
  "commentCount" int,
  "createdAt" timestamptz,
  "updatedAt" timestamptz,
  popularity float,
  "currentUserVoted" vote_type,
  rank float
);

create or replace function search_posts(
  query text,
  v_current_user uuid default null
) returns setof search_results as $$
  select
    p.post_id,
    ts_headline(title, q, 'StartSel = <dootHighlight>, StopSel = </dootHighlight>') as title,
    ts_headline(body, q, 'StartSel = <dootHighlight>, StopSel = </dootHighlight>') as body,
    username,
    tags,
    points,
    comment_count,
    p.created_at,
    p.updated_at,
    post_popularity(points, p.created_at, comment_count) as popularity,
    v.vote as current_user_vote,
    ts_rank(search, q) as rank
  from posts p
    join users u using (user_id)
    left join posts_votes v on p.post_id = v.post_id and v.user_id = v_current_user,
    websearch_to_tsquery(query) q,
    score_post(p.post_id) as points,
    comment_count(p.post_id)
  where
    search @@ q
$$ language sql;

create or replace function users_posts(
  v_username text,
  v_current_user uuid default null
) returns setof post_info as $$
  select
    p.post_id as "postId",
    title,
    username,
    tags,
    score,
    comment_count as "commentCount",
    p.created_at as "createdAt",
    p.updated_at as "updatedAt",
    post_popularity(score, p.created_at, comment_count) as popularity,
    pv.vote as "currentUserVotedd"
  from posts p
    join users u using(user_id)
    left join posts_votes pv on pv.post_id = p.post_id and pv.user_id = v_current_user,
    score_post(p.post_id) score,
    comment_count(p.post_id)
  where
    u.username = v_username
  order by
    p.created_at desc
$$ language sql stable;

create or replace view top_tags as
  with tag_list as (
    select unnest(tags) as tag
    from posts
  )
  select
    tag,
    count(1) as count
  from tag_list
  group by tag
  order by count desc;

create type post_with_comments as (
  post_id uuid,
  tags tag[],
  title text,
  body text,
  username citext,
  score int,
  "createdAt" timestamptz,
  "updatedAt" timestamptz,
  "currentUserVoted" vote_type,
  comment_count int,
  comments json
);

create type comment_info as (
  "commentId" uuid,
  "postId" uuid,
  body text,
  username citext,
  score int,
  depth int,
  "createdAt" timestamptz,
  "updatedAt" timestamptz,
  popularity float,
  "currentUserVoted" vote_type,
  children json
);

create or replace function comment_tree(
  v_comment_id uuid,
  v_current_user uuid default null,
  depth int default 0
) returns comment_info as $$
  select
    c.comment_id as "commentId",
    c.post_id as "postId",
    body,
    u.username,
    score,
    depth + 1 as depth,
    c.created_at as "createdAt",
    c.updated_at as "updatedAt",
    post_popularity(score, c.created_at) as popularity,
    cv.vote as "currentUserVoted",
    children
  from posts_comments c
    left join users u using(user_id)
    left join comments_votes cv on cv.comment_id = c.comment_id and cv.user_id = v_current_user,
    lateral (
      select
        coalesce(sum(case vote
          when 'up' then 1
          when 'down' then -1
        end), 0) as score
      from comments_votes cv
      where cv.comment_id = c.comment_id
    ) as get_score,
    lateral (
      select coalesce(json_agg(comment_tree(comment_id, v_current_user, depth + 1)), '[]') as children
      from posts_comments
      where parent_id = c.comment_id
    ) as get_children
  where
    c.comment_id = v_comment_id
$$ language sql stable;

create or replace function get_post_with_comments(
  v_post_id uuid,
  v_current_user uuid default null
) returns setof post_with_comments as $$
  select
    p.post_id,
    tags,
    title,
    p.body,
    username,
    score,
    p.created_at,
    p.updated_at,
    pv.vote as current_user_voted,
    comment_count,
    comments
  from
    posts p
    left join users u using (user_id)
    left join posts_votes pv on pv.post_id = p.post_id and pv.user_id = v_current_user,
    lateral score_post(p.post_id) score,
    lateral comment_count(p.post_id),
    lateral (
      select coalesce(json_agg(comment_tree(comment_id, v_current_user)), '[]') as comments
      from posts_comments
      where parent_id is null and post_id = v_post_id
    ) as get_comments
  where
    p.post_id = v_post_id
$$ language sql stable;
