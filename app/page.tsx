// app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="max-w-3xl w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Bienvenue sur mon site personnel
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          En cours de construction avec Next.js et Supabase.
        </p>
      </main>
    </div>
  );
}