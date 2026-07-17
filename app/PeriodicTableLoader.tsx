"use client";

import dynamic from "next/dynamic";

const PeriodicTable = dynamic(() => import("./PeriodicTable"), {
  ssr: false,
});

export default function PeriodicTableLoader() {
  return <PeriodicTable />;
}
