import { UserButton } from "@clerk/nextjs";
import PeriodicTableLoader from "./PeriodicTableLoader";
import { getPeople } from "@/lib/people";

export default async function Home() {
  const people = await getPeople();

  return (
    <>
      <PeriodicTableLoader people={people} />
      <div className="fixed top-4 right-4 z-10">
        <UserButton />
      </div>
    </>
  );
}
