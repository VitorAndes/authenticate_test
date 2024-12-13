import axios, { type AxiosHeaders } from "axios";

import { HomePage } from "@/components/home/Home";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
export default async function Home() {
  try {
    const response = await axios.get(`${process.env.API_URL}/login`, {
      headers: {
        ...headers(),
      } as unknown as AxiosHeaders,
      withCredentials: true,
    });

    if (response.status === 200) {
      console.log("Autenticação bem-sucedida");
    } else {
      console.log("Autenticação falhou com status", response.status);
      redirect("/login");
    }
  } catch (error) {
    console.log(`Erro na autenticação: ${error})`);
    redirect("/login");
  }

  return <HomePage />;
}
