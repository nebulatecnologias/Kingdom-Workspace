import type { Metadata } from "next";
import { Reconciliation } from "@/components/reconciliation";

export const metadata: Metadata = { title: "Reconciliação" };

export default function Page() {
  return <Reconciliation />;
}
