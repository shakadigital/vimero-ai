import { OnboardingForm } from "@/components/business/onboarding-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Jika sudah memiliki bisnis, arahkan ke dashboard
  const { data: memberships } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .limit(1)

  if (memberships && memberships.length > 0) {
    redirect(`/dashboard/${memberships[0].business_id}`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-background">
      <div className="w-full max-w-md">
        <OnboardingForm />
      </div>
    </div>
  )
}
