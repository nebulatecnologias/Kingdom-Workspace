import type { Metadata } from "next";
import { Billing } from "@/components/billing";

export const metadata: Metadata = { title: "Facturação" };

export default function Page() {
  return <Billing />;
}
