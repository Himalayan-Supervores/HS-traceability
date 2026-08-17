import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password format" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const admin = await db.adminUser.findUnique({ where: { email } });

  // Constant-shape response whether the email exists or not, to avoid
  // leaking which admin emails are registered.
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  const token = await createSessionToken({ sub: admin.id, email: admin.email, name: admin.name });
  await db.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

  const res = NextResponse.json({ ok: true, name: admin.name });
  res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res;
}
