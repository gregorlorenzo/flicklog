import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <Film className="h-16 w-16 text-flicklog-accent-teal" />
        <h1 className="font-heading text-4xl font-bold">Flicklog</h1>
        <p className="text-lg text-muted-foreground">
          The cozy, minimal movie scrapbook.
        </p>
        <div className="mt-6 flex gap-4">
          <Button>Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
        </div>
      </div>
    </main>
  );
}