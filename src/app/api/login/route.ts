"use server";

import { GenerateSession } from "@/lib/generate-session";
import { PrismaGetInstance } from "@/lib/prisma-pg";
import bcrypt from "bcrypt";
import { addHours } from "date-fns";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

interface LoginProps {
  email: string;
  password: string;
}

export interface LoginResponse {
  session: string;
}

// export const revalidate = 0;

export async function GET(request: NextRequest) {
  const cookiesStore = await cookies();
  const authCookie = cookiesStore.get("auth-session");

  const sessionToken = authCookie?.value;
  console.log(`cookies${sessionToken}`);

  const prisma = PrismaGetInstance();
  const session = await prisma.sessions.findFirst({
    where: {
      token: sessionToken,
    },
  });

  if (!session || !session.valid || session.expiresAt < new Date()) {
    return NextResponse.json({}, { status: 401 });
  }

  return NextResponse.json({ session: "foi" }, { status: 200 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginProps;

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json<LoginResponse>({ session: "" }, { status: 400 });
  }

  try {
    const prisma = PrismaGetInstance();

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email,
      },
    });

    const userPassword = user.password;
    const passwordResult = bcrypt.compareSync(password, userPassword);

    if (!passwordResult) {
      return NextResponse.json<LoginResponse>({ session: "" }, { status: 400 });
    }

    const sessionToken = GenerateSession({
      email,
      passwordHash: userPassword,
    });

    await prisma.sessions.create({
      data: {
        userId: user.id,
        token: sessionToken,
        valid: true,
        expiresAt: addHours(new Date(), 24),
      },
    });
    const cookiesStore = await cookies();

    cookiesStore.set({
      name: "auth-session",
      value: sessionToken,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: addHours(new Date(), 24),
      path: "/",
    });

    return NextResponse.json({ session: "dfasdfas" }, { status: 200 });
  } catch (error) {
    return NextResponse.json<LoginResponse>({ session: "" }, { status: 400 });
  }
}
