import type { Metadata } from "next";
import { PaymentsPage } from "@/components/payments-page";

export const metadata: Metadata = { title: "Pagamentos" };

export default function Page() {
  return <PaymentsPage />;
}
