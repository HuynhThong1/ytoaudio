import { ConverterForm } from '@/components/ConverterForm';
import { Music2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Music2 className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            YouTube to Audio
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert and download your favorite YouTube videos to high-quality MP3, M4A, and more. Fast, free, and simple.
          </p>
        </div>

        <ConverterForm />
      </div>

      <footer className="mt-16 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} YT to MP3. Built with Next.js & Tailwind.</p>
      </footer>
    </main>
  );
}
