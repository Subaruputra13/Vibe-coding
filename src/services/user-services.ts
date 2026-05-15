import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

// register user
export const registerUser = async (data: { name: string; email: string; password: string }) => {
  // 1. Cek apakah email sudah terdaftar
  const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password menggunakan Bun.password (default bcrypt)
  const hashedPassword = await Bun.password.hash(data.password);

  // 3. Simpan user ke database
  await db.insert(users).values({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  return { status: "ok" };
};


// login user
export const loginUser = async (data: { email: string; password: string }) => {
  // 1. Cari user berdasarkan email
  const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);

  if (!user) {
    throw new Error("Email atau password salah");
  }

  // 2. Verifikasi password
  const isPasswordValid = await Bun.password.verify(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  // 3. Buat token UUID
  const token = crypto.randomUUID();

  // 4. Simpan sesi ke database
  await db.insert(sessions).values({
    token: token,
    userId: user.id,
  });

  return token;
};

export const getCurrentUser = async (token: string) => {
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!result) {
    throw new Error("Unauthorized");
  }

  return result;
};

export const logoutUser = async (token: string) => {
  const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.delete(sessions).where(eq(sessions.token, token));

  return "Berhasil Logout";
};
