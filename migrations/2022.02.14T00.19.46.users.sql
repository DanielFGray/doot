create table users (
  user_id uuid primary key default gen_random_uuid(),
  username citext unique not null check (length(username) between 3 and 64),
  password text not null,
  email citext unique,
  last_login_at timestamptz not null default now(),
  failed_password_attempts int not null default 0,
  first_failed_password_attempt timestamptz,
  reset_password_token text,
  reset_password_token_generated timestamptz,
  failed_reset_password_attempts int not null default 0,
  first_failed_reset_password_attempt timestamptz,
  delete_account_token text,
  delete_account_token_generated timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sessions (
  session_id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  expires timestamptz not null
);

create trigger _100_timestamps
  before insert or update on users
  for each row
  execute procedure tg__update_timestamps();
