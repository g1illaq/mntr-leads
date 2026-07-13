"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.AUTH_PASSWORD;

  if (!expected || password !== expected) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set("session", expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
