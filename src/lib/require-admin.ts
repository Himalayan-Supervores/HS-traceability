import { NextResponse } from "next/server";
import { getCurrentAdmin, type SessionPayload } from "./auth";

/**
 * Call at the top of any mutating (or otherwise private) API route.
 * Returns the verified admin session, or a 401 NextResponse to return
 * immediately from the route handler.
 */
export async function requireAdmin(): Promise<SessionPayload | NextResponse> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return admin;
}

export function isUnauthorized(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}
