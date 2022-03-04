import argon from "argon2";
import { createSessionStorage, json, redirect, SessionData } from "remix";
import { db, sql } from "./db.server";

const sessionSecret = process.env.SECRET;
if (!sessionSecret) {
  throw new Error("environment variable SECRET must be set");
}

export async function register({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}): Promise<{
  user_id: string;
  username: string;
}> {
  const passwordHash = await argon.hash(password);
  try {
    const user = await db.one<{ user_id: string; username: string }>(sql`
      insert into users (username, email, password)
      values (${username}, ${email}, ${passwordHash})
      returning user_id, username
    `);
    return user;
  } catch (err) {
    if (err.originalError?.code === "23505") {
      throw new Response(
        { formError: "username or email already exists" },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const user = await db.maybeOne<{
    user_id: string;
    password: string;
    username: string;
  }>(
    username.includes("@")
      ? sql`select user_id, username, password from users where email = ${username}`
      : sql`select user_id, username, password from users where username = ${username}`
  );
  if (!user) return null;
  if (!(await argon.verify(user.password, password))) return null;
  return { id: user.user_id, username };
}

const storage = createSessionStorage({
  async createData(data, expires) {
    const result = await db.maybeOne<{ session_id: string }>(sql`
      insert into sessions (data, expires)
      values (${JSON.stringify(data)}, ${expires?.toJSON() ?? null})
      returning session_id
    `);
    return result?.session_id;
  },
  async readData(sessionId) {
    const data = await db.maybeOne<{ data: SessionData }>(sql`
      select data
      from sessions
      where session_id = ${sessionId}
        and expires > now()
    `);
    return data?.data ?? null;
  },
  async updateData(id, data, expires) {
    await db.query(sql`
      update sessions
        set data = ${JSON.stringify(data)},
        expires = ${expires?.toJSON() ?? null}
      where session_id = ${id}
    `);
  },
  async deleteData(id) {
    await db.query(sql`
      delete from sessions
      where session_id = ${id}
    `);
  },
  cookie: {
    name: "doot_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }
  const user = await db.one<{ user_id: string; username: string }>(sql`
    select
      user_id,
      username
    from users
    where user_id = ${userId}
  `);
  return user;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUser(request);
  if (!session?.user_id || typeof session.user_id !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  debugger;
  return session.user_id;
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
