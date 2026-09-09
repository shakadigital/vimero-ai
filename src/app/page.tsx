import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4 text-center">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight">
          VIMERO <br />
          <span className="text-primary text-3xl font-semibold mt-2 block">AI-Powered Business Command Center</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Kelola strategi, konten, dan analitik bisnis digital Anda dalam satu pusat kendali yang digerakkan oleh kecerdasan buatan.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Masuk ke Dasbor
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" variant="outline" className="px-8">
              Mendaftar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
