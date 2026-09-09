import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-background">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
