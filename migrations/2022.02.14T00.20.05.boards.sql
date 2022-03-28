create domain tag as citext check(length(value) between 1 and 64);
create type vote_type as enum ('down', 'up');

create table posts (
  post_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users,
  title text check (length(title) between 1 and 140),
  body text check (length (body) between 1 and 2000),
  tags tag[] not null check(array_length(tags, 1) between 1 and 5),
  search tsvector not null generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on posts (user_id);
create index on posts using gin (tags);
create index on posts (created_at desc);

create table posts_votes (
  post_id uuid not null references posts on delete cascade,
  user_id uuid not null references users,
  vote vote_type not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table posts_comments (
  comment_id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts on delete cascade,
  user_id uuid references users on delete set null,
  parent_id uuid references posts_comments on delete cascade,
  body text not null,
  search tsvector not null generated always as (to_tsvector('english', body)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on posts_comments (post_id);
create index on posts_comments (user_id);
create index on posts_comments (parent_id);
create index on posts_comments (created_at desc);

create table comments_votes (
  comment_id uuid not null references posts_comments on delete cascade,
  user_id uuid not null references users,
  vote vote_type not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
