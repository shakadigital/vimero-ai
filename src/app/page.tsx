import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4 text-center">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight">
          VIMERO <br />
          <span className="text-primary text-3xl font-semibold mt-2 block">AI Content Studio Personal</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Buat ide, naskah, audio, visual, dan video dari satu workspace pribadi yang cepat, fokus, dan siap dipakai setiap hari.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Masuk ke Workspace
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" variant="outline" className="px-8">
              Daftar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
