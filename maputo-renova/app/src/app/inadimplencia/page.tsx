import type { Metadata } from "next";
import { Suspense } from "react";
import { Arrears } from "@/components/arrears";

export const metadata: Metadata = { title: "Inadimplência" };

export default function Page() {
  return (
    <Suspense>
      <Arrears />
    </Suspense>
  );
}
