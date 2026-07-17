import { UserButton } from "@clerk/nextjs";
import PeriodicTableLoader from "./PeriodicTableLoader";

export default function Home() {
  return (
    <>
      <PeriodicTableLoader />
      <div className="fixed top-4 right-4 z-10">
        <UserButton />
      </div>
    </>
  );
}
