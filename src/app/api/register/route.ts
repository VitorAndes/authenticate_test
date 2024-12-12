import { PrismaGetInstance } from "@/lib/prisma-pg";
import type { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcrypt from "bcrypt";
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

export async function POST(req: Request) {
  const body = (await req.json()) as RegisterProps;

  const { email, password, password2 } = body;

  if (!email || !password || !password2) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const emailReg = new RegExp(
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
  );

  if (!emailReg.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  if (password.length < 8 || password !== password2) {
    return NextResponse.json({ error: "invalid password" }, { status: 400 });
  }

  const hash = bcrypt.hashSync(password, 12);

  const prisma = PrismaGetInstance();

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
      },
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }
    }
  }
}
