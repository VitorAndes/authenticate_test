"use client";

import type { LoginResponse } from "@/app/api/login/route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { LoaderPinwheel } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useRef, useState } from "react";

export function LoginForm() {
  const router = useRouter();

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const handleLoginSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError("");
      setFormLoading(true);

      if (emailInputRef.current && passwordInputRef.current) {
        const email = emailInputRef.current.value;
        const pass1 = passwordInputRef.current.value;

        try {
          const response = await axios.post<LoginResponse>("/api/login", {
            email,
            password: pass1,
          });

          router.push("/home");

          setFormLoading(false);
        } catch (error) {
          setFormError("login invalid");
          setFormLoading(false);
        }
      }
    },
    [router]
  );

  return (
    <form action="" onSubmit={(event) => handleLoginSubmit(event)}>
      <Card className="w-full max-w-sm m-auto mt-5">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Insira seus dados para entrar na conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                ref={emailInputRef}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                ref={passwordInputRef}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col  ">
          <div>
            {formError && (
              <p className="text-sm font-semibold mb-4">
                Erro no Login:{" "}
                <span className="font-normal text-red-500">
                  Verifique suas credenciais
                </span>
              </p>
            )}
          </div>
          <Button
            disabled={formLoading}
            className="w-full flex items-center gap-2"
          >
            {formLoading && (
              <LoaderPinwheel size={18} className="animate-spin" />
            )}
            Entrar
          </Button>
          <Link href="/cadastro" className="mt-4 underline text-center">
            Ir para o cadastro
          </Link>
        </CardFooter>
      </Card>
    </form>
  );
}
