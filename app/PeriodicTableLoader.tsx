"use client";

import dynamic from "next/dynamic";
import type { Person } from "@/lib/people";

const PeriodicTable = dynamic(() => import("./PeriodicTable"), {
  ssr: false,
});

export default function PeriodicTableLoader({ people }: { people: Person[] }) {
  return <PeriodicTable people={people} />;
}
