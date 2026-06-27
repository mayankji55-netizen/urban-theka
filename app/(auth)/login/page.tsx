import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <AuthForm mode="login" />
    </main>
  );
}
