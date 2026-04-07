import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Page() {
  return (
    <main className="relative flex min-h-svh w-full items-center justify-center bg-background p-6 text-foreground md:p-10">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </main>
  )
}
