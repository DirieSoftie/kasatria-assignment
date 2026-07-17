import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">Signed in</h1>
        <UserButton />
      </div>
    </main>
  );
}
