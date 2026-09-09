import { PageContainer } from '@/components/dashboard/page-container'

export default function GoalsPage() {
  return (
    <PageContainer
      title="Target & Goals"
      description="Kelola objektif dan target bisnis Anda."
    >
      <div className="rounded-md border p-8 text-center text-muted-foreground bg-card">
        Belum ada tujuan bisnis yang ditentukan.
      </div>
    </PageContainer>
  )
}
