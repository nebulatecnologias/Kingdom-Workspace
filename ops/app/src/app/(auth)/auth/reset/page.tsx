import type { Metadata } from "next";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Nova palavra-passe" };

export default function ResetPage() {
  return (
    <div className="auth" style={{ background: "var(--ground)" }}>
      <ResetForm />
    </div>
  );
}
