import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-background">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  )
}
