"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signInAction, signUpAction } from "@/actions/auth";

type Props = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: Props) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Welcome back" : "Create your restaurant account"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Input name="email" type="email" placeholder="owner@restaurant.com" required />
          <Input name="password" type="password" placeholder="Password" minLength={8} required />
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button className="w-full" disabled={pending}>
            {pending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? "New here?" : "Already onboarded?"}{" "}
          <Link className="font-semibold text-primary" href={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Create account" : "Sign in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
