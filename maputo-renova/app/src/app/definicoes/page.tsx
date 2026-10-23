import type { Metadata } from "next";
import { Later } from "@/components/later";

export const metadata: Metadata = { title: "Definições" };

export default function Page() {
  return (
    <Later
      title="Definições"
      subtitle="Empresa, utilizadores, canais de pagamento e regras de cobrança."
      items={[
        "Dados fiscais da Maputo Renova (NUIT, série de facturação).",
        "Utilizadores e permissões: equipa financeira, administradores por condomínio, condóminos.",
        "Ligação às contas M-Pesa e e-Mola da empresa e ao extracto bancário.",
        "Regras de reconciliação, tolerâncias de valor e juros de mora.",
        "Modelos de SMS, WhatsApp e email.",
      ]}
    />
  );
}
