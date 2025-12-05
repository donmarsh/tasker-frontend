import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Manage your projects with <span className="text-primary">Tasker</span>
      </h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
        Streamline your workflow, collaborate with your team, and get things done.
        Tasker provides all the tools you need to manage projects efficiently.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">

        <Button variant="outline" size="lg" asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </div>
  );
}
