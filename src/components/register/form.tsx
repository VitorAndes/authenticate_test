"use client";

import type { RegisterResponse } from "@/app/api/register/route";
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
import axios, { AxiosError } from "axios";
import { LoaderPinwheel } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useRef, useState } from "react";

export function RegisterForm() {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const password2InputRef = useRef<HTMLInputElement>(null);

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleRegisterSubmmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError("");
      setFormLoading(true);

      const emailReg = new RegExp(
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
      );

      if (
        emailInputRef.current &&
        passwordInputRef.current &&
        password2InputRef.current
      ) {
        const email = emailInputRef.current.value;
        const pass = passwordInputRef.current.value;
        const pass2 = password2InputRef.current.value;

        let shouldReturnError = false;

        if (!emailReg.test(email)) {
          setFormError("Digite um email válido");
          shouldReturnError = true;
        }

        if (pass.length < 8) {
          setFormError("A senha precisa ter pelo menos 8 caracteres");
          shouldReturnError = true;
        }

        if (pass !== pass2) {
          setFormError("As senhas não são iguais.");
          shouldReturnError = true;
        }

        if (shouldReturnError) {
          setFormLoading(false);
          setFormSuccess(false);
          return;
        }

        try {
          const response = await axios.post<RegisterResponse>("/api/register", {
            email,
            password: pass,
            password2: pass2,
          });

          setFormLoading(false);
          setFormSuccess(true);
        } catch (error) {
          if (error instanceof AxiosError) {
            const { error: errorMessage } = error.response
              ?.data as RegisterResponse;
            if (errorMessage === "User already exists") {
              setFormError(
                "Esse e-mail já está cadastrado. Tente ir para o login"
              );
            } else {
              setFormError(errorMessage || error.message);
            }
          }
          setFormLoading(false);
          setFormSuccess(false);
        }
      }
    },
    []
  );

  return (
    <form action="" onSubmit={(event) => handleRegisterSubmmit(event)}>
      <Card className="w-full max-w-sm m-auto mt-5">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>Insira seus dados para se cadastrar</CardDescription>
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Repita a senha</Label>
              </div>
              <Input
                id="password2"
                type="password2"
                ref={password2InputRef}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col  ">
          <div>
            {formError && (
              <p className="text-sm font-semibold mb-4">
                Erro no formulário:{" "}
                <span className="font-normal text-red-500">{formError}</span>
              </p>
            )}

            {formSuccess && (
              <p className="text-sm font-semibold text-lime-500 mb-4">
                cadastro realizado com sucesso
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={formLoading}
            className="w-full flex items-center gap-2"
          >
            {formLoading && <LoaderPinwheel size={18} />}
            Cadastrar
          </Button>
          <Link href="/login" className="mt-4 underline text-center">
            Ir para o Login
          </Link>
        </CardFooter>
      </Card>
    </form>
  );
}
