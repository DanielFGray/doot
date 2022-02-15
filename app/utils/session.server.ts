import argon from "argon2";
import { createSessionStorage, redirect, SessionData } from "remix";

import { db, sql } from "./db.server";

type RegisterForm = {
  username: string;
  email: string;
  password: string;
};

type LoginForm = {
  username: string;
  password: string;
};

export async function register({ username, email, password }: RegisterForm) {
  const passwordHash = await argon.hash(password);
  try {
    const user = await db.one(sql`
      insert into users (username, email, password)
      values (${username}, ${email}, ${passwordHash})
      returning user_id, username
    `);
    return user;
  } catch (err) {
    if (err.originalError?.code === "23505") {
      return null;
    }
    throw err;
  }
}

export async function login({ username, password }: LoginForm) {
  const user = await db.maybeOne(
    username.includes("@")
      ? sql`select * from users where email = ${username}`
      : sql`select * from users where username = ${username}`
  );
  if (!user) return null;
  if (!(await argon.verify(user.password as string, password))) return null;
  return { id: user.user_id, username };
}

const sessionSecret = process.env.SECRET;
if (!sessionSecret) {
  throw new Error("environment variable SECRET must be set");
}

const storage = createSessionStorage({
  async createData(data, expires) {
    try {
      const {
        rows: [session],
      } = await db.query(sql`
        insert into sessions (data, expires)
        values (${JSON.stringify(data)}, ${expires?.toJSON() ?? null})
        returning session_id
      `);
      return session.session_id as string;
    } catch (err) {
      throw err;
    }
  },
  async readData(sessionId) {
    const result = await db.maybeOne(sql`
      select data from sessions
      where session_id = ${sessionId}
    `);
    return result?.data as SessionData
  },
  async updateData(id, data, expires) {
    await db.query(sql`
      update sessions
      set data = ${JSON.stringify(data)}, expires = ${expires?.toJSON() ?? null}
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

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await db.one(sql`
      select
        user_id,
        username
      from users
      where user_id = ${userId}
    `);
    return user;
  } catch (err) {
    console.log(err);
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
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
