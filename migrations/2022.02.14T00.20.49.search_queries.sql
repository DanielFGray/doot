create function create_post(v_title text, v_body text, v_tags tag[], v_user_id uuid) returns uuid as $$
  with create_post as (
    insert into posts (title, body, tags, user_id)
    values (v_title, v_body, v_tags, v_user_id)
    returning post_id
  )
  insert into posts_votes (vote, user_id, post_id)
  values ('up', v_user_id, (select post_id from create_post))
  returning post_id
$$ language sql volatile;

create function create_comment(v_post_id uuid, v_body text, v_user_id uuid) returns uuid as $$
  with create_comment as (
    insert into posts_comments (post_id, body, user_id)
    values (v_post_id, v_body, v_user_id)
    returning comment_id
  )
  insert into comments_votes (vote, user_id, comment_id)
  values ('up', v_user_id, (select comment_id from create_comment))
  returning comment_id
$$ language sql volatile;

create function score_post(v_post_id uuid) returns int as $$
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

create function post_popularity(comments bigint, score int, created_at timestamptz) returns float as $$
  select
    (1.2 * comments + score - 1) /
    pow((extract(days from created_at) * 24 + extract(hours from created_at) + 2), 1.8) as weight
$$ language sql;

create function comment_count(v_post_id uuid) returns bigint as $$
  select
    count(1)
  from
    posts_comments
  where
    post_id = v_post_id
$$ language sql stable;

create type tag_listing as (
  post_id uuid,
  title text,
  username citext,
  tags tag[],
  score int,
  comment_count int,
  created_at timestamptz,
  updated_at timestamptz,
  popularity float,
  current_user_voted vote_type
);

create function new_posts(v_current_user uuid default null) returns setof tag_listing as $$
  select
    p.post_id,
    title,
    username,
    tags,
    score,
    comment_count,
    p.created_at,
    p.updated_at,
    post_popularity(comment_count, score, p.created_at) as popularity,
    vote as current_user_voted
  from
    posts p
      join users u using (user_id)
      left join posts_votes v on (p.post_id = v.post_id and v.user_id = v_current_user),
    lateral score_post(p.post_id) as score,
    lateral comment_count(p.post_id)
  order by
    p.created_at
$$ language sql stable;

create function top_posts(v_current_user uuid default null) returns setof tag_listing as $$
  select
    p.post_id,
    title,
    username,
    tags,
    score,
    comment_count,
    p.created_at,
    p.updated_at,
    post_popularity(comment_count, score, p.created_at) as popularity,
    vote as current_user_voted
  from
    posts p
      join users u using (user_id)
      left join posts_votes v on (p.post_id = v.post_id and v.user_id = v_current_user),
    lateral score_post(p.post_id) as score,
    lateral comment_count(p.post_id)
  order by
    popularity desc
$$ language sql stable;

create function tag_listing(v_tags tag[], v_current_user uuid default null) returns setof tag_listing as $$
  select
    p.post_id,
    title,
    username,
    tags,
    score,
    comment_count,
    p.created_at,
    p.updated_at,
    post_popularity(comment_count, score, p.created_at) as popularity,
    vote as current_user_voted
  from
    posts p
      join users u using (user_id)
      left join posts_votes v on (p.post_id = v.post_id and v.user_id = v_current_user),
    lateral score_post(p.post_id) as score,
    lateral comment_count(p.post_id)
  where
    tags && v_tags
$$ language sql stable;

create type search_results as (
  post_id uuid,
  title text,
  body text,
  username citext,
  tags tag[],
  score int,
  comment_count int,
  created_at timestamptz,
  updated_at timestamptz,
  rank float,
  popularity float,
  current_user_voted vote_type
);

create function search_posts(query text, v_current_user uuid default null) returns setof search_results as $$
  select
    p.post_id,
    ts_headline(title, q, 'StartSel = {{{, StopSel = }}}') as title,
    ts_headline(body, q, 'StartSel = {{{, StopSel = }}}') as body,
    username,
    tags,
    points,
    comment_count,
    p.created_at,
    p.updated_at,
    ts_rank(search, q) as rank,
    post_popularity(comment_count, points, p.created_at) as popularity,
    vote as current_user_voted
  from
    posts p
      join users u using (user_id)
      left join posts_votes v on (p.post_id = v.post_id and v.user_id = v_current_user),
    websearch_to_tsquery(query) q,
    lateral score_post(p.post_id) as points,
    lateral comment_count(p.post_id)
  where
    search @@ q
$$ language sql;

create type post_with_comments as (
  post_id uuid,
  tags tag[],
  title text,
  body text,
  username citext,
  score bigint,
  created_at timestamptz,
  updated_at timestamptz,
  current_user_voted vote_type,
  comment_count bigint,
  comments jsonb
);

create function get_post_with_comments(v_post_id uuid, v_current_user uuid default null) returns setof post_with_comments as $$
  select
    p.post_id,
    tags,
    title,
    p.body,
    username,
    score,
    p.created_at,
    p.updated_at,
    vote as current_user_voted,
    comment_count,
    comments
  from
    posts p
      join users u using (user_id)
      left join posts_votes pv on (pv.post_id = p.post_id and pv.user_id = v_current_user),
    lateral score_post(p.post_id) as score,
    lateral comment_count(p.post_id),
    lateral (
      select
        coalesce(jsonb_agg(comments), '[]') as comments
      from (
        select
          jsonb_build_object(
            'comment_id', pc.comment_id,
            'body', pc.body,
            'username', cu.username,
            'score', (
              select
                coalesce(sum(case vote
                  when 'up' then 1
                  when 'down' then -1
                end), 0) as score
              from comments_votes cv
              where cv.comment_id = pc.comment_id
            ),
            'created_at', pc.created_at,
            'updated_at', pc.updated_at,
            'current_user_voted', cv.vote
          ) as comments
        from
          posts_comments pc
            join users cu using (user_id)
            left join comments_votes cv on (cv.comment_id = pc.comment_id and cv.user_id = v_current_user)
        where
          pc.post_id = p.post_id
      ) as comments
    ) as comments
  where
    p.post_id = v_post_id
$$ language sql stable;

create function users_posts(v_username text, v_current_user uuid default null) returns setof tag_listing as $$
  select
    p.post_id,
    title,
    username,
    tags,
    score,
    comment_count,
    p.created_at,
    p.updated_at,
    post_popularity(comment_count, score, p.created_at) as popularity,
    vote as current_user_voted
  from posts p
    join users u using(user_id)
    left join posts_votes pv on (pv.post_id = p.post_id and pv.user_id = v_current_user),
  lateral score_post(p.post_id) score,
  lateral comment_count(p.post_id)
  where
    u.username = v_username
  order by
    p.created_at desc
$$ language sql stable;

create type tag_count as (
  tag tag,
  count bigint
);

create function top_tags() returns setof tag_count as $$
  with tag_list as (
    select
      unnest(tags) as tag
    from posts
  )
  select
    tag,
    count(1)
  from tag_list
  group by tag
  order by count desc
$$ language sql stable;
