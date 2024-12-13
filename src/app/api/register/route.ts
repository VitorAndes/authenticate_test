"use server";

import { GenerateSession } from "@/lib/generate-session";
import { PrismaGetInstance } from "@/lib/prisma-pg";
import type { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcrypt from "bcrypt";
import { addHours } from "date-fns";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RegisterProps {
  email: string;
  password: string;
  password2: string;
}

export interface RegisterResponse {
  error?: string;
  user?: User;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterProps;

  const { email, password, password2 } = body;

  if (!email || !password || !password2) {
    return NextResponse.json(
      { error: "missing required fields" },
      { status: 400 }
    );
  }

  const emailReg =
    /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

  if (!emailReg.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  if (password.length < 8 || password !== password2) {
    return NextResponse.json({ error: "invalid password" }, { status: 400 });
  }

  const hash = bcrypt.hashSync(password, 12);

  try {
    const prisma = PrismaGetInstance();

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
      },
    });

    const sessionToken = GenerateSession({
      email,
      passwordHash: hash,
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

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // usuário já existe
        return NextResponse.json(
          { error: "user already exists" },
          { status: 400 }
        );
      }
    }
  }
}
